import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Разрешаем служебные и auth-маршруты
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  // Читаем JWT из cookie (кастомное имя куки задано в authOptions)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/api/auth/signin";
    redirectUrl.searchParams.set("callbackUrl", pathname || "/");
    return NextResponse.redirect(redirectUrl);
  }

  // Доп. проверка роли при необходимости
  if (token.role !== "ADMIN" && token.role !== "MODERATOR") {
     const redirectUrl = request.nextUrl.clone();
     redirectUrl.pathname = "/login";
     redirectUrl.searchParams.set("callbackUrl", pathname || "/");
   return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
