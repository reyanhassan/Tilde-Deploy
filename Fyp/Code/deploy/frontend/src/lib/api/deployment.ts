// src/lib/api/deployments.ts
export const fetchDeployments = async (userEmail: string) => {
  try {
    const response = await fetch(
      `/api/deployments?user_email=${encodeURIComponent(userEmail)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(typeof window !== "undefined" &&
            sessionStorage.getItem("temp_token") && {
              Authorization: `Bearer ${sessionStorage.getItem("temp_token")}`,
            }),
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch deployments");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch deployments error:", error);
    throw error;
  }
};
