"use client";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/lib/checkAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export default function NotFound() {
  useRequireAuth();
  const router = useRouter();
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-center">
      <p>Уучлаарай, хуудас олдсонгүй</p>
      <Image alt="not-found" src={"/not-found.png"} height={120} width={80} />
      <Button className="mt-10 gap-x-2" onClick={() => router.push("/")}>
        Нүүр хуудас руу буцах
      </Button>
    </div>
  );
}
