// src/app/api/undeploy/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { user_email, project_id, project_name } = await request.json();

    const backendResponse = await fetch("http://localhost:8080/undeploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_email, project_id, project_name }),
    });

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Backend connection failed" },
      { status: 502 }
    );
  }
}
