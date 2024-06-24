package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Config struct {
	Theme             *string `json:"theme"`             // system, light, dark
	UseSystemTitleBar *bool   `json:"useSystemTitleBar"` // true, false
}

func GetDefaultConfig() Config {
	defaultTheme := "system"
	defaultUseSystemTitleBar := false
	return Config{
		Theme:             &defaultTheme,
		UseSystemTitleBar: &defaultUseSystemTitleBar,
	}
}

var config Config = GetDefaultConfig()

func (app *App) GetTheme() string {
	if config.Theme == nil {
		return "undefined"
	}
	return *config.Theme
}

func (app *App) SetTheme(theme string) {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Setting theme to %s", theme))

	config.Theme = &theme
	err := SetConfig(config)

	if err != nil {
		runtime.LogError(app.ctx, err.Error())
	}

	runtime.LogInfo(app.ctx, fmt.Sprintf("Setted theme to %s", theme))
}

func (app *App) GetUseSystemTitleBar() bool {
	if config.UseSystemTitleBar == nil {
		return false
	}
	return *config.UseSystemTitleBar
}

func (app *App) SetUseSystemTitleBar(useSystemTitleBar bool) {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Setting useSystemTitleBar to %t", useSystemTitleBar))

	config.UseSystemTitleBar = &useSystemTitleBar
	err := SetConfig(config)

	if err != nil {
		runtime.LogError(app.ctx, err.Error())
	}

	runtime.LogInfo(app.ctx, fmt.Sprintf("Setted useSystemTitleBar to %t", useSystemTitleBar))
}

func config_init() error {
	err := CreateConfig()
	if err != nil {
		return errors.New("failed to create config file")
	}
	err = ReadConfig()
	if err != nil {
		return errors.New("failed to read config file")
	}

	merge_defaults()

	return nil
}

func merge_defaults() {
	defaultConfig := GetDefaultConfig()

	fmt.Println("Merging default config")

	merged := false

	if config.Theme == nil {
		config.Theme = defaultConfig.Theme
		merged = true
	}
	if config.UseSystemTitleBar == nil {
		config.UseSystemTitleBar = defaultConfig.UseSystemTitleBar
		merged = true
	}

	if merged {
		SetConfig(config)
	}
}

// Set default config to configPath
func SetDefaultConfig() error {
	config = GetDefaultConfig()
	return WriteConfig()
}

// GetConfig returns the current config
func GetConfig() Config {
	return config
}

// SetConfig sets the current config
func SetConfig(newConfig Config) error {
	config = newConfig
	return WriteConfig()
}

// Creates a default config at configPath if none exists
func CreateConfig() error {
	configPath = get_config_path()

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return SetDefaultConfig()
	}
	return nil
}

// WriteConfig writes the current config to the configPath
func WriteConfig() error {
	file, err := os.Create(configPath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	err = encoder.Encode(config)
	if err != nil {
		return err
	}

	return nil
}

// Read config from configPath
func ReadConfig() error {
	file, err := os.Open(configPath)

	if err != nil {
		return err
	}

	defer file.Close()
	decoder := json.NewDecoder(file)

	config = Config{}

	err = decoder.Decode(&config)
	if err != nil {
		return err
	}

	return nil
}
