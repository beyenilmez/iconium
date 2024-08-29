import React, { useEffect, useState } from "react";
import { CircleHelp, CircleX, Images, RotateCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  ActionSelectImage,
  GetSelectImage,
  UploadSelectImage,
} from "@/wailsjs/go/main/App";
import { main } from "@/wailsjs/go/models";
import { Skeleton } from "./ui/skeleton";

interface SelectImageProps {
  src?: string;
  packId?: string;
  className?: string;
  sizeClass?: string;
  editSizeClass?: string;
  editable?: boolean;
  onChange?: () => void;
}

const SelectImage: React.FC<SelectImageProps> = ({
  src: originalSrc = "",
  packId = "temp",
  className,
  sizeClass = "w-12 h-12",
  editSizeClass = "w-7 h-7",
  editable = false,
  onChange,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [imageProperties, setImageProperties] = useState<main.SelectImage>({
    id: packId,
    path: originalSrc,
    tempPath: "",
    hasOriginal: true,
    hasTemp: false,
    isRemoved: false,
  });

  const handleUpload = () => {
    UploadSelectImage(packId).then((properties) => {
      setImageProperties(properties);
      onChange?.();
    });
  };

  const handleAction = () => {
    ActionSelectImage(packId).then((properties) => {
      setImageProperties(properties);
      console.log(properties);
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
    <div className={`relative inline-block shrink-0 ${sizeClass}`}>
      {editable &&
        (imageProperties.hasOriginal ||
          imageProperties.isRemoved ||
          imageProperties.hasTemp) && (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="top-0 right-0 hover:brightness-75 z-10 absolute bg-destructive hover:bg-destructive p-0.5 rounded-full w-4 h-4 cursor-default"
            onClick={handleAction}
          >
            {imageProperties.hasOriginal &&
            (imageProperties.hasTemp || imageProperties.isRemoved) ? (
              <RotateCw />
            ) : (
              <CircleX />
            )}
          </Button>
        )}
      <Button
        onClick={handleUpload}
        type="button"
        variant="ghost"
        size="icon"
        className={`static rounded-none group shrink-0 w-full h-full
        ${!editable ? "pointer-events-none" : ""} ${className}`}
        {...rest}
      >
        <Images
          className={`group-hover:flex absolute justify-center items-center hidden bg-muted opacity-70 transition-all ${editSizeClass}`}
        />
        {(imageProperties.hasOriginal && !imageProperties.isRemoved) ||
        imageProperties.hasTemp ? (
          <>
            <img
              src={imageProperties.tempPath || imageProperties.path}
              className={`select-none group-hover:opacity-10 transition-all ${sizeClass}`}
              onLoad={() => setLoading(false)}
              hidden={loading}
              {...rest}
            />
            <Skeleton
              hidden={!loading}
              className={`w-full h-full ${sizeClass}`}
            />
          </>
        ) : (
          <CircleHelp
            className={`group-hover:opacity-10 transition-all p-0.5 ${sizeClass}`}
          />
        )}
      </Button>
    </div>
  );
};

export default SelectImage;
