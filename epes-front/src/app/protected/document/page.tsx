"use client";

import { CirclePlus, MoreHorizontal, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { req } from "@/app/api";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session } = useSession();
  const router = useRouter();
  const [documentSets, setDocumentSets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const getUserData = async () => {
      if (!session?.user?.token) {
        console.error("No token available");
        return;
      }
      try {
        const response = await req.GET(
          "/protected/document-set",
          session.user.token
        );
        setDocumentSets(response);
      } catch (error) {
        console.error("Failed to fetch documentSets:", error);
      }
    };
    getUserData();
  }, [session]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  return (
    <div className="flex w-full flex-col bg-transparent">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-2">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ID-гаар хайх..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Бичиг баримтууд</CardTitle>
              <CardDescription>
                Энэ хэсэгт бичиг баримтуудыг удирдана.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Регистр</TableHead>
                    <TableHead>Тайлбар</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Үүсгэсэн хугацаа
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Шинэчлэсэн хугацаа
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Үйлдэл</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentSets.length > 0 ? (
                    documentSets.map((documentSet: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {documentSet.register_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {documentSet.description}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(
                            documentSet.created_at
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(
                            documentSet.updated_at
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/dashboard/documentSets/edit?id=${documentSet.id}`
                                  )
                                }
                              >
                                Дэлгэрэнгүй
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No documentSets found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
