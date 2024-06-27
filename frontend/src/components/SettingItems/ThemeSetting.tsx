import {
    SettingsItem,
    SettingContent,
    SettingDescription,
    SettingLabel,
} from "../ui/settings-group";
import { useTranslation } from "react-i18next";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-provider";

export function ThemeSetting() {
    const { t } = useTranslation();
    const { theme, setTheme } = useTheme();

    return (
        <SettingsItem>
            <div>
                <SettingLabel>{t("settings.general.theme.label")}</SettingLabel>
                <SettingDescription>
                    {t("settings.general.theme.description")}
                </SettingDescription>
            </div>
            <SettingContent>
                <ToggleGroup type="single" value={theme}>
                    <ToggleGroupItem
                        value="system"
                        aria-label="Use system theme"
                        onClick={() => setTheme("system")}
                    >
                        <Monitor className="w-4 h-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="light"
                        aria-label="Use light theme"
                        onClick={() => setTheme("light")}
                    >
                        <Sun className="w-4 h-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="dark"
                        aria-label="Use dark theme"
                        onClick={() => setTheme("dark")}
                    >
                        <Moon className="w-4 h-4" />
                    </ToggleGroupItem>
                </ToggleGroup>
            </SettingContent>
        </SettingsItem>
    );
}
