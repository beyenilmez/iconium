package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
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
	config.Theme = &theme
	SetConfig(config)
}

func (app *App) GetUseSystemTitleBar() bool {
	if config.UseSystemTitleBar == nil {
		return false
	}
	return *config.UseSystemTitleBar
}

func (app *App) SetUseSystemTitleBar(useSystemTitleBar bool) {
	config.UseSystemTitleBar = &useSystemTitleBar
	SetConfig(config)
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
