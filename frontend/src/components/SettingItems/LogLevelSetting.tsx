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
import { useStorage } from "@/contexts/storage-provider";

export function LogLevelSetting() {
  const { t } = useTranslation();
  const { getValue, setValueIfUndefined } = useStorage();

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
    ]).then(
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

        setValueIfUndefined(
          "initialEnableLogLevel",
          enableTrace +
            enableDebug +
            enableInfo +
            enableWarn +
            enableError +
            enableFatal
        );

        setIsLoading(false);
      }
    );
  }, []);

  return (
    <SettingsItem
      loading={isLoading}
      name="LogLevels"
      initialValue={getValue("initialEnableLogLevel")}
      value={
        String(enableTrace) +
        String(enableDebug) +
        String(enableInfo) +
        String(enableWarn) +
        String(enableError) +
        String(enableFatal)
      }
    >
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
