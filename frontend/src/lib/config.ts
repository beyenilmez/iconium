import {
  GetConfigField as GetConfigField_backend,
  SetConfigField as SetConfigField_backend,
} from "wailsjs/go/main/App";

interface ConfigCache {
  [key: string]: string;
}

// Initialize an empty cache object
let configCache: ConfigCache = {};

// Function to retrieve config field, using cache if available
export async function GetConfigField(key: string): Promise<string> {
  // Check if value exists in cache
  if (configCache[key] !== undefined) {
    return configCache[key];
  }

  // Call GetConfigField_backend to fetch value from backend
  const value = await GetConfigField_backend(key);

  // Cache the fetched value
  configCache[key] = value;

  return value;
}

// Function to set config field and update cache
export async function SetConfigField(
  key: string,
  value: string
): Promise<void> {
  // Call SetConfigField_backend to update backend
  await SetConfigField_backend(key, value);

  // Update cache with new value
  configCache[key] = value;
}

// Function to initialize config cache
export function InitConfigCache(): void {
  GetConfigField("Theme");
  GetConfigField("UseSystemTitleBar");
  GetConfigField("EnableLogging");
  GetConfigField("EnableTrace");
  GetConfigField("EnableDebug");
  GetConfigField("EnableInfo");
  GetConfigField("EnableWarn");
  GetConfigField("EnableError");
  GetConfigField("EnableFatal");
  GetConfigField("MaxLogFiles");
  GetConfigField("Language");
  GetConfigField("WindowStartState");
  GetConfigField("WindowScale");
  GetConfigField("Opacity");
  GetConfigField("WindowEffect");
}
