package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
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

func (a *App) GetTempPng(id string) string {
	oldPackPngPath, ok := tempPngPaths.Get(id)

	tempPackPngPath := filepath.Join(tempFolder, "iconium-"+uuid.NewString()+".png")

	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select image",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Image File",
				Pattern:     "*.png;*.jpg;*.jpeg;*.webp;*.svg;*.bmp;*.ico;*.exe;*.lnk;*.url",
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

	err = ConvertToPng(path, tempPackPngPath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error copying pack.png file: %s", err.Error())
		return ""
	}

	runtime.LogInfof(a.ctx, "Trimming path: %s (cut %s)", tempPackPngPath, appFolder)
	trimmedPath := strings.TrimPrefix(tempPackPngPath, appFolder)

	tempPngPaths.Set(id, tempPackPngPath)

	// Remove old pack png
	if ok {
		os.Remove(oldPackPngPath)
	}

	return trimmedPath
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
				Pattern:     "*.lnk;*.url",
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
				Pattern:     "*.lnk;*.url",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return nil
	}

	return paths
}

func (a *App) GetFilePath(generalPath string) string {
	fullPath := ConvertToFullPath(filepath.Dir(generalPath))

	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:            "Select file",
		DefaultDirectory: fullPath,
		ResolvesAliases:  true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Shortcut",
				Pattern:     "*.lnk;*.url",
			},
		},
	})

	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	return ConvertToGeneralPath(path)
}

func (a *App) ExportIconPack(packId string) string {
	// Check if the icon pack exists
	_, err := a.GetIconPack(packId)
	if err != nil {
		runtime.LogErrorf(appContext, "Icon pack %s not found: %s", packId, err.Error())
		return ""
	}

	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:                "Export icon pack",
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Iconium File",
				Pattern:     "*.icnm",
			},
		},
	})
	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	iconPackPath := filepath.Join(packsFolder, packId)
	runtime.LogInfof(a.ctx, "Exporting icon pack: %s", iconPackPath)

	err = zip_folder(iconPackPath, path)

	if err != nil {
		runtime.LogErrorf(a.ctx, "Error exporting icon pack: %s", err.Error())
		return ""
	}

	a.SendNotification("settings.icon_pack.exported", "", path, "success")

	return path
}

func (a *App) GetIconPackPath() string {
	path, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Import icon pack",
		CanCreateDirectories: true,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Iconium File",
				Pattern:     "*.icnm",
			},
		},
	})
	if err != nil {
		runtime.LogWarning(a.ctx, err.Error())
		return ""
	}

	return path
}

func (a *App) ImportIconPack(path string) string {
	runtime.LogInfof(a.ctx, "Importing icon pack: %s", path)

	extractFolder := filepath.Join(tempFolder, "iconium-"+uuid.NewString())
	defer os.RemoveAll(extractFolder)

	err := unzip_folder(path, extractFolder)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error importing icon pack: %s", err.Error())
		return ""
	}

	files, err := os.ReadDir(extractFolder)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error importing icon pack: %s", err.Error())
		return ""
	}
	if len(files) != 1 {
		runtime.LogErrorf(a.ctx, "Error importing icon pack")
		return ""
	}

	packId := uuid.NewString()

	tempIconPackPath := filepath.Join(extractFolder, files[0].Name())
	targetPath := filepath.Join(packsFolder, packId)

	err = os.Rename(tempIconPackPath, targetPath)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error importing icon pack: %s", err.Error())
		return ""
	}

	a.SendNotification("my_packs.import_pack.success", "", "", "success")

	return packId
}

func (a *App) GetIcnmMetadata(path string) Metadata {
	extractFolder := filepath.Join(tempFolder, "iconium-"+uuid.NewString())

	err := unzip_folder(path, extractFolder)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error importing icon pack: %s", err.Error())
		return Metadata{}
	}
	defer os.RemoveAll(extractFolder)

	files, err := os.ReadDir(extractFolder)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error importing icon pack: %s", err.Error())
		return Metadata{}
	}
	if len(files) != 1 {
		runtime.LogErrorf(a.ctx, "Error importing icon pack")
		return Metadata{}
	}

	metadataFile := filepath.Join(extractFolder, files[0].Name(), "metadata.json")

	var metadata Metadata
	err = readJSON(metadataFile, &metadata)
	if err != nil {
		runtime.LogErrorf(a.ctx, "Error importing icon pack: %s", err.Error())
		return Metadata{}
	}

	iconPath := filepath.Join(extractFolder, files[0].Name(), metadata.IconName+".png")
	tempIconName := "iconium-" + uuid.NewString() + ".png"
	tempIconPath := filepath.Join(tempFolder, tempIconName)

	err = copy_file(iconPath, tempIconPath)
	if err != nil {
		runtime.LogWarningf(a.ctx, "Error copying icon: %s", err.Error())
	}

	metadata.IconName = "temp\\" + tempIconName

	tempPngPaths.Set(uuid.NewString(), tempIconPath)

	return metadata
}

func (a *App) OpenFileInExplorer(path string) {
	runtime.LogInfo(a.ctx, "Opening file in explorer: "+path)

	cmd := exec.Command(`explorer`, `/select,`, path)
	cmd.Run()
}
