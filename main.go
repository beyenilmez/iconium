package main

import (
	"embed"
	"log"
	"os"
	"path"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	err := config_init()
	if err != nil {
		log.Println(err)
	}

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

	// Create application with options
	err = wails.Run(&options.App{
		Title:             "Desktop Manager",
		Width:             1280,
		Height:            800,
		MinWidth:          1024,
		MinHeight:         768,
		DisableResize:     false,
		Frameless:         !*config.UseSystemTitleBar,
		StartHidden:       false,
		HideWindowOnClose: false,
		BackgroundColour:  &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
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
		Bind: []interface{}{
			app,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			DisableWindowIcon:    false,
			BackdropType:         windows.Acrylic,
			// DisableFramelessWindowDecorations: false,
			WebviewUserDataPath: path.Join(os.Getenv("APPDATA"), "desktop-manager"),
			ZoomFactor:          1.0,
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
