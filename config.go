package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"reflect"
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
	WindowStartState  *int    `json:"windowStartState"`  // 0 = Normal, 1 = Maximized, 2 = Minimized, 3 = Fullscreen
	WindowScale       *int    `json:"windowScale"`       // %
	Opacity           *int    `json:"opacity"`           // %
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
	defaultWindowStartState := 0
	defaultWindowScale := 100
	opacity := 90

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
		WindowStartState:  &defaultWindowStartState,
		WindowScale:       &defaultWindowScale,
		Opacity:           &opacity,
	}
}

var config Config = GetDefaultConfig()

func config_init() error {
	err := CreateConfigIfNotExist()
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

	v := reflect.ValueOf(&config).Elem()
	t := v.Type()

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		fieldName := field.Name
		fieldValue := v.FieldByName(fieldName)

		if fieldValue.Kind() == reflect.Ptr && fieldValue.IsNil() {
			// If config's field is nil, set it to the default value's field
			defaultValue := reflect.ValueOf(&defaultConfig).Elem().FieldByName(fieldName)
			fieldValue.Set(defaultValue)
		}
	}
}

func (app *App) GetConfigField(fieldName string) string {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Attempting to get config field %s", fieldName))

	// Get the reflection Type and Value of the Config struct
	v := reflect.ValueOf(&config).Elem()
	t := v.Type()

	// Find the field by name
	_, found := t.FieldByName(fieldName)
	if !found {
		runtime.LogWarning(app.ctx, fmt.Sprintf("Unknown config field: %s", fieldName))
		return "undefined"
	}

	// Get the field value
	fieldValue := v.FieldByName(fieldName)

	// Check if the field is a pointer
	if fieldValue.Kind() == reflect.Ptr {
		if fieldValue.IsNil() {
			runtime.LogWarning(app.ctx, fmt.Sprintf("Config field %s is nil", fieldName))
			return "undefined"
		}
		// Dereference the pointer
		fieldValue = fieldValue.Elem()
	}

	runtime.LogDebug(app.ctx, fmt.Sprintf("Config field %s has value: %v", fieldName, fieldValue.Interface()))
	return fmt.Sprintf("%v", fieldValue.Interface())
}

func (app *App) SetConfigField(fieldName string, value string) {
	runtime.LogDebug(app.ctx, fmt.Sprintf("Attempting to set config field %s to %s", fieldName, value))

	v := reflect.ValueOf(&config).Elem()
	t := v.Type()

	_, found := t.FieldByName(fieldName)
	if !found {
		runtime.LogWarning(app.ctx, fmt.Sprintf("Unknown config field: %s", fieldName))
		return
	}

	fieldValue := v.FieldByName(fieldName)

	if fieldValue.Kind() == reflect.Ptr {
		if fieldValue.IsNil() {
			fieldValue.Set(reflect.New(fieldValue.Type().Elem()))
		}
		fieldValue = fieldValue.Elem()
	}

	switch fieldValue.Kind() {
	case reflect.String:
		fieldValue.SetString(value)
	case reflect.Bool:
		boolVal, err := strconv.ParseBool(value)
		if err != nil {
			runtime.LogError(app.ctx, fmt.Sprintf("Invalid value for boolean field %s: %s", fieldName, value))
			return
		}
		fieldValue.SetBool(boolVal)
	case reflect.Int:
		intVal, err := strconv.Atoi(value)
		if err != nil {
			runtime.LogError(app.ctx, fmt.Sprintf("Invalid value for integer field %s: %s", fieldName, value))
			return
		}
		fieldValue.SetInt(int64(intVal))
	default:
		runtime.LogError(app.ctx, fmt.Sprintf("Unsupported field type for field %s", fieldName))
		return
	}

	runtime.LogDebug(app.ctx, fmt.Sprintf("Config field %s set to %v", fieldName, fieldValue.Interface()))
}

// Creates a default config at configPath if none exists
func CreateConfigIfNotExist() error {
	configPath = get_config_path()

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		config = GetDefaultConfig()
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
