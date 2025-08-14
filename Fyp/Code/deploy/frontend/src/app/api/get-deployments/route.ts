// // src/app/api/get-deployments/route.ts
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   const email = req.nextUrl.searchParams.get("email");

//   if (!email) {
//     return NextResponse.json(
//       { error: "Missing email query parameter" },
//       { status: 400 }
//     );
//   }

//   try {
//     const backendRes = await fetch(
//       `http://localhost:8080/deployments?email=${encodeURIComponent(email)}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Cookie: req.headers.get("cookie") || "",
//         },
//         credentials: "include",
//         // Authorization: req.headers.get("authorization") || "",
//       }
//     );

//     const data = await backendRes.json();
//     return NextResponse.json(data, { status: backendRes.status });
//   } catch (error) {
//     console.error("Fetch error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch deployments" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/get-deployments/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Simulate a successful mocked deployment response
  const mockDeployments = [
    {
      id: 1,
      project_name: "Mock Project",
      selected_service: "aws",
      region: "us-east-1",
      status: "active",
      created_at: new Date().toISOString(),
      progress: 100,
    },
    {
      id: 2,
      project_name: "Staging Env",
      selected_service: "gcp",
      region: "us-west2",
      status: "deploying",
      created_at: new Date(Date.now() - 86400000).toISOString(), // yesterday
      progress: 65,
    },
    {
      id: 3,
      project_name: "Failed Deploy",
      selected_service: "azure",
      region: "eu-central-1",
      status: "failed",
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      progress: 0,
    },
  ];

  return NextResponse.json(mockDeployments, { status: 200 });
}
