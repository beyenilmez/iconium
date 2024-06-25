package main

import (
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (app *App) SetTheme(theme string) {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Setting windows theme to %s", theme))
	switch theme {
	case "light":
		runtime.WindowSetLightTheme(app.ctx)
	case "dark":
		runtime.WindowSetDarkTheme(app.ctx)
	case "system":
		runtime.WindowSetSystemDefaultTheme(app.ctx)
	}
}
