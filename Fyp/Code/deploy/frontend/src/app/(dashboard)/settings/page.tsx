"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudIcon from "@mui/icons-material/Cloud";

export default function SettingsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [providerKey, setProviderKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateKey = (rawKey: string) => {
    const key = rawKey.trim();
    if (!key) return "API key is required";
    if (key.length !== 64)
      return `Key must be exactly 64 characters (current: ${key.length})`;
    if (!/^[A-Za-z0-9]{64}$/.test(key))
      return "Key must contain only letters and numbers";
    return null;
  };

  const handleSubmit = async () => {
    if (!session?.user?.email) {
      setError("You must be logged in");
      return;
    }

    // Basic validation
    if (!providerKey || providerKey.length !== 64) {
      setError("API key must be 64 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include auth token if needed
          ...(sessionStorage.getItem("temp_token") && {
            Authorization: `Bearer ${sessionStorage.getItem("temp_token")}`,
          }),
        },
        body: JSON.stringify({
          user_email: session.user.email,
          provider_key: providerKey,
        }),
        credentials: "include", // Required for cookies
      });

      // Handle both JSON and text responses
      const result = await response.text();
      if (!response.ok) throw new Error(result);

      setIsSuccess(true);
      setTimeout(() => router.push("/deployments/newDeployment"), 2000);
    } catch (err) {
      if (err instanceof Error)
        setError(err.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 3, mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <CloudIcon color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
        Cloud Configuration
      </Typography>

      <Card
        sx={{ mb: 3, borderLeft: "4px solid", borderColor: "primary.main" }}
      >
        <CardContent>
          <Chip
            label="Hetzner Cloud"
            color="primary"
            icon={<CheckCircleIcon />}
            sx={{ mb: 2 }}
          />
          <Typography variant="body2" color="text.secondary">
            Enter your 64-character Hetzner API key
          </Typography>
        </CardContent>
      </Card>

      <TextField
        fullWidth
        label="Hetzner API Key"
        type="password"
        value={providerKey}
        onChange={(e) => {
          const value = e.target.value.replace(/\s/g, "").slice(0, 64);
          setProviderKey(value);
          setError("");
        }}
        margin="normal"
        error={!!error}
        helperText={error || "Example: FZ123... (64 characters)"}
        disabled={isLoading || isSuccess}
        sx={{ mb: 3 }}
      />

      {isSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Provider configured successfully! Redirecting...
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          onClick={() => router.back()}
          variant="outlined"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || isSuccess || !providerKey.trim()}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Configuring..." : "Continue"}
        </Button>
      </Box>
    </Box>
  );
}
