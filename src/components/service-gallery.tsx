"use client";

import Image from "next/image";

interface ServiceGalleryProps {
  images: { src: string; alt: string }[];
}

export function ServiceGallery({ images }: ServiceGalleryProps) {
  if (images.length === 0) return null;

  // Duplicate images for seamless infinite scroll
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-4 animate-scroll"
        style={{
          width: "max-content",
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={index}
            className="relative flex-none w-72 h-48 rounded-xl overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="288px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
