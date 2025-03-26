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
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      if (!session?.user?.token) {
        return;
      }
      try {
        setLoading(true);
        const response = await req.GET("/admin/users", session.user.token);
        setUsers(response);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, [session]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.toLowerCase());
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email_work.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="flex w-full flex-col bg-transparent">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-2">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Мэйл хаягаар хайх..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <Button onClick={() => router.push("/protected/user/create")}>
            <CirclePlus />
            Нэмэх
          </Button>
        </div>

        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Ажилчид</CardTitle>
              <CardDescription>Энэ хэсэгт ажилчдийг удирдана.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имэйл</TableHead>
                    <TableHead>Нэр</TableHead>
                    <TableHead>Нэвтрэх нэр</TableHead>
                    <TableHead>Дугаар</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Төлөв
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Бүртгүүлсэн хугацаа
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {user.email_work}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.last_name[0]}.{user.first_name}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.login_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {user.phone_number_work}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.is_active ? "default" : "destructive"}
                          >
                            {user.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.updated_at).toLocaleDateString()}
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
                                    `/protected/user/edit?id=${user.id}`
                                  )
                                }
                              >
                                Засах
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      {loading ? (
                        <TableCell colSpan={5} className="text-center">
                          Loading...
                        </TableCell>
                      ) : (
                        <TableCell colSpan={5} className="text-center">
                          No users found.
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
