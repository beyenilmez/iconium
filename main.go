package main

import (
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var appIcon []byte

//go:embed wails.json
var wailsJSON []byte

var version string
var NeedsAdminPrivileges bool
var args []string

type FileLoader struct {
	http.Handler
}

func NewFileLoader() *FileLoader {
	return &FileLoader{}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	requestedFilename := strings.TrimPrefix(filepath.Join("C:\\Users\\bedoy\\AppData\\Roaming\\iconium", req.URL.Path), "/")
	println("Requesting file:", requestedFilename)
	fileData, err := os.ReadFile(requestedFilename)
	if err != nil {
		res.WriteHeader(http.StatusBadRequest)
		res.Write([]byte(fmt.Sprintf("Could not load file %s", requestedFilename)))
	}

	res.Write(fileData)
}

func main() {
	// Create an instance of the app structure
	app := NewApp()

	// Config
	err := config_init()
	if err != nil {
		log.Println(err)
	}

	// Logger
	var fileLogger Logger

	if *config.EnableLogging {
		logsFolder, err = get_logs_folder()
		if err != nil {
			log.Println(err)
		}

		logFile := path.Join(logsFolder, time.Now().Format("2006-01-02_15-04-05")+".log")
		fileLogger = NewLogger(logFile)
	}

	// Window State
	windowsStateInt := *config.WindowStartState
	windowState := options.Normal

	switch windowsStateInt {
	case 1:
		windowState = options.Minimised
	case 2:
		windowState = options.Maximised
	case 3:
		windowState = options.Fullscreen
	}

	// Window Effect
	windowEffectInt := *config.WindowEffect
	windowEffect := windows.Auto
	windowTransparent := true

	switch windowEffectInt {
	case 1:
		windowEffect = windows.None
		windowTransparent = false
	case 2:
		windowEffect = windows.Mica
	case 3:
		windowEffect = windows.Acrylic
	case 4:
		windowEffect = windows.Tabbed
	}

	// Create application with options
	err = wails.Run(&options.App{
		Title:             "Iconium",
		Width:             1280,
		Height:            800,
		MinWidth:          1024,
		MinHeight:         768,
		DisableResize:     false,
		Frameless:         !*config.UseSystemTitleBar,
		StartHidden:       true,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		AssetServer: &assetserver.Options{
			Assets:  assets,
			Handler: NewFileLoader(),
		},
		Menu:               nil,
		Logger:             fileLogger,
		LogLevel:           logger.TRACE,
		LogLevelProduction: logger.TRACE,
		OnStartup:          app.startup,
		OnDomReady:         app.domReady,
		OnBeforeClose:      app.beforeClose,
		OnShutdown:         app.shutdown,
		WindowStartState:   windowState,
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId:               "4d1e7b7b-42a3-4357-92f3-425b1087b545",
			OnSecondInstanceLaunch: app.onSecondInstanceLaunch,
		},
		Bind: []interface{}{
			app,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: windowTransparent,
			WindowIsTranslucent:  windowTransparent,
			DisableWindowIcon:    false,
			BackdropType:         windowEffect,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: path.Join(os.Getenv("APPDATA"), "iconium"),
			ZoomFactor:          1.0,
			DisablePinchZoom:    true,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}

func sendCommand(command ...string) (string, error) {
	// Use `exec.Command` to send a command to the existing cmd window
	cmd := exec.Command("cmd.exe", append([]string{"/C"}, command...)...)
	cmd.SysProcAttr = &syscall.SysProcAttr{
		HideWindow: true,
	}

	output, err := cmd.Output()

	return string(output), err
}
