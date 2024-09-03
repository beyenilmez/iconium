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
	"sync/atomic"
	"syscall"
	"time"

	"github.com/go-ole/go-ole"
	"github.com/go-ole/go-ole/oleutil"
	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/ini.v1"

	cmap "github.com/orcaman/concurrent-map/v2"
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
	Id          string `json:"id"`
	Name        string `json:"name"`
	Version     string `json:"version"`
	Author      string `json:"author"`
	License     string `json:"license"`
	Description string `json:"description"`
	IconName    string `json:"iconName"`
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

var allowedFileExtensions = []string{".lnk", ".dir", ".url"}

var iconPackCache = cmap.New[IconPack]()

func CreateIconPack(name string, version string, author string, license string, description string) (IconPack, error) {
	var iconPack IconPack
	iconPack.Metadata.Id = uuid.NewString()
	iconPack.Metadata.Name = name
	iconPack.Metadata.Version = version
	iconPack.Metadata.Author = author
	iconPack.Metadata.License = license
	iconPack.Metadata.Description = description
	iconPack.Files = []FileInfo{}

	iconPack.Settings.Enabled = false
	iconPack.Settings.CornerRadius = 0
	iconPack.Settings.Opacity = 100

	var err error

	if name != "Unknown Pack" {
		err = WriteIconPack(iconPack)
		if err != nil {
			return IconPack{}, err
		}
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

	iconPackCache.Set(iconPack.Metadata.Id, iconPack)

	return nil
}

func ReadIconPack(id string) (IconPack, error) {
	packPath := path.Join(packsFolder, id)
	iconFolderPath := path.Join(packPath, "icons")
	metadataPath := path.Join(packPath, "metadata.json")
	settingsPath := path.Join(packPath, "settings.json")
	filesPath := path.Join(packPath, "files.json")

	if _, err := os.Stat(packPath); os.IsNotExist(err) {
		return IconPack{}, err
	}

	iconPack := IconPack{}

	defaultPack, err := CreateIconPack("Unknown Pack", "v1.0.0", "", "", "")
	if err != nil {
		runtime.LogWarningf(appContext, "Failed to create default icon pack: %s", err.Error())
		return IconPack{}, err
	}

	// Read metadata and files from their respective JSON files
	if err := readJSON(metadataPath, &iconPack.Metadata); err != nil {
		runtime.LogErrorf(appContext, "Failed to read icon pack metadata: %s", err.Error())
		iconPack.Metadata = defaultPack.Metadata
	}

	metadataChange := false
	if iconPack.Metadata.Id != id {
		iconPack.Metadata.Id = id
		metadataChange = true
	}
	iconPath := filepath.Join(packsFolder, iconPack.Metadata.Id, iconPack.Metadata.IconName+".png")
	if iconPack.Metadata.IconName != "" && !exists(iconPath) {
		iconPack.Metadata.IconName = ""
		metadataChange = true
	}
	if metadataChange {
		writeJSON(metadataPath, iconPack.Metadata)
	}

	if err := readJSON(settingsPath, &iconPack.Settings); err != nil {
		runtime.LogWarningf(appContext, "Failed to read icon pack settings: %s", err.Error())
		iconPack.Settings = defaultPack.Settings
		writeJSON(settingsPath, iconPack.Settings)
	}
	if err := readJSON(filesPath, &iconPack.Files); err != nil {
		runtime.LogWarningf(appContext, "Failed to read icon pack files: %s", err.Error())
		iconPack.Files = []FileInfo{}
		writeJSON(filesPath, iconPack.Files)
	}

	// Create necessary folders
	if err := create_folder(iconFolderPath); err != nil {
		return IconPack{}, err
	}

	iconPackCache.Set(id, iconPack)

	return iconPack, nil
}

func (a *App) GetIconPack(id string) (IconPack, error) {
	if iconPack, ok := iconPackCache.Get(id); ok {
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
		case "description":
			iconPack.Metadata.Description = value.(string)
		case "iconName":
			iconPack.Metadata.IconName = value.(string)
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

	tempPackPngPath, ok := tempPngPaths.Get(packId)

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
		tempPngPaths.Remove(packId)

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

	for i, file := range files {
		tempPngPath, ok := tempPngPaths.Get(file.Id)
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
			tempPngPaths.Remove(file.Id)
		}

		iconPath := filepath.Join(packsFolder, packId, "icons", file.Id+".png")
		file.HasIcon = exists(iconPath)

		files[i] = file
	}

	// Delete the unused icons
	a.DeleteDeletePngPaths()

	// Delete apply.json
	applyFile := filepath.Join(packsFolder, packId, "apply.json")
	runtime.LogDebugf(appContext, "Attempting to remove apply.json: %s", applyFile)
	err = os.Remove(applyFile)
	if err != nil {
		runtime.LogWarning(appContext, fmt.Sprintf("Failed to remove apply.json icon: %s", err.Error()))
	}

	// Update cache
	iconPack.Files = files
	a.SetIconPack(iconPack)
}

func CacheIconPacks() error {
	// Clear cache
	iconPackCache.Clear()

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

			iconPackCache.Set(iconPack.Metadata.Id, iconPack)
		}
	}

	return nil
}

func (a *App) ClearIconPackCache() {
	iconPackCache.Clear()
}

func (a *App) GetIconPackList() []IconPack {
	if iconPackCache.IsEmpty() {
		CacheIconPacks()
	}

	iconPacks := make([]IconPack, 0, iconPackCache.Count())

	for i := range iconPackCache.IterBuffered() {
		iconPacks = append(iconPacks, i.Val)
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
	if is_dir(path) {
		fileInfo.Extension = ".dir"
	}

	runtime.LogDebugf(appContext, "Pack id: %s", packId)
	runtime.LogDebugf(appContext, "File extension for %s: %s", path, fileInfo.Extension)

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
	} else if fileInfo.Extension == ".url" {
		iniContent, err := os.ReadFile(path)
		if err != nil {
			return FileInfo{}, err
		}

		iniFile, err := ini.Load(iniContent)
		if err != nil {
			return FileInfo{}, err
		}

		section := iniFile.Section("InternetShortcut")

		url := section.Key("URL").String()

		fileInfo.Destination = url
	}

	hasAppliedIcon := true

	if fileInfo.Extension == ".dir" || fileInfo.Extension == ".url" {
		appliedIconPath, err := GetAppliedIcon(path)
		if err != nil {
			runtime.LogError(appContext, err.Error())
		}

		hasAppliedIcon = appliedIconPath != ""
	}

	if packId != "" && hasAppliedIcon {
		if packId == "temp" {
			tempName := "iconium-" + uuid.NewString()
			iconPath := filepath.Join(tempFolder, tempName+".png")

			err := ConvertToPng(path, iconPath)
			if err != nil {
				runtime.LogError(appContext, err.Error())
			} else {
				fileInfo.HasIcon = true
				tempPngPaths.Set(fileInfo.Id, iconPath)
			}
		} else {
			iconPath := filepath.Join(packsFolder, packId, "icons", fileInfo.Id+".png")
			err := ConvertToPng(path, iconPath)
			if err != nil {
				runtime.LogError(appContext, err.Error())
			} else {
				fileInfo.HasIcon = true
			}
		}
	}

	if !contains(allowedFileExtensions, fileInfo.Extension) {
		return FileInfo{}, errors.New("file extension not allowed: " + fileInfo.Extension)
	}

	return fileInfo, nil
}

func GetAppliedIcon(path string) (string, error) {
	ext := strings.ToLower(filepath.Ext(path))

	if ext == ".lnk" {
		link, err := lnk.File(path)
		if err != nil {
			return "", fmt.Errorf("failed to open .lnk file: %s", err.Error())
		}

		if link.StringData.IconLocation != "" {
			return link.StringData.IconLocation, nil
		}
	} else if ext == ".url" {
		iniPath := filepath.Join(path)
		if !exists(iniPath) {
			return "", nil
		}
		iniContent, err := os.ReadFile(iniPath)
		if err != nil {
			return "", err
		}
		iniFile, err := ini.Load(iniContent)
		if err != nil {
			return "", err
		}
		section := iniFile.Section("InternetShortcut")

		if !section.HasKey("IconFile") {
			return "", errors.New("icon not found")
		}

		return section.Key("IconFile").String(), nil
	} else if is_dir(path) {
		iniPath := filepath.Join(path, "desktop.ini")
		if !exists(iniPath) {
			return "", nil
		}

		iniContent, err := os.ReadFile(iniPath)
		if err != nil {
			return "", err
		}
		iniFile, err := ini.Load(iniContent)
		if err != nil {
			return "", err
		}
		section := iniFile.Section(".ShellClassInfo")
		iconResource := section.Key("IconResource").String()

		iconResource = strings.Split(iconResource, ",")[0]

		runtime.LogDebugf(appContext, "Icon resource: %s", iconResource)

		return iconResource, nil
	}

	return "", errors.New("icon not found")
}

func GetAppliedDescription(path string) (string, error) {
	ext := strings.ToLower(filepath.Ext(path))

	if ext == ".lnk" {
		link, err := lnk.File(path)
		if err != nil {
			return "", fmt.Errorf("failed to open .lnk file: %s", err.Error())
		}

		if link.StringData.NameString != "" {
			return link.StringData.NameString, nil
		}
	}

	return "", errors.New("description not found")
}

func (a *App) AddIconPack(name string, version string, author string, license string, description string) error {
	iconPack, err := CreateIconPack(name, version, author, license, description)
	if err != nil {
		return err
	}

	tempPackPngPath, ok := tempPngPaths.Get("temp")

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
		tempPngPaths.Remove("temp")

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

	iconPackCache.Remove(id)

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

	iconPackCache.Set(id, cachedPack)

	if save {
		a.SetIconPack(cachedPack)

		runtime.WindowExecJS(appContext, "window.setProgress(100)")
		time.Sleep(200 * time.Millisecond)
		runtime.WindowExecJS(appContext, "window.setProgress(0)")
	}
}

func (a *App) AddFilesToIconPackFromPath(id string, paths []string, save bool) {
	var wg sync.WaitGroup
	progress := make(chan int)

	totalFiles := len(paths)
	processedFiles := 0

	// Start a goroutine to monitor and print progress
	go func() {
		for range progress {
			processedFiles++
			percentage := float64(processedFiles) / float64(totalFiles) * 100
			runtime.WindowExecJS(appContext, fmt.Sprintf("window.setProgress(%f)", percentage))
		}
	}()

	// Add each file to the icon pack asynchronously
	for _, path := range paths {
		wg.Add(1)
		go func(p string) {
			defer wg.Done()
			a.AddFileToIconPackFromPath(id, p, false)
			progress <- 1 // Send progress update
		}(path)
	}

	// Wait for all goroutines to finish
	wg.Wait()
	close(progress) // Close the progress channel

	// Save the icon pack if required
	if save {
		iconPack, ok := iconPackCache.Get(id)
		if !ok {
			return
		}
		a.SetIconPack(iconPack)
	}

	time.Sleep(200 * time.Millisecond)

	runtime.WindowExecJS(appContext, "window.setProgress(0)")
}

func (a *App) GetFileInfoFromPaths(id string, paths []string) ([]FileInfo, error) {
	var fileInfos []FileInfo
	var fileInfosMutex sync.Mutex
	var wg sync.WaitGroup
	progress := make(chan int)

	totalFiles := len(paths)
	processedFiles := 0

	// Start a goroutine to monitor and print progress
	go func() {
		for range progress {
			processedFiles++
			percentage := float64(processedFiles) / float64(totalFiles) * 100
			runtime.WindowExecJS(appContext, fmt.Sprintf("window.setProgress(%f)", percentage))
		}
	}()

	// Process each path asynchronously
	for _, path := range paths {
		wg.Add(1)
		go func(p string) {
			defer wg.Done()
			if (!contains(allowedFileExtensions, filepath.Ext(p)) && !is_dir(p)) || !exists(p) {
				progress <- 1 // Send progress update even if file is skipped
				return
			}

			fileInfo, err := CreateFileInfo(id, p)
			if err != nil {
				fmt.Printf("Error creating file info for path %s: %v\n", p, err)
				return
			}

			tempPngPath, ok := tempPngPaths.Get(fileInfo.Id)
			selectImage := SelectImage{
				Id:          fileInfo.Id,
				Path:        "",
				TempPath:    "",
				HasOriginal: false,
				HasTemp:     false,
				IsRemoved:   false,
			}
			if ok {
				relativeTempPngPath, err := filepath.Rel(appFolder, tempPngPath)
				if err == nil {
					selectImage.TempPath = relativeTempPngPath
					selectImage.HasTemp = true
					selectImages.Set(fileInfo.Id, selectImage)
				}
			}

			fileInfosMutex.Lock()
			fileInfos = append(fileInfos, fileInfo)
			fileInfosMutex.Unlock()

			progress <- 1 // Send progress update after processing the file
		}(path)
	}

	// Wait for all goroutines to finish
	wg.Wait()
	close(progress) // Close the progress channel

	time.Sleep(200 * time.Millisecond)

	runtime.WindowExecJS(appContext, "window.setProgress(0)")

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
		if contains(allowedFileExtensions, filepath.Ext(dirEntry.Name())) || is_dir(filepath.Join(desktop, dirEntry.Name())) {
			paths = append(paths, filepath.Join(desktop, dirEntry.Name()))
		}
	}
	for _, dirEntry := range dirEntries2 {
		if contains(allowedFileExtensions, filepath.Ext(dirEntry.Name())) || is_dir(filepath.Join(public, dirEntry.Name())) {
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
		iconPack, ok := iconPackCache.Get(id)
		if !ok {
			runtime.LogErrorf(a.ctx, "Failed to read icon pack: %v", err)
			return
		}

		err = a.SetIconPack(iconPack)
		if err != nil {
			runtime.LogError(a.ctx, err.Error())
		}
	}
}

func (a *App) AddFilesToIconPackFromDesktop(id string) {
	desktop, public := get_desktop_paths()

	desktopEntries, err := os.ReadDir(desktop)
	if err != nil {
		runtime.LogError(appContext, err.Error())
		return
	}
	publicEntries, err := os.ReadDir(public)
	if err != nil {
		runtime.LogError(appContext, err.Error())
		return
	}

	paths := []string{}

	for _, desktopEntry := range desktopEntries {
		path := filepath.Join(desktop, desktopEntry.Name())

		if contains(allowedFileExtensions, strings.ToLower(filepath.Ext(desktopEntry.Name()))) || is_dir(path) {
			paths = append(paths, path)
		}
	}
	for _, publicEntry := range publicEntries {
		path := filepath.Join(public, publicEntry.Name())

		if contains(allowedFileExtensions, strings.ToLower(filepath.Ext(publicEntry.Name()))) || is_dir(path) {
			paths = append(paths, path)
		}
	}

	a.AddFilesToIconPackFromPath(id, paths, true)
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
	var completed int64 // Counter for completed files
	totalFiles := int64(len(pack.Files))

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

			if *config.ChangeDescriptionOfMathcedLnkFiles && file.Description != "" && match != "" {
				appliedDescriptionPath, err := GetAppliedDescription(match)
				if err != nil {
					runtime.LogWarningf(appContext, "Failed to get applied description for %s: %s", match, err.Error())
				}

				if appliedDescriptionPath == file.Description {
					runtime.LogDebug(appContext, "Description already applied")
				} else {
					runtime.LogDebug(appContext, "Applying description")
					err = SetDescription(match, file.Description)
					if err != nil {
						runtime.LogWarningf(appContext, "Failed to set description for %s: %s", match, err.Error())
					}
				}
			}

			// Increment the completed counter
			atomic.AddInt64(&completed, 1)
			percentage := (float64(atomic.LoadInt64(&completed)) / float64(totalFiles)) * 100

			runtime.WindowExecJS(appContext, fmt.Sprintf(`window.setProgress(%f)`, percentage))
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

	// Wait for progress bar to finish
	time.Sleep(200 * time.Millisecond)

	runtime.WindowExecJS(appContext, `window.setProgress(0)`)

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

	if (*config.MatchLnkByDestination && fileInfo.Extension == ".lnk") || (*config.MatchURLByDestination && fileInfo.Extension == ".url") {
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
	ext := strings.ToLower(filepath.Ext(path))
	if is_dir(path) {
		ext = ".dir"
	}

	if ext == ".lnk" {
		err := setLnkIcon(path, iconPath)
		if err != nil {
			return setIconScript(path, iconPath)
		}
	} else if ext == ".url" {
		err := setIconScript(path, iconPath)
		if err != nil {
			return setUrlIcon(path, iconPath)
		}
	} else if ext == ".dir" {
		return setDirIcon(path, iconPath)
	}

	return errors.New("unsupported file type")
}

func SetDescription(path string, desc string) error {
	ext := strings.ToLower(filepath.Ext(path))

	if ext == ".lnk" {
		err := setLnkDesc(path, desc)
		if err != nil {
			return setDescScript(path, desc)
		} else {
			return nil
		}
	}

	return errors.New("unsupported file type")
}

func setIconScript(path string, iconPath string) error {
	_, err := sendCommand("cscript.exe", setLnkIconScriptPath, filepath.Dir(path), filepath.Base(path), iconPath, "0")
	if err != nil {
		return err
	}
	return nil
}

func setDescScript(path string, desc string) error {
	_, err := sendCommand("cscript.exe", setLnkDescScriptPath, filepath.Dir(path), filepath.Base(path), desc)
	if err != nil {
		return err
	}
	return nil
}

func setLnkIcon(linkPath string, iconPath string) error {
	// Initialize COM
	err := ole.CoInitialize(0)
	if err != nil {
		return fmt.Errorf("failed to initialize COM: %v", err)
	}
	defer ole.CoUninitialize()

	// Create a WScript.Shell object
	wshShell, err := oleutil.CreateObject("WScript.Shell")
	if err != nil {
		return fmt.Errorf("failed to create WScript.Shell object: %v", err)
	}
	defer wshShell.Release()

	// Get the IDispatch interface
	wshShellDisp, err := wshShell.QueryInterface(ole.IID_IDispatch)
	if err != nil {
		return fmt.Errorf("failed to get IDispatch interface for WScript.Shell: %v", err)
	}
	defer wshShellDisp.Release()

	// Create a shortcut object
	shortcut, err := oleutil.CallMethod(wshShellDisp, "CreateShortcut", linkPath)
	if err != nil {
		return fmt.Errorf("failed to create shortcut object: %v", err)
	}
	shortcutDisp := shortcut.ToIDispatch()
	defer shortcutDisp.Release()

	// Set the icon location
	_, err = oleutil.PutProperty(shortcutDisp, "IconLocation", iconPath+",0")
	if err != nil {
		return fmt.Errorf("failed to set icon location: %v", err)
	}

	// Save the shortcut
	_, err = oleutil.CallMethod(shortcutDisp, "Save")
	if err != nil {
		return fmt.Errorf("failed to save shortcut: %v", err)
	}

	return nil
}

func setLnkDesc(linkPath string, desc string) error {
	// Initialize COM
	err := ole.CoInitialize(0)
	if err != nil {
		return fmt.Errorf("failed to initialize COM: %v", err)
	}
	defer ole.CoUninitialize()

	// Create a WScript.Shell object
	wshShell, err := oleutil.CreateObject("WScript.Shell")
	if err != nil {
		return fmt.Errorf("failed to create WScript.Shell object: %v", err)
	}
	defer wshShell.Release()

	// Get the IDispatch interface
	wshShellDisp, err := wshShell.QueryInterface(ole.IID_IDispatch)
	if err != nil {
		return fmt.Errorf("failed to get IDispatch interface for WScript.Shell: %v", err)
	}
	defer wshShellDisp.Release()

	// Create a shortcut object
	shortcut, err := oleutil.CallMethod(wshShellDisp, "CreateShortcut", linkPath)
	if err != nil {
		return fmt.Errorf("failed to create shortcut object: %v", err)
	}
	shortcutDisp := shortcut.ToIDispatch()
	defer shortcutDisp.Release()

	// Set the icon location
	_, err = oleutil.PutProperty(shortcutDisp, "Description", desc)
	if err != nil {
		return fmt.Errorf("failed to set icon location: %v", err)
	}

	// Save the shortcut
	_, err = oleutil.CallMethod(shortcutDisp, "Save")
	if err != nil {
		return fmt.Errorf("failed to save shortcut: %v", err)
	}

	return nil
}

func setUrlIcon(urlPath string, iconPath string) error {
	iniContent, err := os.ReadFile(urlPath)
	if err != nil {
		return err
	}
	iniFile, err := ini.Load(iniContent)
	if err != nil {
		return err
	}
	section := iniFile.Section("InternetShortcut")
	section.Key("IconFile").SetValue(iconPath)
	section.Key("IconIndex").SetValue("0")
	err = iniFile.SaveTo(urlPath)
	if err != nil {
		return err
	}
	return nil
}

func setDirIcon(dirPath string, iconPath string) error {
	iniPath := filepath.Join(dirPath, "desktop.ini")
	iniPathTxt := filepath.Join(dirPath, uuid.NewString()+"-desktop.txt")

	if exists(iniPath) {
		iniContent, err := os.ReadFile(iniPath)
		if err != nil {
			return err
		}
		iniFile, err := ini.Load(iniContent)
		if err != nil {
			return err
		}
		section := iniFile.Section(".ShellClassInfo")
		iconResource := section.Key("IconResource")
		iconResource.SetValue(iconPath + ",0")

		err = iniFile.SaveTo(iniPathTxt)
		if err != nil {
			return err
		}

		err = os.Rename(iniPathTxt, iniPath)
		if err != nil {
			return err
		}
	} else {
		// Create desktop.ini
		file, err := os.Create(iniPathTxt)
		if err != nil {
			return err
		}

		_, err = file.WriteString("[.ShellClassInfo]\nIconResource=" + iconPath + ",0")
		if err != nil {
			return err
		}

		file.Close()

		err = os.Rename(iniPathTxt, iniPath)
		if err != nil {
			return err
		}
	}

	// Set attributes
	if err := setFileAttributes(iniPath, syscall.FILE_ATTRIBUTE_HIDDEN|syscall.FILE_ATTRIBUTE_SYSTEM); err != nil {
		return err
	}
	if err := setFileAttributes(dirPath, syscall.FILE_ATTRIBUTE_READONLY); err != nil {
		return err
	}

	return nil
}

func setFileAttributes(path string, attributes uint32) error {
	pathUTF16, err := syscall.UTF16PtrFromString(path)
	if err != nil {
		return err
	}
	return syscall.SetFileAttributes(pathUTF16, attributes)
}
