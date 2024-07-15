package main

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
)

var allowedImageExtensions = []string{".ico"}

func ConvertToPng(path string, destination string) error {
	extension := filepath.Ext(path)

	if !contains(allowedImageExtensions, extension) {
		return fmt.Errorf("invalid image extension: %s", extension)
	}

	tempIconFolder := filepath.Join(tempFolder, "icons")
	err := create_folder(tempIconFolder)
	if err != nil {
		return err
	}
	defer os.RemoveAll(tempIconFolder)
	tempIconPath := filepath.Join(tempIconFolder, "icon.ico")

	// Build magick command arguments
	args := []string{path, "-alpha", "on", "-background", "none", tempIconPath}

	// Execute magick command silently
	cmd := exec.Command(imageMagickPath, args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("error converting image: %w\n%s", err, stderr.String())
	}

	// Delete the icons other than the largest one
	files, err := os.ReadDir(tempIconFolder)
	if err != nil {
		return err
	}

	largestWidth := -1
	var largestFile string
	for _, file := range files {
		width, err := GetImageWidth(filepath.Join(tempIconFolder, file.Name()))
		if err != nil {
			return err
		}

		if width > largestWidth {
			largestWidth = width
			largestFile = file.Name()
		}
	}

	// Move the largest icon to the destination
	err = os.Rename(filepath.Join(tempIconFolder, largestFile), destination)
	if err != nil {
		return err
	}

	return nil
}

func GetImageWidth(path string) (int, error) {
	extension := filepath.Ext(path)

	if !contains(allowedImageExtensions, extension) {
		return -1, fmt.Errorf("invalid image extension: %s", extension)
	}

	// Build magick command arguments
	args := []string{"identify", "-ping", "-format", "%w", path}

	// Execute magick command silently
	cmd := exec.Command(imageMagickPath, args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	output, err := cmd.Output()
	if err != nil {
		return -1, fmt.Errorf("error getting image width: %w\n%s", err, stderr.String())
	}

	width, err := strconv.Atoi(strings.TrimSpace(string(output)))

	if err != nil {
		return -1, err
	}

	return width, nil
}
