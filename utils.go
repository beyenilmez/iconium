package main

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	lnk "github.com/parsiya/golnk"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func writeJSON(path string, data interface{}) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	return json.NewEncoder(file).Encode(data)
}

func readJSON(path string, data interface{}) error {
	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	return json.NewDecoder(file).Decode(data)
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

func GenerateBase64Png(bytes []byte) string {
	var base64Encoding string

	// Determine the content type of the image file
	mimeType := http.DetectContentType(bytes)

	// Prepend the appropriate URI scheme header depending
	// on the MIME type
	switch mimeType {
	case "image/png":
		base64Encoding += "data:image/png;base64,"
	case "image/x-icon":
		base64Encoding += "data:image/x-icon;base64,"
	default:
		runtime.LogWarning(appContext, "Unrecognized image mime type: "+mimeType)
		return ""
	}

	// Append the base64 encoded output
	base64Encoding += base64.StdEncoding.EncodeToString(bytes)

	return base64Encoding
}

func GenerateBase64PngFromPath(filePath string) string {
	// Read the entire file into a byte slice
	bytes, err := os.ReadFile(filePath)

	if err != nil {
		runtime.LogError(appContext, "Error reading file: "+err.Error())
	}

	ext := filepath.Ext(filePath)

	switch strings.ToLower(ext) {
	case ".png":
		return GenerateBase64Png(bytes)
	case ".ico":
		return GenerateBase64Png(bytes)
	case ".lnk":
		link, err := lnk.File(filePath)
		if err != nil {
			runtime.LogError(appContext, "Error reading link: "+err.Error())
		}

		runtime.LogDebug(appContext, "Icon location: "+link.StringData.IconLocation)

		if strings.ToLower(filepath.Ext(link.StringData.IconLocation)) == ".ico" {
			return GenerateBase64PngFromPath(link.StringData.IconLocation)
		}
	default:
		runtime.LogWarning(appContext, "Unrecognized file type: "+ext)
		return ""
	}

	return ""
}

func ConvertToGeneralPath(path string) string {
	desktop, public := get_desktop_paths()

	if strings.HasPrefix(strings.ToLower(path), strings.ToLower(desktop)) {
		return strings.ReplaceAll(path, desktop, "<desktop>")
	} else if strings.HasPrefix(strings.ToLower(path), strings.ToLower(public)) {
		return strings.ReplaceAll(path, public, "<desktop>")
	} else {
		return path
	}
}

func ConvertToFullPath(path string) string {
	if strings.Contains(path, "<desktop>") {
		desktop, public := get_desktop_paths()

		path1 := strings.ReplaceAll(path, "<desktop>", desktop)
		path2 := strings.ReplaceAll(path, "<desktop>", public)

		if _, err := os.Stat(path1); os.IsNotExist(err) {
			return path2
		} else {
			return path1
		}
	} else {
		return path
	}
}
