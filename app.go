package main

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/gen2brain/beeep"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

var appContext context.Context

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	appContext = ctx

	runtime.LogInfo(appContext, "Starting application")

	// Set window position
	runtime.LogInfo(appContext, "Setting window position")
	if *config.WindowStartPositionX >= 0 && *config.WindowStartPositionY >= 0 {
		runtime.WindowSetPosition(appContext, *config.WindowStartPositionX, *config.WindowStartPositionY)
	}

	// Initiate paths
	runtime.LogInfo(appContext, "Initiating paths")
	err := path_init()

	if err != nil {
		runtime.LogError(appContext, err.Error())
	}

	// Delete old log files
	runtime.LogInfo(appContext, "Deleting old log files")
	delete_old_logs()

	// Check if configPath exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		onFirstRun()
	}
}

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	if runtime.WindowIsMaximised(a.ctx) {
		var windowState = 2
		config.WindowStartState = &windowState
		runtime.LogInfo(a.ctx, "Setting window state to maximized")
	} else {
		var windowState = 0
		config.WindowStartState = &windowState
		runtime.LogInfo(a.ctx, "Setting window state to normal")
	}

	windowPositionX, windowPositionY := runtime.WindowGetPosition(a.ctx)
	config.WindowStartPositionX, config.WindowStartPositionY = &windowPositionX, &windowPositionY
	runtime.LogInfo(a.ctx, fmt.Sprintf("Setting window position to %d,%d", windowPositionX, windowPositionY))

	runtime.LogInfo(a.ctx, "Saving config")
	err := WriteConfig(configPath)

	if err != nil {
		runtime.LogError(a.ctx, err.Error())
		return false
	}

	runtime.LogInfo(a.ctx, "Saving config complete")

	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// onSecondInstanceLaunch is called when the application is launched from a second instance
func (a *App) onSecondInstanceLaunch(secondInstanceData options.SecondInstanceData) {
	secondInstanceArgs := secondInstanceData.Args

	runtime.LogDebug(a.ctx, "User opened a second instance "+strings.Join(secondInstanceArgs, ","))
	runtime.LogDebug(a.ctx, "User opened a second instance from "+secondInstanceData.WorkingDirectory)

	runtime.WindowUnminimise(a.ctx)
	runtime.Show(a.ctx)
	go runtime.EventsEmit(a.ctx, "launchArgs", secondInstanceArgs)
}

func onFirstRun() {
	runtime.LogInfo(appContext, "First run detected")

	runtime.LogInfo(appContext, "Setting default system language")
	set_system_language()
}

// Send notification
func (a *App) SendNotification(title string, message string, path string, variant string) {
	runtime.LogInfo(a.ctx, "Sending notification")

	if runtime.WindowIsNormal(a.ctx) || runtime.WindowIsMaximised(a.ctx) || runtime.WindowIsFullscreen(a.ctx) {
		if path != "" {
			runtime.WindowExecJS(a.ctx, `window.toast({
				title: "`+title+`", 
				description: "`+message+`",
				path: "`+path+`",
				variant: "`+variant+`"
				});`)
		} else {
			runtime.WindowExecJS(a.ctx, `window.toast({
				title: "`+title+`", 
				description: "`+message+`",
				variant: "`+variant+`"
				});`)
		}
	} else {
		err := beeep.Notify(title, message, appIconPath)
		if err != nil {
			runtime.LogError(a.ctx, "Error sending notification: "+err.Error())
		}
	}
}
