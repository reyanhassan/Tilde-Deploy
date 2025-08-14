"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { auth } from "@/src/lib/firebase";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Link,
  Divider,
} from "@mui/material";
import { AccountCircle, Lock, Email, Person } from "@mui/icons-material";
import { useAuth } from "@/src/context/AuthContext";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    form: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const validations = {
    username: (value: string) =>
      value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value),
    email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value: string) => value.length >= 6, // Firebase requires min 6 chars
    confirmPassword: (value: string) => value === formData.password,
  };

  const errorMessages = {
    username: "Username must be at least 3 characters (letters, numbers, _)",
    email: "Please enter a valid email",
    password: "Password must be at least 6 characters",
    confirmPassword: "Passwords do not match",
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
    setErrors({ ...errors, form: "" });

    // Validate form
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

    if (!isValid) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Sign up the user
      const res = await fetch("http://localhost:8080/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");

      // 2. Immediately sign in the user
      const loginRes = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      if (!loginRes.ok) throw new Error("Auto-login after signup failed");

      // 3. Update the auth context
      await signIn({
        name: formData.username,
        email: formData.email,
        image: "",
      });

      // 4. Force full page reload to ensure all state is cleared
      // window.location.href = "/";
      router.push("/");
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        form: error.message || "An error occurred during signup",
      }));
      setIsSubmitting(false);
    }
  };

  const formFields = [
    {
      name: "username",
      label: "Username",
      type: "text",
      icon: <Person sx={{ color: "action.active", mr: 1, fontSize: 20 }} />,
    },
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
    {
      name: "confirmPassword",
      label: "Confirm Password",
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
            Welcome to Tilde-Deploy
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create your account to get started
          </Typography>
        </Box>

        {errors.form && (
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
              error={!!errors[field.name as keyof typeof errors]}
              helperText={errors[field.name as keyof typeof errors]}
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
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            underline="hover"
            color="primary"
            sx={{ fontWeight: 500 }}
          >
            Login here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
