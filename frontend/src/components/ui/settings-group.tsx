import React, { ReactNode } from "react";

interface SettingsComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SettingsGroup: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`w-full ${className}`} {...rest}>{children}</div>
);

export const SettingsItem: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`flex items-center justify-between py-2 w-full border-b ${className}`} {...rest}>{children}</div>
);

export const SettingLabel: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`font-medium text-primary ${className}`} {...rest}>{children}</div>
);

export const SettingDescription: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`text-sm text-muted-foreground ${className}`} {...rest}>{children}</div>
);

export const SettingContent: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`flex flex-col ${className}`} {...rest}>{children}</div>
);
