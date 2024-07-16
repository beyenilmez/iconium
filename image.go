package main

import (
	"bytes"
	"fmt"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

var allowedImageExtensionsPng = []string{".ico"}

var allowedImageExtensionsIco = []string{".png", ".jpg", ".jpeg"}

func GetMaskPath(radius int) (string, error) {
	if radius <= 0 {
		radius = 1
	} else if radius > 100 {
		radius = 100
	}

	// Create a rounded rectangle mask
	maskPath := filepath.Join(maskFolder, fmt.Sprintf("mask_%d.png", radius))

	// Check if the mask already exists
	if _, err := os.Stat(maskPath); err == nil {
		return maskPath, nil
	}

	// Round the corner radius to the closest integer
	roundedRadius := int(math.Round(float64(radius) * 1.28))

	maskArgs := []string{
		"-size", "256x256",
		"xc:none",
		"-draw", fmt.Sprintf("roundrectangle 0,0,255,255,%d,%d", roundedRadius, roundedRadius),
		maskPath,
	}

	// Execute ImageMagick command to create mask
	maskCmd := exec.Command(imageMagickPath, maskArgs...)
	var maskStderr bytes.Buffer
	maskCmd.Stderr = &maskStderr

	err := maskCmd.Run()
	if err != nil {
		return "", fmt.Errorf("error creating mask: %w\n%s", err, maskStderr.String())
	}

	return maskPath, nil
}

// ConvertToIco converts an image to an ICO file with specified corner radius
func ConvertToIco(path string, destination string) error {
	extension := filepath.Ext(path)

	// Check if the input file has a valid image extension
	if !contains([]string{".png", ".jpg", ".jpeg", ".bmp", ".gif"}, extension) {
		return fmt.Errorf("invalid image extension: %s", extension)
	}

	maskPath, err := GetMaskPath(0)

	if err != nil {
		return err
	}

	// Build ImageMagick command arguments to apply the mask and convert to ICO
	args := []string{
		path,
		maskPath,
		"-compose", "DstIn",
		"-composite",
		"-define", "icon:auto-resize=16,24,32,48,64,72,96,128,256",
		destination,
	}

	// Execute ImageMagick command silently
	cmd := exec.Command(imageMagickPath, args...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	err = cmd.Run()
	if err != nil {
		return fmt.Errorf("error converting image: %w\n%s", err, stderr.String())
	}

	return nil
}

func ConvertToPng(path string, destination string) error {
	extension := filepath.Ext(path)

	if !contains(allowedImageExtensionsPng, extension) {
		return fmt.Errorf("invalid image extension: %s", extension)
	}

	tempIconFolder := filepath.Join(tempFolder, "iconium-"+uuid.NewString())
	err := create_folder(tempIconFolder)
	if err != nil {
		return err
	}
	defer os.RemoveAll(tempIconFolder)
	tempIconPath := filepath.Join(tempIconFolder, "icon.png")

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

	if !contains(allowedImageExtensionsIco, extension) {
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
