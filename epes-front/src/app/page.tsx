"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LottiePlayer from "@/components/lottie-player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useRequireAuth } from "@/lib/checkAuth";
import { validateRegisterNumber } from "@/lib/utils";
import { req } from "./api";
import loading from "@/../public/lottie/round-loading.json";
import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Header } from "@/components/header";

export default function Home() {
  useRequireAuth();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user.token;
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!validateRegisterNumber(inputValue)) {
      toast({
        title: "Зөв регистрийн дугаар оруулна уу.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Хэрэглэгчийн токен байхгүй байна.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const data = await req.GET("/billing/check-user", token, {
        registerNumber: inputValue,
      });

      if (data.message === "user_found") {
        router.push(`/client/user-detail?registerNumber=${inputValue}`);
      }
      if (data.message === "user_not_found") {
        toast({ title: "Хэрэглэгч бүртгэлгүй байна." });
        router.push(`/client/register-user?registerNumber=${inputValue}`);
      }
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Сервертэй холбогдоход алдаа гарлаа.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center border-b border-gray-300 pb-4">
              <Input
                type="text"
                placeholder="Регистрийн дугаар"
                className="border border-gray-300 rounded-lg px-4 py-2 mr-2"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                disabled={isLoading}
                variant="secondary"
                className="rounded-lg flex items-center"
                onClick={handleSearch}
              >
                {isLoading ? (
                  <LottiePlayer width={120} animation={loading} />
                ) : (
                  <>
                    <Settings className="mr-2" />
                    Хайх
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 font-bold">
            {[
              { alt: "create-user", src: "/icons/create-user.png", label: "Хэрэглэгч бүртгэх", route: "/client/register/user" },
              { alt: "data-charge", src: "/icons/data-charge.png", label: "Дата цэнэглэх", route: "#" },
              { alt: "call-charge", src: "/icons/call-charge.png", label: "Яриа цэнэглэх", route: "#" },
              { alt: "assign-number", src: "/icons/assign-number.png", label: "Дугаар авах", route: "#" },
              { alt: "recover-sim", src: "/icons/recover-sim.png", label: "Сим сэргээх", route: "#" },
              { alt: "activate-call", src: "/icons/activate-call.png", label: "Яриа идэвхжүүлэх", route: "#" },
            ].map((card) => (
              <Card
                key={card.alt}
                onClick={() => router.push(card.route)}
                className="cursor-pointer flex flex-col items-center p-4"
              >
                <Image
                  className="bg-black rounded-full p-1"
                  alt={card.alt}
                  src={card.src}
                  width={40}
                  height={40}
                />
                <span>{card.label}</span>
              </Card>
            ))}
          </div> */}
        </div>
      </div>
    </>
  );
}
