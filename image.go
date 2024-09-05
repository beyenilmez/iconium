package main

import (
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	lnk "github.com/parsiya/golnk"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gopkg.in/ini.v1"
)

var allowedImageExtensionsPng = []string{".ico", ".png", ".jpg", ".jpeg", ".bmp", ".webp", ".svg", ".exe", ".lnk", ".url"}

var allowedImageExtensionsIco = []string{".png", ".jpg", ".jpeg"}

func GetMaskPath(radius int) (string, error) {
	if radius <= 0 {
		radius = 1
	} else if radius > 100 {
		radius = 100
	}

	// Create a rounded rectangle mask
	maskPath := filepath.Join(maskFolder, fmt.Sprintf("mask_r%d.png", radius))

	// Check if the mask already exists
	if _, err := os.Stat(maskPath); err == nil {
		return maskPath, nil
	}

	// Round the corner radius to the closest integer
	roundedRadius := int(math.Round(float64(radius) * 2.56))

	maskArgs := []string{
		imageMagickPath,
		"-size", fmt.Sprintf("%dx%d", 256, 256), // Set the size of the canvas
		"xc:none",        // Create a blank canvas with transparency
		"-fill", "white", // Set the fill color to white for the mask
		"-draw", fmt.Sprintf("roundrectangle 0,0 %d,%d %d,%d", 255, 255, roundedRadius, roundedRadius), // Draw a rounded rectangle with the specified corner radius
		"-alpha", "off", // Turn off alpha
		maskPath, // Save the mask to the destination file
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

	maskPath, err := GetMaskPath(settings.CornerRadius)

	if err != nil {
		return err
	}

	args := []string{
		imageMagickPath,
		path,
		maskPath,
		"-alpha", "off",
		"-compose", "CopyOpacity",
		"-composite",
		"-define", "icon:auto-resize=16,24,32,48,64,72,96,128,256",
		"-channel", "A", // target the alpha channel
		"-evaluate", "Multiply", fmt.Sprintf("%.2f", (float64(settings.Opacity) / 100.0)), // apply the opacity adjustment
		"-channel", "RGBA", // reset channel targeting
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

	if !is_dir(path) && !contains(allowedImageExtensionsPng, extension) {
		return fmt.Errorf("invalid image extension: %s", extension)
	}

	iconDestination := ""
	iconLocation := ""

	if extension == ".lnk" {
		link, err := lnk.File(path)
		if err != nil {
			return fmt.Errorf("failed to open .lnk file: %w", err)
		}

		iconLocation := link.StringData.IconLocation
		iconDestination = link.LinkInfo.LocalBasePath

		if strings.ToLower(filepath.Ext(iconLocation)) == ".ico" {
			err = ConvertToPng(iconLocation, destination)
			if err == nil {
				return nil
			}
		}
	} else if extension == ".url" {
		iniContent, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("failed to open .url file: %w", err)
		}
		iniFile, err := ini.Load(iniContent)
		if err != nil {
			return fmt.Errorf("failed to parse .url file: %w", err)
		}

		section := iniFile.Section("InternetShortcut")
		iconLocation = section.Key("IconFile").String()

		return ConvertToPng(iconLocation, destination)
	}

	// Build magick command arguments
	args := []string{extractIconPath, path, destination}
	useImagick := extension != ".ico" && extension != ".exe" && extension != ".lnk" && !is_dir(path)

	if useImagick {
		args = []string{imageMagickPath, path, "-alpha", "on", "-background", "none", "-resize", "256x256\\!", destination}
	}

	runtime.LogDebugf(appContext, "ConvertToPng: %s", strings.Join(args, " "))

	// Execute magick command silently
	_, err := sendCommand(args...)

	if err != nil {
		if extension == ".lnk" {
			if strings.ToLower(filepath.Ext(iconLocation)) != ".ico" {
				err = ConvertToPng(iconLocation, destination)
				if err == nil {
					return nil
				}
			}
			return ConvertToPng(iconDestination, destination)
		}
		return fmt.Errorf("error converting image: %w", err)
	} else {
		if !useImagick {
			width, err := GetImageWidth(destination)
			if err != nil {
				return err
			}

			if width != 256 {
				resizeArgs := []string{imageMagickPath, destination, "-resize", "256x256", destination}
				runtime.LogDebugf(appContext, "ConvertToPng: %s", strings.Join(resizeArgs, " "))

				// Execute magick command silently
				_, err := sendCommand(resizeArgs...)
				if err != nil {
					return fmt.Errorf("error resizing image: %w", err)
				}
			}
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
