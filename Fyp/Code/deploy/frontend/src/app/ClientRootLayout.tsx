"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LinearProgress } from "@mui/material";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import { ThemeProvider } from "@emotion/react";
import { AuthContext } from "../context/AuthContext";
import AuthGate from "../components/AuthGate";
import theme from "../../theme";
import type {
  Navigation,
  Authentication as ToolpadAuth,
} from "@toolpad/core/AppProvider";

const NAVIGATION: Navigation = [
  { kind: "header", title: "Main items" },
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "deployments", title: "Deployments", icon: <RocketLaunchIcon /> },
];

const BRANDING = {
  logo: (
    <Image
      src="/Logo.png"
      alt="tilde"
      width={75}
      height={100}
      layout="intrinsic"
      style={{ height: "auto" }}
    />
  ),
  title: " ",
};

interface Session {
  user: {
    name: string;
    email: string;
    image: string;
  };
}

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    console.log("Checking session...");
    const loadSession = async () => {
      try {
        // 1. First, check if we have a token in sessionStorage
        const tempToken = sessionStorage.getItem("temp_token");
        console.log("Temp token:", tempToken);

        // 2. Try cookie-based auth
        console.log("Attempting cookie auth...");
        const cookieAuth = await fetch("http://localhost:8080/check-auth", {
          credentials: "include",
        });
        console.log("Cookie auth status:", cookieAuth.status);

        if (cookieAuth.ok) {
          const data = await cookieAuth.json();
          console.log("Cookie auth success:", data);

          if (data.token) sessionStorage.setItem("temp_token", data.token);

          setSession({
            user: {
              name: data.user.username || data.user.email,
              email: data.user.email,
              image: data.user.image || "",
            },
          });
          return;
        }

        // 3. Fallback to header token
        if (tempToken) {
          console.log("Attempting header auth...");
          const headerAuth = await fetch("http://localhost:8080/check-auth", {
            headers: { "X-Session-Token": tempToken },
          });
          console.log("Header auth status:", headerAuth.status);

          if (headerAuth.ok) {
            const data = await headerAuth.json();
            console.log("Header auth success:", data);

            if (data.token) sessionStorage.setItem("temp_token", data.token);

            setSession({
              user: {
                name: data.user.username || data.user.email,
                email: data.user.email,
                image: data.user.image || "",
              },
            });
          }
        }
      } catch (err) {
        console.error("Session load error:", err);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const authentication: ToolpadAuth = React.useMemo(
    () => ({
      signIn: async (credentials?: { email: string; password: string }) => {
        try {
          if (!credentials) throw new Error("Credentials required");

          setIsLoading(true);
          const response = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
            credentials: "include",
          });

          if (!response.ok) throw new Error("Login failed");

          const result = await response.json();
          const userData = result.user;

          if (!userData) throw new Error("User data not returned");

          if (result.token) {
            sessionStorage.setItem("temp_token", result.token);
          }

          setSession({
            user: {
              name: userData.username || userData.email,
              email: userData.email,
              image: userData.image || "",
            },
          });

          router.push("/");
          return { success: true };
        } catch (error) {
          console.error("Login error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "Login failed",
          };
        } finally {
          setIsLoading(false);
        }
      },
      signOut: async () => {
        try {
          setIsLoading(true);
          await fetch("http://localhost:8080/logout", {
            method: "POST",
            credentials: "include",
          });

          sessionStorage.removeItem("temp_token");

          setSession(null);
          router.push("/auth/signup");
          return { success: true };
        } catch (error) {
          console.error("Logout error:", error);
          return { success: false };
        } finally {
          setIsLoading(false);
        }
      },
    }),
    [router]
  );

  const authContextValue = React.useMemo(
    () => ({
      signIn: async (user: Session["user"]) => {
        setSession({ user });
        router.push("/");
      },
      signOut: async () => {
        try {
          await fetch("http://localhost:8080/logout", {
            method: "POST",
            credentials: "include",
          });
        } finally {
          sessionStorage.removeItem("temp_token");
          setSession(null);
          router.push("/auth/signup");
        }
      },
      session,
      loading: isLoading,
    }),
    [session, isLoading]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      <AuthGate />
      <NextAppProvider
        session={session}
        authentication={authentication}
        navigation={NAVIGATION}
        branding={BRANDING}
        theme={theme}
      >
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </NextAppProvider>
    </AuthContext.Provider>
  );
}
