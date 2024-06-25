import React, { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton"

interface SettingsComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const SettingsGroup: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`w-full ${className}`} {...rest}>{children}</div>
);

interface SettingsItemProps extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  vertical?: boolean;
  children: ReactNode;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ children, className, loading, vertical, ...rest }) => {
  if (loading) {
    return <SettingsItemSkeleton className={className} {...rest} />
  } else {
    return <div className={`flex gap-4 justify-between py-2 w-full border-b ${vertical ? "flex-col" : "flex-row items-center"}
       ${className}`} {...rest}>{children}</div>
  }
}

export const SettingLabel: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`font-medium text-foreground ${className}`} {...rest}>{children}</div>
);

export const SettingDescription: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`text-sm text-muted-foreground ${className}`} {...rest}>{children}</div>
);

export const SettingContent: React.FC<SettingsComponentProps> = ({ children, className, ...rest }) => (
  <div className={`flex flex-col ${className}`} {...rest}>{children}</div>
);

interface SettingsGroupSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
}

const SettingsItemSkeleton: React.FC<SettingsGroupSkeletonProps> = ({ className, ...rest }) => (
  <div className={`flex items-center justify-between w-full mb-2 ${className}`} {...rest}>
      <div className="space-y-2 w-full">
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-[90%] h-4" />
      </div>
      <Skeleton className="rounded-full w-24 h-12" />
    </div>
);