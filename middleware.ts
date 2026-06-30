import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/login" || pathname === "/about") {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get("ft_user");

  // Not logged in -> redirect to login
  if (!userCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie.value));

    // Kunci akses berdasarkan sub-role untuk 'user' (mahasiswa/dosen/laboran/kaprodi)
    const userKey = user.role === "user" ? user.subRole : user.role;

    // Route access map (mirror src/lib/permissions.ts)
    const routeAccess: Record<string, string[]> = {
      "/dashboard": ["laboran", "pengelola", "admin"],
      "/barang": ["mahasiswa", "dosen", "laboran", "kaprodi", "pengelola", "admin"],
      "/pelaporan": ["mahasiswa", "dosen", "laboran"],
      "/peminjaman": ["mahasiswa", "dosen", "laboran"],
      "/tracking": ["mahasiswa", "dosen", "laboran", "kaprodi", "pengelola", "admin"],
      "/scan": ["mahasiswa", "dosen", "laboran", "kaprodi", "pengelola", "admin"],
      "/ruangan": ["mahasiswa", "dosen", "laboran", "kaprodi", "pengelola", "admin"],
      "/maintenance": ["mahasiswa", "dosen", "laboran", "kaprodi", "pengelola", "admin"],
      "/audit": ["dosen", "laboran", "kaprodi", "pengelola", "admin"],
      "/pengajuan": ["pengelola", "admin"],
      "/laporan": ["dosen", "kaprodi", "pengelola", "admin"],
      "/pengguna": ["pengelola", "admin"],
      "/profil": ["mahasiswa", "dosen", "laboran", "kaprodi", "pengelola", "admin"],
    };

    // Find matching route
    const matchedRoute = Object.keys(routeAccess).find((route) => {
      if (route === pathname) return true;
      if (route.includes("[id]")) {
        const base = route.replace("/[id]", "");
        return pathname.startsWith(base + "/");
      }
      return pathname.startsWith(route + "/");
    }) || pathname;

    const allowedRoles = routeAccess[matchedRoute];
    if (!allowedRoles) return NextResponse.next();

    const hasAccess = allowedRoles.includes(userKey);

    if (!hasAccess) {
      // Redirect to home page for role
      const redirectTo = user.role === "pengelola" || user.role === "admin" ? "/dashboard" : "/barang";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
