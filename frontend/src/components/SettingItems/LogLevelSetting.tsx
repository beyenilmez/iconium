import { Log } from "wailsjs/go/main/App";
import {
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GetConfigField, SetConfigField } from "@/lib/config";

export function LogLevelSetting() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);

  const [enableTrace, setEnableTrace] = useState(false);
  const [enableDebug, setEnableDebug] = useState(false);
  const [enableInfo, setEnableInfo] = useState(false);
  const [enableWarn, setEnableWarn] = useState(false);
  const [enableError, setEnableError] = useState(false);
  const [enableFatal, setEnableFatal] = useState(false);

  useEffect(() => {
    Promise.all([
      GetConfigField("EnableTrace"),
      GetConfigField("EnableDebug"),
      GetConfigField("EnableInfo"),
      GetConfigField("EnableWarn"),
      GetConfigField("EnableError"),
      GetConfigField("EnableFatal"),
    ])
      .then(
        ([
          enableTrace,
          enableDebug,
          enableInfo,
          enableWarn,
          enableError,
          enableFatal,
        ]) => {
          setEnableTrace(enableTrace === "true");
          setEnableDebug(enableDebug === "true");
          setEnableInfo(enableInfo === "true");
          setEnableWarn(enableWarn === "true");
          setEnableError(enableError === "true");
          setEnableFatal(enableFatal === "true");

          setIsLoading(false);
        }
      )
      .catch((error) => {
        Log("Error while loading advanced settings: " + error, 4);
        setIsLoading(false);
      });
  }, []);

  return (
    <SettingsItem loading={isLoading}>
      <div>
        <SettingLabel>{t("settings.setting.log_levels.label")}</SettingLabel>
        <SettingDescription>
          {t("settings.setting.log_levels.description")}
        </SettingDescription>
      </div>
      <SettingContent>
        <ToggleGroup
          type="multiple"
          value={[
            enableTrace ? "trace" : "",
            enableDebug ? "debug" : "",
            enableInfo ? "info" : "",
            enableWarn ? "warn" : "",
            enableError ? "error" : "",
            enableFatal ? "fatal" : "",
          ]}
        >
          <ToggleGroupItem
            value="trace"
            aria-label="Enable trace logging"
            onClick={() => {
              SetConfigField("EnableTrace", String(!enableTrace)).then(() => {
                setEnableTrace(!enableTrace);
              });
            }}
          >
            Trace
          </ToggleGroupItem>

          <ToggleGroupItem
            value="debug"
            aria-label="Enable debug logging"
            onClick={() => {
              SetConfigField("EnableDebug", String(!enableDebug)).then(() => {
                setEnableDebug(!enableDebug);
              });
            }}
          >
            Debug
          </ToggleGroupItem>

          <ToggleGroupItem
            value="info"
            aria-label="Enable info logging"
            onClick={() => {
              SetConfigField("EnableInfo", String(!enableInfo)).then(() => {
                setEnableInfo(!enableInfo);
              });
            }}
          >
            Info
          </ToggleGroupItem>

          <ToggleGroupItem
            value="warn"
            aria-label="Enable warn logging"
            onClick={() => {
              SetConfigField("EnableWarn", String(!enableWarn)).then(() => {
                setEnableWarn(!enableWarn);
              });
            }}
          >
            Warn
          </ToggleGroupItem>

          <ToggleGroupItem
            value="error"
            aria-label="Enable error logging"
            onClick={() => {
              SetConfigField("EnableError", String(!enableError)).then(() => {
                setEnableError(!enableError);
              });
            }}
          >
            Error
          </ToggleGroupItem>

          <ToggleGroupItem
            value="fatal"
            aria-label="Enable fatal logging"
            onClick={() => {
              SetConfigField("EnableFatal", String(!enableFatal)).then(() => {
                setEnableFatal(!enableFatal);
              });
            }}
          >
            Fatal
          </ToggleGroupItem>
        </ToggleGroup>
      </SettingContent>
    </SettingsItem>
  );
}
