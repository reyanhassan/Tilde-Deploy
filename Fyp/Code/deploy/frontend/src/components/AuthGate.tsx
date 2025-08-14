"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthGate() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const isAuthPage = window.location.pathname.startsWith("/auth");

    if (loading) return; //  Don't redirect if still loading

    if (!session && !isAuthPage) {
      router.replace("/auth/signup");
    }
  }, [session, loading, router]);

  return null;
}
