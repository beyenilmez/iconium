package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Config struct {
	Theme             *string `json:"theme"`             // system, light, dark
	UseSystemTitleBar *bool   `json:"useSystemTitleBar"` // true, false
	EnableLogging     *bool   `json:"enableLogging"`     // true, false
	EnableTrace       *bool   `json:"enableTrace"`       // true, false
	EnableDebug       *bool   `json:"enableDebug"`       // true, false
	EnableInfo        *bool   `json:"enableInfo"`        // true, false
	EnableWarn        *bool   `json:"enableWarn"`        // true, false
	EnableError       *bool   `json:"enableError"`       // true, false
	EnableFatal       *bool   `json:"enableFatal"`       // true, false
	Language          *string `json:"language"`          // en, tr
}

func GetDefaultConfig() Config {
	defaultTheme := "system"
	defaultUseSystemTitleBar := false
	defaultEnableLogging := true
	defaultEnableTrace := false
	defaultEnableDebug := false
	defaultEnableInfo := true
	defaultEnableWarn := true
	defaultEnableError := true
	defaultEnableFatal := true
	defaultLanguage := "en"

	return Config{
		Theme:             &defaultTheme,
		UseSystemTitleBar: &defaultUseSystemTitleBar,
		EnableLogging:     &defaultEnableLogging,
		EnableTrace:       &defaultEnableTrace,
		EnableDebug:       &defaultEnableDebug,
		EnableInfo:        &defaultEnableInfo,
		EnableWarn:        &defaultEnableWarn,
		EnableError:       &defaultEnableError,
		EnableFatal:       &defaultEnableFatal,
		Language:          &defaultLanguage,
	}
}

var config Config = GetDefaultConfig()

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

	if config.EnableLogging == nil {
		config.EnableLogging = defaultConfig.EnableLogging
		merged = true
	}
	if config.EnableTrace == nil {
		config.EnableTrace = defaultConfig.EnableTrace
		merged = true
	}
	if config.EnableDebug == nil {
		config.EnableDebug = defaultConfig.EnableDebug
		merged = true
	}
	if config.EnableInfo == nil {
		config.EnableInfo = defaultConfig.EnableInfo
		merged = true
	}
	if config.EnableWarn == nil {
		config.EnableWarn = defaultConfig.EnableWarn
		merged = true
	}
	if config.EnableError == nil {
		config.EnableError = defaultConfig.EnableError
		merged = true
	}
	if config.EnableFatal == nil {
		config.EnableFatal = defaultConfig.EnableFatal
		merged = true
	}

	if config.Language == nil {
		config.Language = defaultConfig.Language
		merged = true
	}

	if merged {
		SetConfig(config)
	}
}

func (app *App) GetConfigField(field string) string {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Getting config field %s", field))

	switch field {
	case "theme":
		return *config.Theme
	case "useSystemTitleBar":
		return fmt.Sprintf("%t", *config.UseSystemTitleBar)
	case "enableLogging":
		return fmt.Sprintf("%t", *config.EnableLogging)
	case "enableTrace":
		return fmt.Sprintf("%t", *config.EnableTrace)
	case "enableDebug":
		return fmt.Sprintf("%t", *config.EnableDebug)
	case "enableInfo":
		return fmt.Sprintf("%t", *config.EnableInfo)
	case "enableWarn":
		return fmt.Sprintf("%t", *config.EnableWarn)
	case "enableError":
		return fmt.Sprintf("%t", *config.EnableError)
	case "enableFatal":
		return fmt.Sprintf("%t", *config.EnableFatal)
	case "language":
		return *config.Language
	default:
		runtime.LogWarning(app.ctx, fmt.Sprintf("Unknown config field %s", field))
		return "undefined"
	}
}

func (app *App) SetConfigField(field string, value string) {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Setting config field %s to %s", field, value))

	valueBool, err := strconv.ParseBool(value)

	if err != nil {
		runtime.LogDebug(app.ctx, fmt.Sprintf("Failed to parse %s to bool", value))
	}

	unknown_field := false

	switch field {
	case "theme":
		config.Theme = &value
	case "useSystemTitleBar":
		config.UseSystemTitleBar = &valueBool
	case "enableLogging":
		config.EnableLogging = &valueBool
	case "enableTrace":
		config.EnableTrace = &valueBool
	case "enableDebug":
		config.EnableDebug = &valueBool
	case "enableInfo":
		config.EnableInfo = &valueBool
	case "enableWarn":
		config.EnableWarn = &valueBool
	case "enableError":
		config.EnableError = &valueBool
	case "enableFatal":
		config.EnableFatal = &valueBool
	case "language":
		config.Language = &value
	default:
		unknown_field = true
		runtime.LogWarning(app.ctx, fmt.Sprintf("Unknown config field %s", field))
	}

	if !unknown_field {
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
