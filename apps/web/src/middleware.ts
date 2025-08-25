import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Разрешаем служебные и публичные маршруты
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/csrf-token") ||
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/_next/") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/passwordReset") ||
    pathname.startsWith("/confirm") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/workbox")
  ) {
    return NextResponse.next();
  }

  // Читаем JWT из cookie
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Перенаправляем авторизованных пользователей с главной страницы на курсы
  if (pathname === "/" && token) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/courses";
    return NextResponse.redirect(redirectUrl);
  }

  if (!token) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|static/|workbox-).*)",
  ],
};
