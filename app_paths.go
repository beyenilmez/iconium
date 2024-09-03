package main

import (
	"embed"
	"errors"
	"io/fs"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	cmap "github.com/orcaman/concurrent-map/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed frontend/public/scripts
var scriptsFolderEmbedded embed.FS

var setLnkIconScriptPath string
var setLnkDescScriptPath string

var appFolder string

var packsFolder string
var logsFolder string
var savedConfigFolder string
var activeIconFolder string
var tempFolder string
var maskFolder string
var scriptsFolder string
var externalFolder string
var configPath string
var appIconPath string

var imageMagickPath string
var extractIconPath string

var tempPngPaths = cmap.New[string]()
var deletePngPaths []string = []string{}

var selectImages = cmap.New[SelectImage]()

type SelectImage struct {
	Id          string `json:"id"`
	Path        string `json:"path"`
	TempPath    string `json:"tempPath"`
	HasOriginal bool   `json:"hasOriginal"`
	HasTemp     bool   `json:"hasTemp"`
	IsRemoved   bool   `json:"isRemoved"`
}

func path_init() error {
	appData, err := os.UserConfigDir()
	if err != nil {
		appData = os.Getenv("APPDATA")
		if appData == "" {
			return errors.New("Could not find user config directory: " + err.Error())
		}
	}
	runtime.LogDebug(appContext, "Found user config directory: "+appData)

	appFolder = filepath.Join(appData, "iconium")

	packsFolder = filepath.Join(appFolder, "packs")
	logsFolder = filepath.Join(appFolder, "logs")
	savedConfigFolder = filepath.Join(appFolder, "savedconfigs")
	activeIconFolder = filepath.Join(appFolder, "icons")
	tempFolder = filepath.Join(appFolder, "temp")
	maskFolder = filepath.Join(appFolder, "masks")
	scriptsFolder = filepath.Join(appFolder, "scripts")
	externalFolder = filepath.Join(appFolder, "external")

	configPath = filepath.Join(appFolder, "config.json")
	appIconPath = filepath.Join(appFolder, "appicon.png")
	setLnkIconScriptPath = filepath.Join(scriptsFolder, "setlnkicon.vbs")
	setLnkDescScriptPath = filepath.Join(scriptsFolder, "setlnkdesc.vbs")

	runtime.LogTrace(appContext, "Attempting to create folders")
	err = create_folder(appFolder)
	if err != nil {
		return err
	}

	err = create_folder(packsFolder)
	if err != nil {
		return err
	}
	err = create_folder(logsFolder)
	if err != nil {
		return err
	}
	err = create_folder(savedConfigFolder)
	if err != nil {
		return err
	}
	err = create_folder(activeIconFolder)
	if err != nil {
		return err
	}
	err = create_folder(tempFolder)
	if err != nil {
		return err
	}
	err = create_folder(maskFolder)
	if err != nil {
		return err
	}
	err = create_folder(scriptsFolder)
	if err != nil {
		return err
	}
	err = create_folder(externalFolder)
	if err != nil {
		return err
	}

	runtime.LogTrace(appContext, "Creating folders complete")

	runtime.LogTrace(appContext, "Attempting to create appicon")

	// Create icon from embedded appIcon if it exists
	if _, err := os.Stat(appIconPath); os.IsNotExist(err) {
		runtime.LogTrace(appContext, "appicon not found, creating from embedded appIcon")
		err = os.WriteFile(appIconPath, appIcon, 0o644)
		if err != nil {
			return err
		}
	}

	runtime.LogTrace(appContext, "Creating appicon complete")

	imageMagickPath = filepath.Join(externalFolder, "ImageMagick-7.1.1-35-portable-Q16-x64", "magick.exe")
	runtime.LogDebugf(appContext, "ImageMagick path: %s", imageMagickPath)

	extractIconPath = filepath.Join(externalFolder, "ExtractIcon", "extracticon.exe")
	runtime.LogDebugf(appContext, "ExtractIcon path: %s", extractIconPath)

	// Copy all files in scriptsFolderEmbedded to scriptsFolder
	runtime.LogTrace(appContext, "Attempting to copy scripts from embedded folder to scripts folder")

	err = fs.WalkDir(scriptsFolderEmbedded, ".", func(filePath string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// Skip directories, but ensure they exist in the target location
		if d.IsDir() {
			return nil
		}

		// Remove the prefix "frontend/public/scripts" from the file path
		relativePath, err := filepath.Rel("frontend/public/scripts", filePath)
		if err != nil {
			return err
		}

		// Construct the full destination path
		destFile := filepath.Join(scriptsFolder, relativePath)

		// Check if destination file already exists
		if _, err := os.Stat(destFile); err == nil {
			return nil
		}

		// Create directories if they do not exist
		if err := os.MkdirAll(filepath.Dir(destFile), 0o755); err != nil {
			return err
		}

		// Copy the file contents to the target destination
		contents, err := scriptsFolderEmbedded.ReadFile(filePath)
		if err != nil {
			return err
		}
		err = os.WriteFile(destFile, contents, 0o755)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return err
	}

	runtime.LogTrace(appContext, "Copying scripts complete")

	runtime.LogTrace(appContext, "Path initialization complete")

	return nil
}

func get_logs_folder() (string, error) {
	logsFolder = filepath.Join(os.Getenv("APPDATA"), "iconium", "logs")

	// Create folder if it doesn't exist
	if _, err := os.Stat(logsFolder); os.IsNotExist(err) {
		err = os.MkdirAll(logsFolder, 0o755)
		if err != nil {
			return "", err
		}
	}
	return logsFolder, nil
}

func get_config_path() string {
	configPath = filepath.Join(os.Getenv("APPDATA"), "iconium", "config.json")

	return configPath
}

// Returns the desktop paths
func get_desktop_paths() (string, string) {
	userDir, err := user.Current()

	if err != nil {
		return "", ""
	}

	homedir := userDir.HomeDir
	desktop := filepath.Join(homedir, "Desktop")

	publicDir := os.Getenv("PUBLIC")
	public := filepath.Join(publicDir, "Desktop")

	return desktop, public
}

func (a *App) ClearTempPngPaths() {
	for i := range tempPngPaths.IterBuffered() {
		err := os.Remove(i.Val)
		if err != nil {
			runtime.LogErrorf(appContext, "Error removing tempPngPath: %s", err)
			continue
		}
	}

	tempPngPaths.Clear()

	runtime.LogDebug(appContext, "Cleared tempPngPaths")
}

func (a *App) GetTempPngPath(id string) string {
	tempPath, ok := tempPngPaths.Get(id)
	if ok {
		tempPath = strings.TrimPrefix(tempPath, appFolder)
		return tempPath
	} else {
		return ""
	}
}

func (a *App) AddTempPngPath(id string, path string) {
	if !contains(allowedImageExtensionsPng, filepath.Ext(path)) {
		runtime.LogError(appContext, "Extension is not allowed: "+path+" ,Full path: "+path)
		return
	}

	oldPath, ok := tempPngPaths.Get(id)

	tempPngPath := filepath.Join(tempFolder, "iconium-"+uuid.NewString()+".png")
	err := ConvertToPng(path, tempPngPath)

	if err != nil {
		runtime.LogErrorf(appContext, "Error converting to png: %s", err)
		return
	}

	if ok {
		err = os.Remove(oldPath)
		if err != nil {
			runtime.LogErrorf(appContext, "Error removing old temp png: %s", err)
			return
		}
	}

	tempPngPaths.Set(id, tempPngPath)
}

func (a *App) RemoveTempPng(id string) {
	val, ok := tempPngPaths.Get(id)
	if !ok {
		runtime.LogWarning(appContext, "Temp png not found: "+id)
		return
	}

	err := os.Remove(val)
	if err != nil {
		runtime.LogErrorf(appContext, "Error removing temp png: %s", err)
		return
	}

	tempPngPaths.Remove(id)
}

func (a *App) AddDeletePngRelativePath(relPath string) {
	path := filepath.Join(appFolder, relPath)

	deletePngPaths = append(deletePngPaths, path)
}

func (a *App) ClearDeletePngPaths() {
	deletePngPaths = []string{}
}

func (a *App) RemoveDeletePng(path string) {
	paths := deletePngPaths

	for i := 0; i < len(paths); i++ {
		if paths[i] == path {
			paths = append(paths[:i], paths[i+1:]...)
			break
		}
	}

	deletePngPaths = paths
}

func (a *App) DeleteDeletePngPaths() {
	for _, path := range deletePngPaths {
		err := os.Remove(path)
		if err != nil {
			runtime.LogErrorf(appContext, "Error removing delete png: %s", err)
		}
	}

	deletePngPaths = []string{}
}

func (a *App) GetSelectImage(id string, path string) SelectImage {
	selectImage, ok := selectImages.Get(id)
	if ok {
		return selectImage
	}

	fullPath := filepath.Join(appFolder, path)

	isEmpty := path == ""

	if filepath.Ext(path) != ".png" {
		isEmpty = true
	} else if !isEmpty {
		isEmpty = !exists(fullPath)
	}

	selectImage = SelectImage{
		Id:          id,
		Path:        path,
		TempPath:    "",
		HasOriginal: !isEmpty,
		HasTemp:     false,
		IsRemoved:   false,
	}

	selectImages.Set(id, selectImage)

	return selectImage
}

func (a *App) UploadSelectImage(id string) SelectImage {
	tempPngPath := a.GetTempPng(id)
	if tempPngPath == "" {
		return a.GetSelectImage(id, "")
	}

	selectImage := a.GetSelectImage(id, "")

	selectImage.TempPath = tempPngPath
	selectImage.HasTemp = true
	selectImages.Set(id, selectImage)

	return selectImage
}

func (a *App) SetTempImage(id string, path string) error {
	selectImage, ok := selectImages.Get(id)
	if !ok {
		return errors.New("select image not found")
	}

	if selectImage.HasTemp {
		a.RemoveTempPng(id)
	}

	selectImage.TempPath, _ = filepath.Rel(appFolder, path)
	selectImage.HasTemp = true
	selectImages.Set(id, selectImage)

	runtime.LogDebugf(appContext, "Set temp image: %s", path)

	return nil
}

func (a *App) SetSelectImage(id string, path string) {
	selectImage := a.GetSelectImage(id, path)

	if !selectImage.HasTemp {
		a.RemoveTempPng(id)
	}

	a.AddTempPngPath(id, path)

	tempPngPath := a.GetTempPng(id)

	if tempPngPath != "" {
		selectImage.TempPath, _ = filepath.Rel(appFolder, tempPngPath)
		selectImage.HasTemp = true
	} else {
		selectImage.TempPath = ""
		selectImage.HasTemp = false
	}

	selectImages.Set(id, selectImage)

	runtime.LogDebugf(appContext, "Set select image: %s", path)
}

func (a *App) ActionSelectImage(id string) SelectImage {
	selectImage := a.GetSelectImage(id, "")

	if selectImage.HasOriginal {
		if selectImage.HasTemp {
			runtime.LogDebugf(appContext, "Removing temp png: %s", selectImage.TempPath)

			a.RemoveTempPng(id)

			selectImage.HasTemp = false
			selectImage.TempPath = ""
		} else {
			if selectImage.IsRemoved {
				runtime.LogDebugf(appContext, "Retrieving original png: %s", selectImage.Path)

				a.RemoveDeletePng(filepath.Join(appFolder, selectImage.Path))

				selectImage.IsRemoved = false
			} else {
				runtime.LogDebugf(appContext, "Removing original png: %s", selectImage.Path)

				a.AddDeletePngRelativePath(selectImage.Path)

				selectImage.IsRemoved = true
			}
		}
	} else if selectImage.HasTemp {
		runtime.LogDebugf(appContext, "Removing temp png2: %s", selectImage.TempPath)

		a.RemoveTempPng(id)

		selectImage.HasTemp = false
		selectImage.TempPath = ""
	}

	selectImages.Set(id, selectImage)

	return selectImage
}

func (a *App) ClearSelectImages() {
	selectImages.Clear()
}

func (a *App) SetImageIfAbsent(id string, path string) {
	path = ConvertToFullPath(path)

	runtime.LogInfo(appContext, "SetImageIfAbsent path: "+path)

	if path == "" {
		runtime.LogInfo(appContext, "SetImageIfAbsent: path is empty")
		return
	}

	selectImage := a.GetSelectImage(id, path)
	if selectImage.Id == "" {
		runtime.LogInfo(appContext, "SetImageIfAbsent: select image is empty")
		return
	}

	if !(selectImage.HasOriginal || selectImage.HasTemp) {
		a.AddTempPngPath(id, path)
		tempPngPath, ok := tempPngPaths.Get(id)

		if ok {
			err := a.SetTempImage(id, tempPngPath)
			if err != nil {
				runtime.LogError(appContext, "SetImageIfAbsent: error setting temp image: "+err.Error())
			}
		} else {
			runtime.LogInfo(appContext, "SetImageIfAbsent: tempPngPath is empty")
		}
	} else {
		runtime.LogInfo(appContext, "SetImageIfAbsent: hasOriginal or hasTemp is true")
	}
}
