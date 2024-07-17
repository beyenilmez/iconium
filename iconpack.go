package main

import (
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	lnk "github.com/parsiya/golnk"
)

type FileInfo struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Path        string `json:"path"`
	Destination string `json:"destinationPath"`
	Extension   string `json:"extension"`
	HasIcon     bool   `json:"hasIcon"`
}

type Metadata struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Version string `json:"version"`
	Author  string `json:"author"`
	Icon    string `json:"icon"`
}

type IconPack struct {
	Metadata Metadata         `json:"metadata"`
	Files    []FileInfo       `json:"files"`
	Settings IconPackSettings `json:"settings"`
}

type IconPackSettings struct {
	Enabled      bool `json:"enabled"`
	CornerRadius int  `json:"cornerRadius"`
	Opacity      int  `json:"opacity"`
}

var allowedFileExtensions = []string{".lnk"}

var iconPacks []IconPack

func CreateIconPack(name string, version string, author string, icon string) (IconPack, error) {
	var iconPack IconPack
	iconPack.Metadata.Id = uuid.NewString()
	iconPack.Metadata.Name = name
	iconPack.Metadata.Version = version
	iconPack.Metadata.Author = author
	iconPack.Metadata.Icon = icon
	iconPack.Files = []FileInfo{}

	iconPack.Settings.Enabled = false
	iconPack.Settings.CornerRadius = 0
	iconPack.Settings.Opacity = 100

	err := WriteIconPack(iconPack)

	if err != nil {
		return IconPack{}, err
	}

	return iconPack, err
}

func WriteIconPack(iconPack IconPack) error {
	packPath := path.Join(packsFolder, iconPack.Metadata.Id)
	iconFolderPath := path.Join(packPath, "icons")
	metadataPath := path.Join(packPath, "metadata.json")
	settingsPath := path.Join(packPath, "settings.json")
	filesPath := path.Join(packPath, "files.json")

	// Create necessary folders
	if err := create_folder(packPath); err != nil {
		return err
	}
	if err := create_folder(iconFolderPath); err != nil {
		return err
	}

	// Write metadata and files to their respective JSON files
	if err := writeJSON(metadataPath, iconPack.Metadata); err != nil {
		return err
	}
	if err := writeJSON(settingsPath, iconPack.Settings); err != nil {
		return err
	}
	if err := writeJSON(filesPath, iconPack.Files); err != nil {
		return err
	}

	return nil
}

func ReadIconPack(id string) (IconPack, error) {
	packPath := path.Join(packsFolder, id)
	metadataPath := path.Join(packPath, "metadata.json")
	settingsPath := path.Join(packPath, "settings.json")
	filesPath := path.Join(packPath, "files.json")

	if _, err := os.Stat(packPath); os.IsNotExist(err) {
		return IconPack{}, err
	}

	iconPack := IconPack{}

	// Read metadata and files from their respective JSON files
	if err := readJSON(metadataPath, &iconPack.Metadata); err != nil {
		return IconPack{}, err
	}
	if err := readJSON(settingsPath, &iconPack.Settings); err != nil {
		return IconPack{}, err
	}
	if err := readJSON(filesPath, &iconPack.Files); err != nil {
		return IconPack{}, err
	}

	return iconPack, nil
}

func (a *App) GetIconPack(id string) IconPack {
	iconPack, err := ReadIconPack(id)

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to read icon pack: %s", err.Error()))
		return IconPack{}
	}

	return iconPack
}

func GetIconPackInfo() ([]IconPack, error) {
	files, err := os.ReadDir(packsFolder)
	if err != nil {
		return nil, err
	}

	// Sort files by added date
	sort.Slice(files, func(i, j int) bool {
		infoI, err := os.Stat(path.Join(packsFolder, files[i].Name()))
		if err != nil {
			return false
		}

		infoJ, err := os.Stat(path.Join(packsFolder, files[j].Name()))
		if err != nil {
			return false
		}

		return infoI.ModTime().Before(infoJ.ModTime())
	})

	for _, file := range files {
		if file.IsDir() {
			packPath := path.Join(packsFolder, file.Name())
			metadataPath := path.Join(packPath, "metadata.json")
			settingsPath := path.Join(packPath, "settings.json")

			if _, err := os.Stat(metadataPath); os.IsNotExist(err) {
				continue
			}

			if _, err := os.Stat(settingsPath); os.IsNotExist(err) {
				continue
			}

			var metadata Metadata
			var settings IconPackSettings

			if err := readJSON(metadataPath, &metadata); err != nil {
				return nil, err
			}

			if err := readJSON(settingsPath, &settings); err != nil {
				return nil, err
			}

			iconPacks = append(iconPacks, IconPack{
				Metadata: metadata,
				Settings: settings,
			})
		}
	}

	return iconPacks, nil
}

func (a *App) GetIconPackInfo() []IconPack {
	if iconPacks == nil {
		iconPacks, _ = GetIconPackInfo()
	}

	return iconPacks
}

func (a *App) SetIconPackInfo(iconPack IconPack) {
	metadataFile := path.Join(packsFolder, iconPack.Metadata.Id, "metadata.json")
	settingsFile := path.Join(packsFolder, iconPack.Metadata.Id, "settings.json")

	if err := writeJSON(metadataFile, iconPack.Metadata); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to write metadata file: %s", err.Error()))
	}
	if err := writeJSON(settingsFile, iconPack.Settings); err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to write settings file: %s", err.Error()))
	}

	for i, pack := range iconPacks {
		if pack.Metadata.Id == iconPack.Metadata.Id {
			iconPacks[i] = iconPack
			break
		}
	}
}

func CreateFileInfo(packId string, path string) (FileInfo, error) {
	var fileInfo FileInfo
	fileInfo.Id = uuid.NewString()
	fileInfo.Name = strings.TrimSuffix(filepath.Base(path), filepath.Ext(path))
	fileInfo.Path = ConvertToGeneralPath(path)
	fileInfo.Extension = strings.ToLower(filepath.Ext(path))

	if fileInfo.Extension == ".lnk" {
		link, err := lnk.File(path)
		if err != nil {
			return FileInfo{}, err
		}

		if link.StringData.NameString != "" {
			fileInfo.Description = link.StringData.NameString
		}

		if link.LinkInfo.LocalBasePath != "" {
			fileInfo.Destination = link.LinkInfo.LocalBasePath
		}
		if link.LinkInfo.LocalBasePathUnicode != "" {
			fileInfo.Destination = link.LinkInfo.LocalBasePathUnicode
		}
		fileInfo.Destination = ConvertToGeneralPath(fileInfo.Destination)

		if strings.ToLower(filepath.Ext(link.StringData.IconLocation)) == ".ico" {
			iconPath := filepath.Join(packsFolder, packId, "icons", fileInfo.Id+".png")
			err = ConvertToPng(link.StringData.IconLocation, iconPath)
			if err != nil {
				runtime.LogError(appContext, err.Error())
			} else {
				fileInfo.HasIcon = true
			}
		}

		return fileInfo, nil
	}

	file, err := os.Open(path)
	if err != nil {
		return FileInfo{}, err
	}
	defer file.Close()

	fileStat, err := file.Stat()

	if err != nil {
		return FileInfo{}, err
	}

	if fileStat.IsDir() {
		fileInfo.Extension = "dir"
	}

	if !contains(allowedFileExtensions, fileInfo.Extension) {
		return FileInfo{}, errors.New("file extension not allowed: " + fileInfo.Extension)
	}

	return fileInfo, nil
}

func (a *App) AddIconPack(name string, version string, author string, icon string) error {
	iconPack, err := CreateIconPack(name, version, author, icon)

	if err != nil {
		return err
	}

	iconPacks = append(iconPacks, iconPack)

	return WriteIconPack(iconPack)
}

func (a *App) DeleteIconPack(id string) error {
	iconPackPath := path.Join(packsFolder, id)

	if _, err := os.Stat(iconPackPath); os.IsNotExist(err) {
		return err
	}

	if err := os.RemoveAll(iconPackPath); err != nil {
		return err
	}

	for i, pack := range iconPacks {
		if pack.Metadata.Id == id {
			iconPacks = append(iconPacks[:i], iconPacks[i+1:]...)
			break
		}
	}

	return nil
}

func (a *App) AddFileToIconPackFromPath(id string, path string, save bool) {
	fileInfo, err := CreateFileInfo(id, path)

	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return
	}

	for i, pack := range iconPacks {
		if pack.Metadata.Id == id {
			iconPacks[i].Files = append(iconPacks[i].Files, fileInfo)
			if save {
				WriteIconPack(iconPacks[i])
			}

			return
		}
	}

	runtime.LogError(a.ctx, "icon pack not found")
}

func (a *App) AddFilesToIconPackFromFolder(id string, path string, save bool) {
	files, err := os.ReadDir(path)

	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return
	}

	for _, file := range files {
		a.AddFileToIconPackFromPath(id, path+"\\"+file.Name(), false)
	}

	if save {
		for i, pack := range iconPacks {
			if pack.Metadata.Id == id {
				WriteIconPack(iconPacks[i])
				break
			}
		}
	}
}

func (a *App) AddFilesToIconPackFromDesktop(id string) {
	desktop, public := get_desktop_paths()

	a.AddFilesToIconPackFromFolder(id, desktop, false)
	a.AddFilesToIconPackFromFolder(id, public, true)
}

func (a *App) ApplyIconPack(id string) {
	pack, err := ReadIconPack(id)

	if err != nil {
		runtime.LogError(appContext, err.Error())
		return
	}

	err = pack.Apply()

	if err != nil {
		runtime.LogError(appContext, err.Error())
	}
}

func (pack *IconPack) Apply() error {
	for _, file := range pack.Files {

		if file.HasIcon {
			iconPath := filepath.Join(packsFolder, pack.Metadata.Id, "icons", file.Id+".png")
			if _, err := os.Stat(iconPath); err != nil {
				runtime.LogError(appContext, err.Error())
				continue
			}

			// Copy to icons folder
			targetFolder := filepath.Join(activeIconFolder, pack.Metadata.Id)
			err := create_folder(targetFolder)
			if err != nil {
				runtime.LogError(appContext, err.Error())
				continue
			}
			targetPath := filepath.Join(targetFolder, file.Id+".ico")
			err = ConvertToIco(iconPath, targetPath, pack.Settings)

			if err != nil {
				runtime.LogError(appContext, err.Error())
				continue
			}
		}
	}

	return nil
}

func (a *App) Test() {
	runtime.LogDebugf(a.ctx, ConvertToFullPath("${DESKTOP}/*/../Discord.lnk"))
	runtime.LogDebug(a.ctx, "Desktop paths: "+fmt.Sprint(get_desktop_paths()))
}

func (a *App) Test2() {
	iconPacks, _ = GetIconPackInfo()

	fmt.Println(iconPacks)
}
