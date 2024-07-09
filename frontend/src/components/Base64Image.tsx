import { GetBase64Image } from "@/wailsjs/go/main/App";
import { LoaderCircle } from "lucide-react";
import React, { useState, useEffect } from "react";

// Define the props type for the Base64Image component
interface Base64ImageProps {
  icon: string; // Assuming `icon` is a URL or path to the image
  packId: string;
  alt: string;
  className?: string;
}

const Base64Image: React.FC<Base64ImageProps> = ({
  icon,
  packId,
  alt,
  className,
  ...rest
}) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    GetBase64Image(packId, icon).then((base64Image) => {
      if (isMounted) {
        setSrc(base64Image);
        console.log(base64Image);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [icon]);

  if (!src) {
    return <LoaderCircle className={`animate-spin ${className}`} {...rest} />; // or a spinner/loading component
  }

  return <img src={src} alt={alt} className={className} {...rest} />;
};

export default Base64Image;
