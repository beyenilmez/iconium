package main

import (
	"errors"
	"os"
	"os/user"
	"path"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var packsFolder string
var logsFolder string
var savedConfigFolder string
var activeIconFolder string
var tempFolder string
var maskFolder string
var configPath string
var appIconPath string

var installationDirectory string
var imageMagickPath string

func path_init() error {
	appData, err := os.UserConfigDir()
	if err != nil {
		appData = os.Getenv("APPDATA")
		if appData == "" {
			return errors.New("Could not find user config directory: " + err.Error())
		}
	}
	runtime.LogDebug(appContext, "Found user config directory: "+appData)

	appFolder := path.Join(appData, "iconium")

	packsFolder = path.Join(appFolder, "packs")
	logsFolder = path.Join(appFolder, "logs")
	savedConfigFolder = path.Join(appFolder, "savedconfigs")
	activeIconFolder = path.Join(appFolder, "icons")
	tempFolder = path.Join(appFolder, "temp")
	maskFolder = path.Join(appFolder, "masks")

	configPath = path.Join(appFolder, "config.json")
	appIconPath = path.Join(appFolder, "appicon.png")

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

	runtime.LogTrace(appContext, "Path initialization complete")

	return nil
}

func get_logs_folder() (string, error) {
	logsFolder = path.Join(os.Getenv("APPDATA"), "iconium", "logs")

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
	configPath = path.Join(os.Getenv("APPDATA"), "iconium", "config.json")

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
