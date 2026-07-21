"use client";

import Image from "next/image";

interface ServiceGalleryProps {
  images: { src: string; alt: string }[];
}

export function ServiceGallery({ images }: ServiceGalleryProps) {
  if (images.length === 0) return null;

  const duplicatedImages = [...images, ...images, ...images];

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-4 animate-scroll"
        style={{ width: "max-content" }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={index}
            className="relative flex-none w-64 h-40 sm:w-96 sm:h-56 rounded-xl overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="288px"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
