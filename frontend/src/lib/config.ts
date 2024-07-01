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
// Function to initialize config cache
export async function InitConfigCache(): Promise<void> {
  // Reset cache
  configCache = {};

  // Array of keys to fetch
  const keys = [
    "Theme",
    "UseSystemTitleBar",
    "EnableLogging",
    "EnableTrace",
    "EnableDebug",
    "EnableInfo",
    "EnableWarn",
    "EnableError",
    "EnableFatal",
    "MaxLogFiles",
    "Language",
    "SaveWindowStatus",
    "WindowScale",
    "Opacity",
    "WindowEffect",
    "CheckForUpdates",
  ];

  // Array to store promises
  const fetchPromises: Promise<string>[] = keys.map((key) =>
    GetConfigField(key)
  );

  // Wait for all promises to resolve
  const results = await Promise.all(fetchPromises);

  // Update cache with fetched values
  keys.forEach((key, index) => {
    configCache[key] = results[index];
  });

  // Optional: Log or perform additional actions after fetching all values
}
