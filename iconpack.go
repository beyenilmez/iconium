package main

import (
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"

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
	IconId      string `json:"iconId"`
}

type Metadata struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Version  string `json:"version"`
	Author   string `json:"author"`
	IconName string `json:"iconName"`
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

var iconPackCache map[string]IconPack = map[string]IconPack{}

func CreateIconPack(name string, version string, author string) (IconPack, error) {
	var iconPack IconPack
	iconPack.Metadata.Id = uuid.NewString()
	iconPack.Metadata.Name = name
	iconPack.Metadata.Version = version
	iconPack.Metadata.Author = author
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

	iconPackCache[iconPack.Metadata.Id] = iconPack

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

	iconPackCache[id] = iconPack

	return iconPack, nil
}

func (a *App) GetIconPack(id string) (IconPack, error) {
	if iconPack, ok := iconPackCache[id]; ok {
		return iconPack, nil
	}

	iconPack, err := ReadIconPack(id)

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to read icon pack: %s", err.Error()))
		return IconPack{}, err
	}

	return iconPack, nil
}

func (a *App) SetIconPack(iconPack IconPack) error {
	err := WriteIconPack(iconPack)

	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to write icon pack: %s", err.Error()))
		return err
	}

	return nil
}

func (a *App) SetIconPackField(packId string, fileName string, field string, value interface{}) {
	// Check if the icon pack exists
	iconPack, err := a.GetIconPack(packId)
	if err != nil {
		runtime.LogError(appContext, fmt.Sprintf("Icon pack %s not found: %s", packId, err.Error()))
		return
	}

	packFolder := path.Join(packsFolder, packId)

	// Check if the file exists
	filePath := path.Join(packFolder, fileName)
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		runtime.LogError(appContext, fmt.Sprintf("File %s not found", filePath))
		return
	}

	// Read the file
	var jsonData map[string]interface{}
	err = readJSON(filePath, &jsonData)
	if err != nil {
		runtime.LogError(appContext, fmt.Sprintf("Failed to read file %s: %s", filePath, err.Error()))
		return
	}

	// Set the field
	jsonData[field] = value

	// Write the file
	err = writeJSON(filePath, jsonData)
	if err != nil {
		runtime.LogError(appContext, fmt.Sprintf("Failed to write file %s: %s", filePath, err.Error()))
		return
	}

	// Update cache
	switch fileName {
	case "metadata.json":
		switch field {
		case "id":
			iconPack.Metadata.Id = value.(string)
		case "name":
			iconPack.Metadata.Name = value.(string)
		case "version":
			iconPack.Metadata.Version = value.(string)
		case "author":
			iconPack.Metadata.Author = value.(string)
		}
	case "settings.json":
		switch field {
		case "enabled":
			iconPack.Settings.Enabled = value.(bool)
		case "cornerRadius":
			intVal, err := strconv.Atoi(fmt.Sprintf("%v", value))
			if err != nil {
				runtime.LogWarning(appContext, fmt.Sprintf("Failed to convert %v to int: %s", value, err.Error()))
				return
			}
			iconPack.Settings.CornerRadius = intVal
		case "opacity":
			intVal, err := strconv.Atoi(fmt.Sprintf("%v", value))
			if err != nil {
				runtime.LogWarning(appContext, fmt.Sprintf("Failed to convert %v to int: %s", value, err.Error()))
				return
			}
			iconPack.Settings.Opacity = intVal
		}
	}

	a.SetIconPack(iconPack)
}

func (a *App) SetIconPackMetadata(packId string, metadata Metadata) {
	// Check if the icon pack exists
	iconPack, err := a.GetIconPack(packId)
	if err != nil {
		runtime.LogError(appContext, fmt.Sprintf("Icon pack %s not found: %s", packId, err.Error()))
		return
	}

	tempPackPngPath, ok := tempPngPaths[packId]

	if ok {
		runtime.LogDebugf(appContext, "Copying temp pack png: %s", tempPackPngPath)

		metadata.IconName = uuid.New().String()

		// Copy temp pack png
		err = copy_file(tempPackPngPath, path.Join(packsFolder, iconPack.Metadata.Id, metadata.IconName+".png"))
		if err != nil {
			runtime.LogError(appContext, fmt.Sprintf("Failed to copy temp pack png: %s", err.Error()))
			return
		}

		// Remove temp pack png
		err = os.Remove(tempPackPngPath)
		if err != nil {
			runtime.LogError(appContext, fmt.Sprintf("Failed to remove temp pack png: %s", err.Error()))
			return
		}
		delete(tempPngPaths, packId)

		os.Remove(path.Join(packsFolder, iconPack.Metadata.Id, iconPack.Metadata.IconName+".png"))
	}

	// Update cache
	iconPack.Metadata = metadata
	a.SetIconPack(iconPack)
}

func (a *App) SetIconPackFiles(packId string, files []FileInfo) {
	// Check if the icon pack exists
	iconPack, err := a.GetIconPack(packId)
	if err != nil {
		runtime.LogError(appContext, fmt.Sprintf("Icon pack %s not found: %s", packId, err.Error()))
		return
	}

	for _, file := range files {
		file.HasIcon = false

		tempPngPath, ok := tempPngPaths[file.Id]
		if ok {
			runtime.LogDebugf(appContext, "Attempting to copy temp png: %s", tempPngPath)

			// Copy temp png
			err = copy_file(tempPngPath, path.Join(packsFolder, packId, "icons", file.Id+".png"))
			if err != nil {
				runtime.LogError(appContext, fmt.Sprintf("Failed to copy temp png: %s", err.Error()))
				continue
			}

			// Remove temp png
			err = os.Remove(tempPngPath)
			if err != nil {
				runtime.LogError(appContext, fmt.Sprintf("Failed to remove temp png: %s", err.Error()))
				continue
			}
			delete(tempPngPaths, file.Id)

			file.HasIcon = true
		}
	}

	// Update cache
	iconPack.Files = files
	a.SetIconPack(iconPack)
}

func CacheIconPacks() error {
	// Clear cache
	for k := range iconPackCache {
		delete(iconPackCache, k)
	}

	files, err := os.ReadDir(packsFolder)
	if err != nil {
		return err
	}

	for _, file := range files {
		if file.IsDir() {
			iconPack, err := ReadIconPack(file.Name())

			if err != nil {
				runtime.LogWarningf(appContext, fmt.Sprintf("Failed to read icon pack (%s): %s", file.Name(), err.Error()))
				continue
			}

			iconPackCache[iconPack.Metadata.Id] = iconPack
		}
	}

	return nil
}

func (a *App) GetIconPackList() []IconPack {
	if len(iconPackCache) == 0 {
		CacheIconPacks()
	}

	iconPacks := make([]IconPack, 0, len(iconPackCache))

	for _, iconPack := range iconPackCache {
		iconPacks = append(iconPacks, iconPack)
	}

	// Sort icon packs by name
	sort.Slice(iconPacks, func(i, j int) bool {
		return iconPacks[i].Metadata.Name < iconPacks[j].Metadata.Name
	})

	return iconPacks
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

		if packId != "" && strings.ToLower(filepath.Ext(link.StringData.IconLocation)) == ".ico" {
			runtime.LogDebugf(appContext, "Attempting to copy icon: %s", link.StringData.IconLocation)

			if packId == "temp" {
				tempName := "iconium-" + uuid.NewString()
				iconPath := filepath.Join(tempFolder, tempName+".png")

				err = ConvertToPng(link.StringData.IconLocation, iconPath)
				if err != nil {
					runtime.LogError(appContext, err.Error())
				} else {
					fileInfo.HasIcon = true
					tempPngPaths[fileInfo.Id] = iconPath
				}
			} else {
				iconPath := filepath.Join(packsFolder, packId, "icons", fileInfo.Id+".png")
				err = ConvertToPng(link.StringData.IconLocation, iconPath)
				if err != nil {
					runtime.LogError(appContext, err.Error())
				} else {
					fileInfo.HasIcon = true
				}
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

func GetAppliedIcon(path string) (string, error) {
	link, err := lnk.File(path)

	if err != nil {
		return "", fmt.Errorf("failed to open .lnk file: %s", err.Error())
	}

	if link.StringData.IconLocation != "" {
		return link.StringData.IconLocation, nil
	}

	return "", errors.New("icon not found")
}

func (a *App) AddIconPack(name string, version string, author string) error {
	iconPack, err := CreateIconPack(name, version, author)
	if err != nil {
		return err
	}

	tempPackPngPath, ok := tempPngPaths["temp"]

	if ok {
		runtime.LogDebug(appContext, "Adding pack png for "+iconPack.Metadata.Id)

		iconPack.Metadata.IconName = uuid.NewString()

		// Copy temp pack png
		err = copy_file(tempPackPngPath, path.Join(packsFolder, iconPack.Metadata.Id, iconPack.Metadata.IconName+".png"))
		if err != nil {
			return err
		}

		// Remove temp pack png
		err = os.Remove(tempPackPngPath)
		if err != nil {
			return err
		}
		delete(tempPngPaths, "temp")

		a.SetIconPack(iconPack)
	}

	return nil
}

func (a *App) DeleteIconPack(id string, deleteGeneratedIcons bool) error {
	iconPackPath := path.Join(packsFolder, id)

	if _, err := os.Stat(iconPackPath); os.IsNotExist(err) {
		return err
	}
	if err := os.RemoveAll(iconPackPath); err != nil {
		return err
	}

	if deleteGeneratedIcons {
		activeIconsPath := path.Join(activeIconFolder, id)
		if _, err := os.Stat(activeIconsPath); os.IsNotExist(err) {
			return err
		}
		if err := os.RemoveAll(activeIconsPath); err != nil {
			return err
		}
	}

	delete(iconPackCache, id)

	return nil
}

func (a *App) AddFileToIconPackFromPath(id string, path string, save bool) {
	fileInfo, err := CreateFileInfo(id, path)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return
	}

	cachedPack, err := a.GetIconPack(id)
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to read icon pack: %s", err.Error()))
		return
	}
	cachedPack.Files = append(cachedPack.Files, fileInfo)

	iconPackCache[id] = cachedPack

	if save {
		a.SetIconPack(cachedPack)
		return
	}

	runtime.LogError(a.ctx, "icon pack not found")
}

func (a *App) AddFilesToIconPackFromPath(id string, path []string, save bool) {
	for _, p := range path {
		a.AddFileToIconPackFromPath(id, p, false)
	}

	if save {
		a.SetIconPack(iconPackCache[id])
	}
}

func (a *App) GetFileInfoFromPaths(id string, path []string) ([]FileInfo, error) {
	var fileInfos []FileInfo
	for _, p := range path {
		if !contains(allowedFileExtensions, filepath.Ext(p)) {
			continue
		}

		fileInfo, err := CreateFileInfo(id, p)
		if err != nil {
			return nil, err
		}
		fileInfos = append(fileInfos, fileInfo)
	}
	return fileInfos, nil
}

func (a *App) GetFileInfoFromDesktop(id string) ([]FileInfo, error) {
	desktop, public := get_desktop_paths()

	dirEntries, err := os.ReadDir(desktop)
	if err != nil {
		return nil, err
	}
	dirEntries2, err := os.ReadDir(public)
	if err != nil {
		return nil, err
	}

	paths := []string{}

	for _, dirEntry := range dirEntries {
		if contains(allowedFileExtensions, filepath.Ext(dirEntry.Name())) {
			paths = append(paths, filepath.Join(desktop, dirEntry.Name()))
		}
	}
	for _, dirEntry := range dirEntries2 {
		if contains(allowedFileExtensions, filepath.Ext(dirEntry.Name())) {
			paths = append(paths, filepath.Join(public, dirEntry.Name()))
		}
	}

	return a.GetFileInfoFromPaths(id, paths)
}

func (a *App) AddFilesToIconPackFromFolder(id string, path string, save bool) {
	files, err := os.ReadDir(path)
	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return
	}

	var wg sync.WaitGroup

	for _, file := range files {
		wg.Add(1)
		go func(file os.DirEntry) {
			defer wg.Done()
			a.AddFileToIconPackFromPath(id, path+"\\"+file.Name(), false)
		}(file)
	}

	wg.Wait()

	if save {
		runtime.LogInfo(a.ctx, fmt.Sprintf("Saving icon pack %s", id))

		err = a.SetIconPack(iconPackCache[id])
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
		}
	}
}

func (a *App) AddFilesToIconPackFromDesktop(id string) {
	desktop, public := get_desktop_paths()

	a.AddFilesToIconPackFromFolder(id, desktop, false)
	a.AddFilesToIconPackFromFolder(id, public, true)
}

func (a *App) ApplyIconPack(id string) {
	pack, err := a.GetIconPack(id)

	if err != nil {
		runtime.LogError(appContext, err.Error())
		return
	}

	err = pack.Apply()

	// Save icon pack
	if err == nil {
		runtime.LogInfo(appContext, fmt.Sprintf("Applied icon pack %s, attempting to save", pack.Metadata.Id))
		err = a.SetIconPack(pack)

		if err == nil {
			runtime.LogInfo(appContext, fmt.Sprintf("Saved icon pack %s", pack.Metadata.Id))
		} else {
			runtime.LogError(appContext, err.Error())
		}
	} else {
		runtime.LogError(appContext, err.Error())
	}
}

func (pack *IconPack) Apply() error {
	targetFolder := filepath.Join(activeIconFolder, pack.Metadata.Id)
	err := create_folder(targetFolder)
	if err != nil {
		return err
	}

	var wg sync.WaitGroup

	for i := range pack.Files {
		wg.Add(1)

		// Use a pointer to the file in the slice
		file := &pack.Files[i]

		go func(file *FileInfo) {
			defer wg.Done()

			match := file.MatchFile()
			runtime.LogDebug(appContext, "Match: "+match)

			if file.HasIcon && match != "" {
				targetPath := filepath.Join(targetFolder, file.IconId+".ico")

				targetPathExists := false
				if _, err := os.Stat(targetPath); err == nil {
					targetPathExists = true
				}

				// Regenerate
				if !targetPathExists || !pack.IsApplied() {
					if targetPathExists {
						err = os.Remove(targetPath)
						if err != nil {
							runtime.LogWarningf(appContext, "Failed to remove old icon %s: %s", targetPath, err.Error())
						}
					}

					// Update the IconId directly on the file pointer
					file.IconId = uuid.NewString()
					targetPath = filepath.Join(targetFolder, file.IconId+".ico")

					iconPath := filepath.Join(packsFolder, pack.Metadata.Id, "icons", file.Id+".png")
					if _, err := os.Stat(iconPath); err != nil {
						runtime.LogError(appContext, err.Error())
						return
					}
					err = ConvertToIco(iconPath, targetPath, pack.Settings)

					if err != nil {
						runtime.LogError(appContext, err.Error())
						return
					}
				}

				appliedIconPath, err := GetAppliedIcon(match)
				if err != nil {
					runtime.LogWarningf(appContext, "Failed to get applied icon for %s: %s", match, err.Error())
				}
				runtime.LogDebug(appContext, "Applied icon path: "+appliedIconPath)

				if appliedIconPath == targetPath {
					runtime.LogDebug(appContext, "Icon already applied")
				} else {
					runtime.LogDebug(appContext, "Applying icon")

					err = SetIcon(match, targetPath)
					if err != nil {
						runtime.LogWarningf(appContext, "Failed to set icon for %s: %s", match, err.Error())
					}
				}
			}
		}(file)
	}

	wg.Wait()

	// Copy settings.json to apply.json
	settingsPath := filepath.Join(packsFolder, pack.Metadata.Id, "settings.json")
	applyPath := filepath.Join(packsFolder, pack.Metadata.Id, "apply.json")
	err = copy_file(settingsPath, applyPath)
	if err != nil {
		runtime.LogError(appContext, err.Error())
		return err
	}

	return nil
}

func (pack *IconPack) IsApplied() bool {
	applyPath := filepath.Join(packsFolder, pack.Metadata.Id, "apply.json")

	if _, err := os.Stat(applyPath); os.IsNotExist(err) {
		return false
	}

	var apply IconPackSettings
	err := readJSON(applyPath, &apply)
	if err != nil {
		runtime.LogError(appContext, err.Error())
		return false
	}

	return apply.CornerRadius == pack.Settings.CornerRadius && apply.Opacity == pack.Settings.Opacity
}

func (fileInfo *FileInfo) MatchFile() string {
	pathPattern := fileInfo.Path
	path := ConvertToFullPath(pathPattern)
	if path != "" {
		if *config.RenameMatchedFiles && fileInfo.Name != filepath.Base(path) {
			newPath := filepath.Join(filepath.Dir(path), fileInfo.Name+fileInfo.Extension)
			os.Rename(path, newPath)
			path = newPath
		}

		return path
	}

	if *config.MatchByDestination {
		pathDir := ConvertToFullPath(filepath.Dir(pathPattern))

		files, err := os.ReadDir(pathDir)
		if err != nil {
			runtime.LogError(appContext, err.Error())
			return ""
		}

		for _, file := range files {
			if filepath.Ext(file.Name()) == filepath.Ext(pathPattern) {
				currentFilePath := filepath.Join(pathDir, file.Name())
				currentFileInfo, err := CreateFileInfo("", currentFilePath)
				if err != nil {
					runtime.LogError(appContext, err.Error())
					return ""
				}
				if currentFileInfo.Destination == fileInfo.Destination {
					runtime.LogDebug(appContext, "Matched file: "+currentFilePath)

					if *config.RenameMatchedFiles && currentFileInfo.Name != fileInfo.Name {
						newPath := filepath.Join(pathDir, fileInfo.Name+fileInfo.Extension)
						os.Rename(currentFilePath, newPath)
						currentFilePath = newPath
						runtime.LogDebug(appContext, "Renamed file: "+currentFilePath)
					}

					return currentFilePath
				}
			}
		}
	}

	return ""
}

func SetIcon(path string, iconPath string) error {
	switch filepath.Ext(path) {
	case ".lnk":
		_, err := sendCommand("cscript.exe", setLnkIconScriptPath, filepath.Dir(path), filepath.Base(path), iconPath, "0")

		if err != nil {
			return err
		}

		runtime.LogDebug(appContext, "Applied icon: "+iconPath)
		return nil
	}

	return errors.New("unsupported file type")
}
