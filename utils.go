package main

import (
	"archive/zip"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
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

	// List of common environment variables to replace
	envVars := []string{
		"PROGRAMFILES(X86)",
		"PROGRAMFILES",
		"APPDATA",
		"LOCALAPPDATA",
		"PROGRAMDATA",
		"USERPROFILE",
		"PUBLIC",
		"SYSTEMROOT",
		"WINDIR",
		"HOMEDRIVE",
		"SYSTEMDRIVE",
	}

	if strings.HasPrefix(strings.ToLower(path), strings.ToLower(desktop)) {
		path = strings.ReplaceAll(path, desktop, "${DESKTOP}")
	} else if strings.HasPrefix(strings.ToLower(path), strings.ToLower(public)) {
		path = strings.ReplaceAll(path, public, "${DESKTOP}")
	}

	// Replace environment variables
	for _, envVar := range envVars {
		placeholder := "${" + envVar + "}"
		envValue := os.Getenv(envVar)

		if strings.Contains(strings.ToLower(path), strings.ToLower(envValue)) {
			path = strings.ReplaceAll(path, envValue, placeholder)
		}
	}

	return path
}

func ConvertToFullPath(path string) string {
	path = filepath.Clean(path)

	os.Setenv("DESKTOP", "<DESKTOP>")
	path = os.ExpandEnv(path)

	paths := []string{path}

	if strings.Contains(strings.ToUpper(path), "<DESKTOP>") {
		desktop, public := get_desktop_paths()

		path1 := strings.ReplaceAll(path, "<DESKTOP>", desktop)
		path2 := strings.ReplaceAll(path, "<DESKTOP>", public)

		paths = []string{path1, path2}
	}

	if strings.Contains(path, `**`) {
		newPaths := []string{}

		for _, path := range paths {
			paths := generateCombinations(path)

			newPaths = append(newPaths, paths...)
		}

		paths = newPaths
	}

	for _, path := range paths {
		matches, err := filepath.Glob(path)
		if err != nil {
			runtime.LogErrorf(appContext, "Error globbing path: %s", err)
			continue
		}

		if len(matches) > 0 {
			return matches[0]
		}
	}

	return ""
}

func generateCombinations(path string) []string {
	// Find the first occurrence of multiple consecutive asterisks pattern (e.g., **, ***)
	index := strings.Index(path, "**")
	if index == -1 {
		return []string{filepath.Clean(path)} // No more '**' to replace, return cleaned path
	}

	// Count consecutive asterisks to determine maximum depth
	maxDepth := 0
	for i := index; i < len(path) && path[i] == '*'; i++ {
		maxDepth++
	}

	runtime.LogDebugf(appContext, "Generating combinations with max depth: %d", maxDepth-1)

	var results []string
	base := path[:index]
	suffix := path[index+maxDepth:] // Adjust suffix to skip over the asterisks

	// Generate combinations based on current asterisk count (depth)
	for i := 0; i < maxDepth; i++ {
		// Combine path with varying depth of wildcards
		if i == 0 {
			// Add combination without extra depth
			combinedPath := filepath.Clean(base + suffix)
			results = append(results, generateCombinations(combinedPath)...)
		} else {
			// Add combinations with increasing depth
			wildcards := strings.Repeat(`*\`, i)
			combinedPath := filepath.Clean(base + wildcards + suffix)
			results = append(results, generateCombinations(combinedPath)...)
		}
	}

	return results
}

func copy_file(src string, dst string) error {
	input, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	err = os.WriteFile(dst, input, 0o644)
	if err != nil {
		return err
	}
	return nil
}

func zip_folder(src string, dst string) error {
	// Create the destination zip file
	zipFile, err := os.Create(dst)
	if err != nil {
		return fmt.Errorf("failed to create zip file: %w", err)
	}
	defer zipFile.Close()

	// Initialize the zip writer
	archive := zip.NewWriter(zipFile)
	defer func() {
		if cerr := archive.Close(); cerr != nil && err == nil {
			err = fmt.Errorf("failed to close archive: %w", cerr)
		}
	}()

	// Walk the directory tree
	err = filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return fmt.Errorf("error accessing path %s: %w", path, err)
		}

		// Skip directories but add them to the zip archive to preserve structure
		if info.IsDir() {
			return nil
		}

		if info.Name() == "apply.json" {
			return nil
		}

		// Open the file to be zipped
		file, err := os.Open(path)
		if err != nil {
			return fmt.Errorf("failed to open file %s: %w", path, err)
		}
		defer file.Close()

		// Create the file header in the archive
		relPath, err := filepath.Rel(filepath.Dir(src), path)
		if err != nil {
			return fmt.Errorf("failed to get relative path: %w", err)
		}

		f, err := archive.Create(relPath)
		if err != nil {
			return fmt.Errorf("failed to create entry for %s in zip file: %w", relPath, err)
		}

		// Copy the file content to the archive
		if _, err = io.Copy(f, file); err != nil {
			return fmt.Errorf("failed to write file %s to archive: %w", relPath, err)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to zip folder %s: %w", src, err)
	}

	return nil
}

func unzip_folder(src, dst string) error {
	// Open the ZIP file
	zipFile, err := os.Open(src)
	if err != nil {
		return fmt.Errorf("failed to open zip file: %w", err)
	}
	defer zipFile.Close()

	// Read the ZIP file
	stat, err := zipFile.Stat()
	if err != nil {
		return fmt.Errorf("failed to get zip file info: %w", err)
	}

	reader, err := zip.NewReader(zipFile, stat.Size())
	if err != nil {
		return fmt.Errorf("failed to create zip reader: %w", err)
	}

	// Extract each file and directory
	for _, file := range reader.File {
		if filepath.Base(file.FileInfo().Name()) == "apply.json" {
			continue
		}

		filePath := filepath.Join(dst, file.Name)

		// Ensure the path is within the destination folder
		if !strings.HasPrefix(filePath, filepath.Clean(dst)+string(os.PathSeparator)) {
			return fmt.Errorf("illegal file path: %s", filePath)
		}

		// If the file is a directory, create it
		if file.FileInfo().IsDir() {
			if err := os.MkdirAll(filePath, os.ModePerm); err != nil {
				return fmt.Errorf("failed to create directory: %w", err)
			}
			continue
		}

		// Ensure parent directory exists
		if err := os.MkdirAll(filepath.Dir(filePath), os.ModePerm); err != nil {
			return fmt.Errorf("failed to create directory for file: %w", err)
		}

		// Extract the file
		destFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, file.Mode())
		if err != nil {
			return fmt.Errorf("failed to open file for writing: %w", err)
		}
		defer destFile.Close()

		fileInArchive, err := file.Open()
		if err != nil {
			return fmt.Errorf("failed to open file in archive: %w", err)
		}
		defer fileInArchive.Close()

		if _, err := io.Copy(destFile, fileInArchive); err != nil {
			return fmt.Errorf("failed to copy file content: %w", err)
		}
	}

	return nil
}

func exists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func is_dir(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}
	return info.IsDir()
}

func (a *App) UUID() string {
	return uuid.NewString()
}

func (a *App) Ext(path string) string {
	return strings.ToLower(filepath.Ext(path))
}

func (a *App) Name(path string) string {
	fullPath := ConvertToFullPath(path)
	if fullPath == "" {
		base := filepath.Base(path)
		return strings.TrimSuffix(base, filepath.Ext(base))
	}
	base := filepath.Base(fullPath)
	return strings.TrimSuffix(base, filepath.Ext(base))
}

func (a *App) Description(path string) string {
	path = ConvertToFullPath(path)
	if path == "" {
		return ""
	}
	link, err := lnk.File(path)
	if err != nil {
		return ""
	}

	return link.StringData.NameString
}

func (a *App) Destination(path string) string {
	path = ConvertToFullPath(path)
	if path == "" {
		return ""
	}
	link, err := lnk.File(path)
	if err != nil {
		return ""
	}

	var destination string

	if link.LinkInfo.LocalBasePath != "" {
		destination = link.LinkInfo.LocalBasePath
	}
	if link.LinkInfo.LocalBasePathUnicode != "" {
		destination = link.LinkInfo.LocalBasePathUnicode
	}

	runtime.LogDebugf(appContext, "Destination: %s", destination)

	return ConvertToGeneralPath(destination)
}

func (a *App) IconLocation(path string) string {
	path = ConvertToFullPath(path)
	if path == "" {
		return ""
	}
	link, err := lnk.File(path)
	if err != nil {
		return ""
	}

	return link.StringData.IconLocation
}

func (a *App) CreateLastTab(path string) {
	tempFilePath := filepath.Join(tempFolder, "iconium-last-tab.txt")

	if err := os.WriteFile(tempFilePath, []byte(path), 0o644); err != nil {
		runtime.LogErrorf(appContext, "Error writing last tab path: %s", err)
	}
}

func (a *App) ReadLastTab() string {
	tempFilePath := filepath.Join(tempFolder, "iconium-last-tab.txt")

	if _, err := os.Stat(tempFilePath); errors.Is(err, os.ErrNotExist) {
		return ""
	}

	content, err := os.ReadFile(tempFilePath)
	if err != nil {
		runtime.LogErrorf(appContext, "Error reading last tab path: %s", err)
		return ""
	}

	// Delete the temp file
	if err := os.Remove(tempFilePath); err != nil {
		runtime.LogErrorf(appContext, "Error removing temp file: %s", err)
	}

	return string(content)
}
