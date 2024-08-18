import React, { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { CircleHelp, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { GetTempPng } from "@/wailsjs/go/main/App";

interface SelectImageProps {
  src?: string;
  packId?: string;
  className?: string;
  sizeClass?: string;
  editSizeClass?: string;
  editable?: boolean;
  unkown?: boolean;
}

const SelectImage: React.FC<SelectImageProps> = ({
  src: originalSrc = "",
  packId = "temp",
  className,
  sizeClass = "w-12 h-12",
  editSizeClass = "w-7 h-7",
  editable = false,
  unkown = true,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [iconPath, setIconPath] = useState(originalSrc);
  const src = editable ? iconPath : originalSrc;

  const handleUpload = () => {
    GetTempPng(packId).then((path) => {
      if (path) {
        setIconPath(path);
      }
    });
  };

  useEffect(() => {
    if (!editable) {
      setIconPath(originalSrc);
      setLoading(true);
    }
  }, [editable]);

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
        key={loading ? "t" : "f"}
        src={src}
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
