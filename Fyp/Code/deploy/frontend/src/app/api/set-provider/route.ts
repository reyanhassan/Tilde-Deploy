// src/app/api/set-provider/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { provider_key, user_email } = await request.json();

    console.log("Received:", { provider_key, user_email });

    if (!provider_key || !user_email) {
      return NextResponse.json(
        { error: "Both fields are required" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch("http://localhost:8080/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider_key, user_email }),
    });

    return NextResponse.json(await backendResponse.json());
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
