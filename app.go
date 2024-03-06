package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"os/user"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	lnk "github.com/parsiya/golnk"
	runtime "github.com/wailsapp/wails/v2/pkg/runtime"
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
	IconName        string `json:"iconName"`
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

func CheckErr(err error, msg string, fatal bool) {
	if err != nil {
		fmt.Printf("%s - %v\n", msg, err)
		if fatal {
			panic(msg)
		}
	}
}

// Copy copies the contents of the file at srcpath to a regular file
// at dstpath. If the file named by dstpath already exists, it is
// truncated. The function does not copy the file mode, file
// permission bits, or file attributes.
// Source: https://stackoverflow.com/a/74107689
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

	CheckErr(err, "Failed to get user config dir", true)

	return filepath.Join(userConfigDir, "desktop-manager")
}

func getProfileDir() string {
	return filepath.Join(getSaveDir(), "profiles")
}

func getIconDir(profileName string) string {
	return filepath.Join(getSaveDir(), "icon", profileName)
}

func getBase64Dir(profileName string) string {
	return filepath.Join(getIconDir(profileName), "base64")
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

func GetFileInfo(path string, file fs.DirEntry) fileInfo {
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

		return lnkInfo
	} else if fileName != "desktop.ini" {
		return fileInfo{
			Name:      noExtFileName,
			Path:      filepath.Join(path, fileName),
			Extension: extension,
			IsFolder:  file.IsDir(),
		}
	} else {
		return fileInfo{}
	}
}

func GetIcons(paths []string) []fileInfo {
	icons := []fileInfo{}

	for _, path := range paths {
		currentFiles, pathError := os.ReadDir(path)

		if pathError != nil {
			println("Path not found:", path)
		}

		for _, file := range currentFiles {
			fileInfo := GetFileInfo(path, file)

			if fileInfo.Path != "" {
				icons = append(icons, fileInfo)
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

func (a *App) GetFileInfo(profileName string) fileInfo {
	defaultDirectory := getDesktopPaths()[0]

	println("Default directory: ", defaultDirectory)

	result, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory: defaultDirectory,
		Title:            "Select Icon",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Shortcuts (*.lnk)",
				Pattern:     "*.lnk",
			},
		},
	})

	if err != nil {
		fmt.Println(err)
	}

	println("Selected file: ", result)

	if len(result) == 0 {
		return fileInfo{}
	} else {
		var file fs.DirEntry

		files, err := os.ReadDir(filepath.Dir(result))
		CheckErr(err, "Failed to read directory", false)
		for _, f := range files {
			if f.Name() == filepath.Base(result) {
				file = f
				break
			}
		}

		fileInfo := GetFileInfo(filepath.Dir(result), file)

		return fileInfo
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

func (a *App) GetIcon(profile string, iconName string) string {
	saveDir := filepath.Join(getBase64Dir(profile), iconName+".ico")

	bytes, err := os.ReadFile(saveDir)
	CheckErr(err, "Failed to read icon file", false)

	return string(bytes)
}

func GenerateIcon(profile string, filePath string, fileName string) {
	// Create folder
	err := os.MkdirAll(getBase64Dir(profile), os.ModePerm)
	CheckErr(err, "Failed to create base64 image folder", false)

	destination := filepath.Join(getBase64Dir(profile), fileName)

	// Read the entire file into a byte slice
	bytes, err := os.ReadFile(filePath)
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

func (a *App) SaveIcon(profile string, fileInfo fileInfo) string {
	var defaultDirectory string

	if fileInfo.IconDestination != "" {
		defaultDirectory = filepath.Dir(fileInfo.IconDestination)
	} else if fileInfo.Destination != "" {
		defaultDirectory = filepath.Dir(fileInfo.Destination)
	} else {
		defaultDirectory = getDesktopPaths()[0]
	}

	println("Default directory: ", defaultDirectory)

	result, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		DefaultDirectory: defaultDirectory,
		Title:            "Select Icon",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "*.ico",
				Pattern:     "*.ico",
			},
		},
	})

	if err != nil {
		fmt.Println(err)
	}

	println("Selected file: ", result)

	if len(result) == 0 {
		return ""
	} else {
		if fileInfo.IconName != "" {
			// Delete existing icon
			err := os.Remove(filepath.Join(getIconDir(profile), fileInfo.IconName+".ico"))
			if err != nil {
				fmt.Println(err)
			}

			// Delete base64 version
			err = os.Remove(filepath.Join(getBase64Dir(profile), fileInfo.IconName+".ico"))
			if err != nil {
				fmt.Println(err)
			}
		}

		uuid := uuid.New().String()
		savePath := filepath.Join(getIconDir(profile), uuid+".ico")

		// Create dir
		noFolderErr := os.MkdirAll(filepath.Dir(savePath), os.ModePerm)
		if noFolderErr != nil {
			fmt.Println(noFolderErr)
		}

		// Copy icon
		err := Copy(result, savePath)
		if err != nil {
			fmt.Println(err)
		}

		// Generate base64 version
		GenerateIcon(profile, result, uuid+".ico")

		return uuid
	}
}
