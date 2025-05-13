import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token =
    req.cookies.get("jwt_token")?.value || localStorage.getItem("jwt_token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = await fetchUserRole(token);

  const path = req.nextUrl.pathname;

  if (path.startsWith("/protected/evaluation")) {
    if (!["admin", "manager", "employee"].includes(userRole)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (
      path.includes("/scores") &&
      req.method === "POST" &&
      !["admin", "manager"].includes(userRole)
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

async function fetchUserRole(token: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:8088/admin/user/roles", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.role || "employee";
  } catch {
    return "employee";
  }
}

export const config = {
  matcher: ["/protected/:path*"],
};
