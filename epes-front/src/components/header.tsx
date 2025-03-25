"use client";
import React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const userLastnameInitial = session?.user?.lastname?.[0] ?? "U";
  const userFirstname = session?.user?.firstname ?? "User";
  const isAdmin = session?.user.roles.includes("ADMIN");

  if (!session) return null;

  return (
    <header className="absolute flex w-full items-center justify-between bg-black text-white max-h-12 py-2 px-12">
      <Link href="/">
        <Image
          priority
          alt="Logo here"
          src={"/light/epes.png"}
          height={40}
          width={80}
          style={{ width: "auto", height: "auto" }}
        />
      </Link>
      <div className="flex items-center space-x-6">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={"/icons/avatar.png"}
                alt={`${userFirstname} Avatar`}
              />
              <AvatarFallback>{userLastnameInitial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {isAdmin && (
              <DropdownMenuItem onClick={() => router.push("/protected")}>
                Админ
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-600"
            >
              Гарах
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p>
          {userLastnameInitial}.{userFirstname}
        </p>
      </div>
    </header>
  );
};
