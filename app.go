package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	lnk "github.com/parsiya/golnk"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

type fileInfo struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	Path            string `json:"path"`
	Destination     string `json:"destination"`
	IconDestination string `json:"iconDestination"`
	IconIndex       int    `json:"iconIndex"`
	Extension       string `json:"extension"`
	IsFolder        bool   `json:"isFolder"`
	IconId          string `json:"iconId"`
}

type profileInfo struct {
	Value any    `json:"value"`
	Label string `json:"label"`
}

type profile struct {
	Name  string     `json:"name"`
	Id    string     `json:"id"`
	Value []fileInfo `json:"value"`
}

// Copy copies the contents of the file at srcpath to a regular file
// at dstpath. If the file named by dstpath already exists, it is
// truncated. The function does not copy the file mode, file
// permission bits, or file attributes.
func Copy(srcpath, dstpath string) (err error) {
	r, err := os.Open(srcpath)
	if err != nil {
		return err
	}
	defer r.Close() // ignore error: file was opened read-only.

	w, err := os.Create(dstpath)
	if err != nil {
		return err
	}

	defer func() {
		// Report the error, if any, from Close, but do so
		// only if there isn't already an outgoing error.
		if c := w.Close(); err == nil {
			err = c
		}
	}()

	_, err = io.Copy(w, r)
	return err
}

func getSaveDir() string {
	userConfigDir, err := os.UserConfigDir()

	if err != nil {
		println("User config dir not found")
		println(err)
	}

	return filepath.Join(userConfigDir, "desktop-manager")
}

func getProfileDir() string {
	return filepath.Join(getSaveDir(), "profiles")
}

func getDesktopPaths() []string {
	myself, err := user.Current()
	if err != nil {
		panic(err)
	}
	homedir := myself.HomeDir
	desktop := filepath.Join(homedir, "Desktop")

	public := "C:\\Users\\Public\\Desktop"

	return []string{desktop, public}
}

func GetIcons(paths []string) []fileInfo {
	icons := []fileInfo{}

	for _, path := range paths {
		currentFiles, pathError := os.ReadDir(path)

		if pathError != nil {
			println("Path not found:", path)
		}

		for _, file := range currentFiles {
			fileName := file.Name()
			extension := filepath.Ext(fileName)
			noExtFileName := strings.TrimSuffix(fileName, extension)

			if extension == ".lnk" {
				filePath := filepath.Join(path, fileName)

				lnkInfo := fileInfo{
					Name:            noExtFileName,
					Description:     "",
					Path:            filePath,
					Destination:     "",
					IconDestination: "",
					IconIndex:       0,
					Extension:       extension,
					IsFolder:        false,
				}

				f, lnkError := lnk.File(filePath)
				if lnkError != nil {
					println(lnkError)
				}

				if f.StringData.NameString != "" {
					lnkInfo.Description = f.StringData.NameString
				}

				if f.LinkInfo.LocalBasePath != "" {
					lnkInfo.Destination = f.LinkInfo.LocalBasePath
				}
				if f.LinkInfo.LocalBasePathUnicode != "" {
					lnkInfo.Destination = f.LinkInfo.LocalBasePathUnicode
				}

				if f.StringData.IconLocation != "" {
					lnkInfo.IconDestination = f.StringData.IconLocation
				}

				if f.Header.IconIndex != 0 {
					lnkInfo.IconIndex = int(f.Header.IconIndex)
				}

				icons = append(icons, lnkInfo)
			} else if fileName != "desktop.ini" {
				icons = append(icons, fileInfo{
					Name:      noExtFileName,
					Path:      filepath.Join(path, fileName),
					Extension: extension,
					IsFolder:  file.IsDir(),
				})
			}
		}
	}

	return icons
}

func (a *App) AddProfile(name string) {
	// Get desktop icons
	fileInfos := GetIcons(getDesktopPaths())

	// Create profile
	profile := profile{
		Name:  name,
		Id:    uuid.New().String(),
		Value: fileInfos,
	}

	// Convert to JSON
	profileJSON, marshallErr := json.Marshal(profile)
	if marshallErr != nil {
		fmt.Println(marshallErr)
	}

	// Get save directory
	profileDir := getProfileDir()

	// Create folder
	noFolderErr := os.MkdirAll(profileDir, os.ModePerm)
	if noFolderErr != nil {
		fmt.Println(noFolderErr)
	}

	// Write json
	err := os.WriteFile(filepath.Join(profileDir, name), profileJSON, 0644)
	if err != nil {
		fmt.Println(err)
	}
}

func (a *App) GetDesktopIcons() []fileInfo {
	return GetIcons(getDesktopPaths())
}

func (a *App) GetProfiles() []profileInfo {
	saveDir := getProfileDir()

	profiles, profilesError := os.ReadDir(saveDir)

	if profilesError != nil {
		println("No profile found in ", saveDir)
	}

	profileInfos := []profileInfo{}

	for _, profile := range profiles {
		profileInfos = append(profileInfos, profileInfo{
			Value: profile.Name(),
			Label: profile.Name(),
		})
	}

	return profileInfos
}

func (a *App) GetProfile(profileName string) profile {
	saveDir := getProfileDir()

	profileValue, err := os.ReadFile(filepath.Join(saveDir, profileName))
	if err != nil {
		fmt.Println(err)
	}

	var profileInfoSlice profile
	jsonErr := json.Unmarshal(profileValue, &profileInfoSlice)
	if jsonErr != nil {
		fmt.Println(jsonErr)
	}

	valueBytes, marshalErr := json.Marshal(profileInfoSlice.Value)
	if marshalErr != nil {
		fmt.Println(marshalErr)
	}

	var fileInfoSlice []fileInfo
	jsonErr = json.Unmarshal(valueBytes, &fileInfoSlice)
	if jsonErr != nil {
		fmt.Println(jsonErr)
	}

	profile := profile{
		Name:  profileName,
		Value: fileInfoSlice,
	}

	for _, file := range fileInfoSlice {

		if filepath.Ext(file.IconDestination) == ".ico" {
			// Create folder
			noFolderErr := os.MkdirAll(filepath.Join(getSaveDir(), "icon", profileName), os.ModePerm)
			if noFolderErr != nil {
				fmt.Println(noFolderErr)
			}

			destination := filepath.Join(getSaveDir(), "icon", profileName, file.Name+file.Extension+".ico")

			// Read the entire file into a byte slice
			bytes, err := os.ReadFile(file.IconDestination)
			if err != nil {
				fmt.Println(err)
			}

			var base64Encoding string

			// Determine the content type of the image file
			mimeType := http.DetectContentType(bytes)

			// Prepend the appropriate URI scheme header depending
			// on the MIME type
			switch mimeType {
			case "image/x-icon":
				base64Encoding += "data:image/x-icon;base64,"
			default:
				fmt.Println("Unknown MIME type: ", mimeType)
			}

			// Append the base64 encoded output
			base64Encoding += toBase64(bytes)

			// Write the full base64 representation of the image to file
			wErr := os.WriteFile(destination, []byte(base64Encoding), 0644)

			if wErr != nil {
				fmt.Println(wErr)
			}
		}
	}

	return profile
}

func (a *App) SaveProfile(profileName string, profile string) {
	// Write directly
	err := os.WriteFile(filepath.Join(getProfileDir(), profileName), []byte(profile), 0644)

	if err != nil {
		fmt.Println(err)
	}
}

func toBase64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func (a *App) GetIcon(profile string, fileInfo fileInfo) string {
	saveDir := filepath.Join(getSaveDir(), "icon", profile, fileInfo.Name+fileInfo.Extension+".ico")

	// Read the entire file into a byte slice
	bytes, err := os.ReadFile(saveDir)
	if err != nil {
		fmt.Println(err)
	}

	return string(bytes)
}
