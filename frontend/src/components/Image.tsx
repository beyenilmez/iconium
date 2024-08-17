import React, { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { CircleHelp } from "lucide-react";

// Define the props type for the Image component
interface ImageProps {
  src: string; // Assuming `icon` is a URL or path to the image
  className?: string;
  cornerRadius?: number;
  opacity?: number;
  unkown?: boolean;
}

const Image: React.FC<ImageProps> = ({
  src,
  className,
  cornerRadius = 0,
  opacity = 100,
  unkown = false,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
    {unkown ? <CircleHelp className={`${className} ${loading ? "" : "hidden"}`} />:
    <Skeleton className={`${className} ${loading ? "" : "hidden"}`} />
    }
      <img
        src={src}
        className={`${className} ${loading ? "hidden" : ""}`}
        onLoad={() => setLoading(false)}
        style={{
          borderRadius: `${cornerRadius}%`,
          opacity: `${opacity / 100}`,
        }}
        {...rest}
      />
    </>
  );
};

export default Image;
