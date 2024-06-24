import {
  GetEnableLogging,
  SetEnableLogging,
  GetEnableTrace,
  SetEnableTrace,
  GetEnableDebug,
  SetEnableDebug,
  GetEnableInfo,
  SetEnableInfo,
  GetEnableWarn,
  SetEnableWarn,
  GetEnableError,
  SetEnableError,
  GetEnableFatal,
  SetEnableFatal,
} from "wailsjs/go/main/App";
import {
  SettingsGroup,
  SettingsItem,
  SettingContent,
  SettingDescription,
  SettingLabel,
} from "../ui/settings-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "../ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function AdvancedSettings() {
  const { t } = useTranslation();

  const [enableLogging, setEnableLogging] = useState(false);
  const [enableTrace, setEnableTrace] = useState(false);
  const [enableDebug, setEnableDebug] = useState(false);
  const [enableInfo, setEnableInfo] = useState(false);
  const [enableWarn, setEnableWarn] = useState(false);
  const [enableError, setEnableError] = useState(false);
  const [enableFatal, setEnableFatal] = useState(false);

  useEffect(() => {
    GetEnableLogging().then((value) => {
      setEnableLogging(value);
    });

    GetEnableTrace().then((value) => {
      setEnableTrace(value);
    });

    GetEnableDebug().then((value) => {
      setEnableDebug(value);
    });

    GetEnableInfo().then((value) => {
      setEnableInfo(value);
    });

    GetEnableWarn().then((value) => {
      setEnableWarn(value);
    });

    GetEnableError().then((value) => {
      setEnableError(value);
    });

    GetEnableFatal().then((value) => {
      setEnableFatal(value);
    });
  }, []);

  return (
    <SettingsGroup className="flex flex-col items-start px-4 py-2 w-full h-full">
      <SettingsItem>
        <div>
          <SettingLabel>{t("settings.advanced.logging.label")}</SettingLabel>
          <SettingDescription>
            {t("settings.advanced.logging.description") +
              " (" +
              t("settings.restart_the_app_for_changes_to_take_effect") + ")"}
          </SettingDescription>
        </div>
        <SettingContent>
          <Switch
            checked={enableLogging}
            onCheckedChange={() => {
              SetEnableLogging(!enableLogging).then(() => {
                setEnableLogging(!enableLogging);
              });
            }}
          />
        </SettingContent>
      </SettingsItem>

      <SettingsItem>
        <div>
          <SettingLabel>{t("settings.advanced.log_levels.label")}</SettingLabel>
          <SettingDescription>
            {t("settings.advanced.log_levels.description")}
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
                SetEnableTrace(!enableTrace).then(() => {
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
                SetEnableDebug(!enableDebug).then(() => {
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
                SetEnableInfo(!enableInfo).then(() => {
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
                SetEnableWarn(!enableWarn).then(() => {
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
                SetEnableError(!enableError).then(() => {
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
                SetEnableFatal(!enableFatal).then(() => {
                  setEnableFatal(!enableFatal);
                });
              }}
            >
              Fatal
            </ToggleGroupItem>
          </ToggleGroup>
        </SettingContent>
      </SettingsItem>
    </SettingsGroup>
  );
}
