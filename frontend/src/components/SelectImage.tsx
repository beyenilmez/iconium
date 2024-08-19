import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { CircleHelp, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { GetTempPng, GetTempPngPath } from "@/wailsjs/go/main/App";
import { LogDebug } from "@/wailsjs/runtime/runtime";

interface SelectImageProps {
  src?: string;
  packId?: string;
  className?: string;
  sizeClass?: string;
  editSizeClass?: string;
  editable?: boolean;
  unkown?: boolean;
  alwaysShowOriginal?: boolean;
  onChange?: (value: string) => void;
}

const SelectImage: React.FC<SelectImageProps> = ({
  src: originalSrc = "",
  packId = "temp",
  className,
  sizeClass = "w-12 h-12",
  editSizeClass = "w-7 h-7",
  editable = false,
  unkown = true,
  alwaysShowOriginal = true,
  onChange,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [iconPath, setIconPath] = useState(originalSrc);
  const [imgKey, setImgKey] = useState(0);

  const handleUpload = () => {
    GetTempPng(packId).then((path) => {
      if (path) {
        setIconPath(path);
        onChange?.(path);
      }
    });
  };

  useEffect(() => {
    if (alwaysShowOriginal && !editable) {
      setIconPath(originalSrc);
      setLoading(true);
    } else {
      GetTempPngPath(packId).then((path) => {
        LogDebug("GetTempPngPath: " + path);
        if (path) {
          setIconPath(path);
        } else {
          setIconPath(originalSrc);
        }
        setLoading(true);
      });
    }
  }, [editable]);

  useEffect(() => {
    setImgKey(imgKey + 1);
  }, [loading]);

  return (
    <Button
      onClick={handleUpload}
      type="button"
      variant="ghost"
      size="icon"
      className={`static rounded-none overflow-clip group shrink-0 ${sizeClass}
        ${!editable ? "pointer-events-none" : ""} ${className}`}
      {...rest}
    >
      <Upload
        className={`group-hover:flex absolute justify-center items-center hidden bg-muted opacity-70 transition-all ${editSizeClass}`}
      />
      {unkown ? (
        <CircleHelp
          className={`group-hover:opacity-10 transition-all ${sizeClass} ${
            loading ? "" : "hidden"
          }`}
        />
      ) : (
        <Skeleton
          className={`group-hover:opacity-10 transition-all ${sizeClass} ${
            loading ? "" : "hidden"
          }`}
        />
      )}
      <img
        key={imgKey}
        src={iconPath}
        className={`select-none group-hover:opacity-10 transition-all ${sizeClass} ${
          loading ? "hidden" : ""
        }`}
        onLoad={() => setLoading(false)}
        {...rest}
      />
    </Button>
  );
};

export default SelectImage;
