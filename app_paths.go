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
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed frontend/public/scripts
var scriptsFolderEmbedded embed.FS

var setLnkIconScriptPath string

var appFolder string

var packsFolder string
var logsFolder string
var savedConfigFolder string
var activeIconFolder string
var tempFolder string
var maskFolder string
var scriptsFolder string
var configPath string
var appIconPath string

var installationDirectory string
var imageMagickPath string

var tempPngPaths map[string]string = map[string]string{}

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

	configPath = filepath.Join(appFolder, "config.json")
	appIconPath = filepath.Join(appFolder, "appicon.png")
	setLnkIconScriptPath = filepath.Join(scriptsFolder, "setlnkicon.vbs")

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

	ex, err := os.Executable()
	if err != nil {
		return err
	}

	installationDirectory = filepath.Dir(ex)
	imageMagickPath = filepath.Join(installationDirectory, "ImageMagick-7.1.1-35-portable-Q16-x64", "magick.exe")
	runtime.LogDebugf(appContext, "ImageMagick path: %s", imageMagickPath)

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
	for k := range tempPngPaths {
		err := os.Remove(tempPngPaths[k])
		if err != nil {
			runtime.LogErrorf(appContext, "Error removing tempPngPath: %s", err)
			continue
		}
		delete(tempPngPaths, k)
	}

	runtime.LogDebug(appContext, "Cleared tempPngPaths")
}

func (a *App) GetTempPngPath(id string) string {
	tempPath, ok := tempPngPaths[id]
	if ok {
		tempPath = strings.TrimPrefix(tempPath, appFolder)
		return tempPath
	} else {
		return ""
	}
}

func (a *App) AddTempPngPath(id string, path string) {
	if !contains(allowedImageExtensionsPng, filepath.Ext(path)) {
		runtime.LogError(appContext, "Extension is not allowed: "+path)
		return
	}

	oldPath, ok := tempPngPaths[id]

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

	tempPngPaths[id] = tempPngPath
}
