"use client";

import { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src?: string;
  fallback: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
}

export function SafeImage({
  src,
  fallback,
  alt,
  className,
  sizes,
  style,
  priority,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src && src.trim() !== "" ? src : fallback);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      sizes={sizes ?? (props.fill ? "100vw" : undefined)}
      style={style}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => setImgSrc(fallback)}
    />
  );
}
