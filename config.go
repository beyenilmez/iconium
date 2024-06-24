package main

import (
	"encoding/json"
	"errors"
	"os"
)

type Config struct {
	Theme string `json:"theme"`
}

var config Config = GetDefaultConfig()

func (app *App) GetTheme() string {
	return config.Theme
}

func (app *App) SetTheme(theme string) {
	config.Theme = theme
	SetConfig(config)
}

func config_init() error {
	err := CreateConfig()
	if err != nil {
		return errors.New("Failed to create config file")
	}
	err = ReadConfig()
	if err != nil {
		return errors.New("Failed to read config file")
	}

	return nil
}

func GetDefaultConfig() Config {
	return Config{
		Theme: "system",
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
