package main

import (
	"context"

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

	// Initiate paths
	runtime.LogInfo(appContext, "Initiating paths")
	err := path_init()

	if err != nil {
		runtime.LogError(appContext, err.Error())
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
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
}

// Log logs a message
func (a *App) Log(msg string, level int) {
	switch level {
	case 1:
		runtime.LogTrace(a.ctx, msg)
	case 2:
		runtime.LogDebug(a.ctx, msg)
	case 3:
		runtime.LogInfo(a.ctx, msg)
	case 4:
		runtime.LogWarning(a.ctx, msg)
	case 5:
		runtime.LogError(a.ctx, msg)
	default:
		runtime.LogFatal(a.ctx, msg)
	}
}

// Quits the application
func (a *App) Quit() {
	runtime.LogInfo(a.ctx, "Quitting application")
	runtime.Quit(a.ctx)
}

// Maximize the application
func (a *App) Maximize() {
	if runtime.WindowIsMaximised(a.ctx) {
		runtime.LogInfo(a.ctx, "Unmaximizing window")
		runtime.WindowUnmaximise(a.ctx)
	} else {
		runtime.LogInfo(a.ctx, "Maximizing window")
		runtime.WindowMaximise(a.ctx)
	}
}

// Minimize the application
func (a *App) Minimize() {
	runtime.LogInfo(a.ctx, "Minimizing window")
	runtime.WindowMinimise(a.ctx)
}

type Config struct {
	Theme string `json:"theme"`
}

func GetDefaultConfig() Config {
	return Config{
		Theme: "system",
	}
}
