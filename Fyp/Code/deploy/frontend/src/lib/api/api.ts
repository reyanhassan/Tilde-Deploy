// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/deploy";

// src/lib/api/api.ts
import { DeploymentRequest, ApiResponse } from "../types/types";

export const deployInfrastructure = async (
  data: DeploymentRequest
): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost:8080/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deploying infrastructure:", error);
    throw error;
  }
};
