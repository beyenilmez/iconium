package main

import (
	"errors"
	"os"
	"path"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var packsFolder string
var logsFolder string
var configPath string

func path_init() error {
	appData, err := os.UserConfigDir()
	if err != nil {
		appData = os.Getenv("APPDATA")
		if appData == "" {
			return errors.New("Could not find user config directory: " + err.Error())
		}
	}
	runtime.LogDebug(appContext, "Found user config directory: "+appData)

	appFolder := path.Join(appData, "desktop-manager")
	packsFolder = path.Join(appFolder, "packs")
	logsFolder = path.Join(appFolder, "logs")

	configPath = path.Join(appFolder, "config.json")

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

	return nil
}

func get_logs_folder() (string, error) {
	logsFolder = path.Join(os.Getenv("APPDATA"), "desktop-manager", "logs")

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
	configPath = path.Join(os.Getenv("APPDATA"), "desktop-manager", "config.json")

	return configPath
}

// Create folder if it doesn't exist, return error
func create_folder(folder string) error {
	if _, err := os.Stat(folder); os.IsNotExist(err) {
		err = os.MkdirAll(folder, 0o755)
		if err != nil {
			return err
		}
	} else {
		runtime.LogDebug(appContext, "Folder already exists: "+folder)
		return nil
	}
	runtime.LogDebug(appContext, "Created folder: "+folder)

	return nil
}
