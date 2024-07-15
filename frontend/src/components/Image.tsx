import React, { useState } from "react";
import { Skeleton } from "./ui/skeleton";

// Define the props type for the Image component
interface ImageProps {
  src: string; // Assuming `icon` is a URL or path to the image
  className?: string;
}

const Image: React.FC<ImageProps> = ({ src, className, ...rest }) => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Skeleton
        className={`${className} ${loading ? "" : "hidden"}`}
      />
      <img
        src={src}
        className={`${className} ${loading ? "hidden" : ""}`}
        onLoad={() => setLoading(false)}
        {...rest}
      />
    </>
  );
};

export default Image;
