// src/app/auth/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "@/src/lib/firebase"; // Changed from "@/src/lib/firebase"
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Divider,
} from "@mui/material";
import { Email, Lock } from "@mui/icons-material";
import { useAuth } from "@/src/context/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const validations = {
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value: string) => value.length >= 6,
  };

  const errorMessages = {
    email: "Please enter a valid email",
    password: "Password must be at least 6 characters",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = { ...errors, form: "" };
    let isValid = true;

    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      if (!formData[key]) {
        newErrors[key] =
          `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
        isValid = false;
      } else if (!validations[key]?.(formData[key])) {
        newErrors[key] = errorMessages[key];
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      console.log("Login response data:", data);

      signIn({
        name:
          data.returneddata?.user?.username ||
          data.returneddata?.user?.email ||
          "Unknown User",
        email: data.returneddata?.user?.email || "",
        image: data.returneddata?.user?.image || "",
      });

      router.push("/");
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, form: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  }; // <-- Make sure this closing brace is here

  const formFields = [
    {
      name: "email",
      label: "Email",
      type: "email",
      icon: <Email sx={{ color: "action.active", mr: 1, fontSize: 20 }} />,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      icon: <Lock sx={{ color: "action.active", mr: 1, fontSize: 20 }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 4,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 6,
          width: "100%",
          maxWidth: "500px",
          bgcolor: "background.paper",
          borderRadius: 3,
        }}
      >
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Sign in to your account
          </Typography>
        </Box>

        {errors && (
          <Typography color="error" sx={{ mb: 3, textAlign: "center" }}>
            {errors.form}
          </Typography>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {formFields.map((field) => (
            <TextField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              variant="outlined"
              fullWidth
              margin="normal"
              value={formData[field.name as keyof typeof formData]}
              onChange={handleChange}
              InputProps={{ startAdornment: field.icon }}
              sx={{ mb: 3 }}
            />
          ))}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{
              py: 1.8,
              mb: 3,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
          Do not have an account?{" "}
          <Link
            href="/auth/signup"
            underline="hover"
            color="primary"
            sx={{ fontWeight: 500 }}
          >
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
