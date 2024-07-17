package main

import (
	"os/exec"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SaveConfigDialog() {
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:                "Save configuration",
		DefaultDirectory:     savedConfigFolder,
		DefaultFilename:      "config.json",
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON",
				Pattern:     "*.json",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return
	}

	err = WriteConfig(path)

	if err != nil {
		if path == "" {
			runtime.LogInfo(a.ctx, "No path given, not saving config")
			return
		}
		runtime.LogWarning(a.ctx, err.Error())
		a.SendNotification("", "settings.there_was_an_error_saving_the_config", "", "error")
		return
	}

	runtime.LogInfo(a.ctx, "Config saved to "+path)
	path = strings.ReplaceAll(path, "\\", "\\\\")
	a.SendNotification("", "settings.config_saved", path, "success")
}

func (a *App) GetLoadConfigPath() string {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Load configuration",
		DefaultDirectory:     savedConfigFolder,
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "JSON",
				Pattern:     "*.json",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	return path
}

func (a *App) GetBase64Png() string {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select image",
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "PNG",
				Pattern:     "*.png",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	if path == "" {
		return ""
	}

	base64Png := GenerateBase64PngFromPath(path)

	runtime.LogInfo(a.ctx, "Image selected: "+path)

	return base64Png
}

func (a *App) GetIconFolder() string {
	path, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select folder",
		CanCreateDirectories: true,
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	return path
}

func (a *App) GetIconFile() string {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select file",
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Shortcut",
				Pattern:     "*.lnk",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	return path
}

func (a *App) GetIconFiles() []string {
	paths, err := runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select file",
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Shortcut",
				Pattern:     "*.lnk",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return nil
	}

	return paths
}

func (a *App) OpenFileInExplorer(path string) {
	runtime.LogInfo(a.ctx, "Opening file in explorer: "+path)

	cmd := exec.Command(`explorer`, `/select,`, path)
	cmd.Run()
}
