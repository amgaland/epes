import { clsx, type ClassValue } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function constructMetadata({
  title = "EPES | Admin",
  description = "Монголын үүрэн холбооны оператор, Mongolian telecommunication group.",
  image = "/favicon.png",
  icons = "/favicon.png",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@tumeetmr",
    },
    icons,
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function getTimeDifference(date: string): string {
  const now = new Date();
  const endDate = new Date(date);
  const diffInMs = endDate.getTime() - now.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
  const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));

  if (diffInDays < 0) {
    return "Дууссан";
  }

  if (diffInYears > 0) {
    return `${diffInYears} жил`;
  } else if (diffInMonths > 0) {
    return `${diffInMonths} сар`;
  } else if (diffInDays > 0) {
    return `${diffInDays} өдөр`;
  } else {
    return `${diffInHours} цаг`;
  }
}

export function validateRegisterNumber(registerNumber: string): boolean {
  const pattern = /^[А-ЯЁ]{2}\d{8}$/;
  return pattern.test(registerNumber);
}

export function resizeImage(file: File, maxSize: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const scaleFactor = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error("Image resizing failed"));
          }
        }, file.type);
      };
    };
    reader.onerror = (error) => reject(error);
  });
}
