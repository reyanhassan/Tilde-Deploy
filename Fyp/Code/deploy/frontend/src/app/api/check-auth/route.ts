// app/api/check-auth/route.ts (App Router)
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  //   const cookie = req.headers.get("cookie") || "";

  // Forward the cookie to your Rust backend
  const backendRes = await fetch("http://localhost:8080/check-auth", {
    method: "GET", // or use /check-auth if it's implemented
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
    credentials: "include",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  //   const data = await backendRes.json();
  //   return NextResponse.json(data);
  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: backendRes.headers,
  });
}
