package main

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

var allowedImageExtensionsPng = []string{".ico", ".png", ".jpg", ".jpeg", ".bmp", ".webp", ".svg"}

var allowedImageExtensionsIco = []string{".png", ".jpg", ".jpeg"}

func GetMaskPath(radius, opacity int) (string, error) {
	if radius <= 0 {
		radius = 1
	} else if radius > 100 {
		radius = 100
	}
	if opacity < 0 {
		opacity = 0
	} else if opacity > 100 {
		opacity = 100
	}

	// Create a rounded rectangle mask
	maskPath := filepath.Join(maskFolder, fmt.Sprintf("mask_r%d_o%d.png", radius, opacity))

	// Check if the mask already exists
	if _, err := os.Stat(maskPath); err == nil {
		return maskPath, nil
	}

	// Round the corner radius to the closest integer
	roundedRadius := int(math.Round(float64(radius) * 2.56))
	opacityPercent := fmt.Sprintf("%.2f", float64(opacity)/100.0)

	maskArgs := []string{
		imageMagickPath,
		"-size", "256x256",
		"xc:none",
		"-draw", fmt.Sprintf("fill rgba(0,0,0,%s) roundrectangle 0,0,255,255,%d,%d", opacityPercent, roundedRadius, roundedRadius),
		maskPath,
	}

	// Execute ImageMagick command to create mask
	_, err := sendCommand(maskArgs...)
	if err != nil {
		return "", fmt.Errorf("error creating mask: %ws", err)
	}

	return maskPath, nil
}

// ConvertToIco converts an image to an ICO file with specified corner radius
func ConvertToIco(path string, destination string, settings IconPackSettings) error {
	extension := filepath.Ext(path)

	// Check if the input file has a valid image extension
	if extension != ".png" {
		return fmt.Errorf("invalid image extension: %s", extension)
	}

	maskPath, err := GetMaskPath(settings.CornerRadius, settings.Opacity)

	if err != nil {
		return err
	}

	// Build ImageMagick command arguments to apply the mask and convert to ICO
	args := []string{
		imageMagickPath,
		path,
		maskPath,
		"-compose", "DstIn",
		"-composite",
		"-define", "icon:auto-resize=16,24,32,48,64,72,96,128,256",
		destination,
	}

	// Execute ImageMagick command silently
	_, err = sendCommand(args...)
	if err != nil {
		return fmt.Errorf("error converting image: %w", err)
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

	if extension != ".ico" {
		tempIconPath = destination
	}

	// Build magick command arguments
	args := []string{imageMagickPath, path, "-alpha", "on", "-background", "none", tempIconPath}

	if extension != ".ico" {
		args = []string{imageMagickPath, path, "-alpha", "on", "-background", "none", "-resize", "256x256\\!", tempIconPath}
	}

	// Execute magick command silently
	_, err = sendCommand(args...)
	if err != nil {
		return fmt.Errorf("error converting image: %w", err)
	}

	if extension == ".ico" {
		files, err := os.ReadDir(tempIconFolder)
		if err != nil {
			return err
		}

		largestFile := "icon.png"

		// Delete the icons other than the largest one
		if len(files) > 1 {
			largestWidth := -1
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
		}

		// Move the largest icon to the destination
		err = os.Rename(filepath.Join(tempIconFolder, largestFile), destination)
		if err != nil {
			return err
		}
	}

	return nil
}

func GetImageWidth(path string) (int, error) {
	extension := filepath.Ext(path)

	if !contains(allowedImageExtensionsIco, extension) {
		return -1, fmt.Errorf("invalid image extension: %s", extension)
	}

	// Build magick command arguments
	args := []string{imageMagickPath, "identify", "-ping", "-format", "%w", path}

	// Execute magick command silently
	output, err := sendCommand(args...)
	if err != nil {
		return -1, fmt.Errorf("error getting image width: %w\n%s", err, output)
	}

	width, err := strconv.Atoi(strings.TrimSpace(output))

	if err != nil {
		return -1, err
	}

	return width, nil
}
