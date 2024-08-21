import React, { useEffect, useState } from "react";
import { CircleHelp, Images } from "lucide-react";
import { Button } from "./ui/button";
import {
  GetSelectImage,
  UploadSelectImage,
} from "@/wailsjs/go/main/App";
import { main } from "@/wailsjs/go/models";

interface SelectImageProps {
  src?: string;
  packId?: string;
  className?: string;
  sizeClass?: string;
  editSizeClass?: string;
  editable?: boolean;
  unkown?: boolean;
  alwaysShowOriginal?: boolean;
  onChange?: () => void;
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
  const [imageProperties, setImageProperties] = useState<main.SelectImage>({
    id: packId,
    path: originalSrc,
    tempPath: "",
    isEmpty: true,
    isOriginal: true,
  });

  const handleUpload = () => {
    UploadSelectImage(packId).then((properties) => {
      setImageProperties(properties);
      onChange?.();
    });
  };

  useEffect(() => {
    GetSelectImage(packId, originalSrc).then((properties) => {
      setImageProperties(properties);
      onChange?.();
    });
  }, [editable]);

  return (
    <Button
      onClick={handleUpload}
      type="button"
      variant="ghost"
      size="icon"
      className={`static rounded-none group shrink-0 ${sizeClass}
        ${!editable ? "pointer-events-none" : ""} ${className}`}
      {...rest}
    >
      <Images
        className={`group-hover:flex absolute justify-center items-center hidden bg-muted opacity-70 transition-all ${editSizeClass}`}
      />
      {imageProperties.isEmpty ? (
        <CircleHelp className={`group-hover:opacity-10 transition-all p-0.5 ${sizeClass}`} />
      ) : (
        <img
          src={imageProperties.tempPath || imageProperties.path}
          className={`select-none group-hover:opacity-10 transition-all ${sizeClass}`}
          {...rest}
        />
      )}
    </Button>
  );
};

export default SelectImage;
