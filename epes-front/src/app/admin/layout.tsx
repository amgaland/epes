'use client'
import { useRequireAuth } from "@/lib/checkAuth";
import SideBar from "./components/side-bar";
import { Header } from "@/components/header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    useRequireAuth();
    return (
        <>
            <Header/>
            <div className="flex h-screen rounded-lg">
                <SideBar />
                <div className="w-full py-4 max-h-screen">
                    <div className="h-full rounded-xl overflow-y-auto">
                        <div className="mt-5">
                        {children}
                        </div>
                    </div>
                </div>
            </div>
        </>
  );
}
