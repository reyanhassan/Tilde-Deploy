"use client";
import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import CustomButton from "@/src/components/button";
import { useAuth } from "@/src/context/AuthContext";

// Interface for both old and new deployment data formats
interface Deployment {
  id?: number;
  project_id?: string;
  name?: string;
  project_name?: string;
  provider?: string;
  selected_service?: string;
  region: string;
  status: string;
  created_at: string;
  progress?: number;
}

export default function DeploymentsPage() {
  const { session } = useAuth();
  const userEmail = session?.user?.email;
  const [deployments, setDeployments] = React.useState<Deployment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchDeployments = async (email: string) => {
    try {
      const response = await fetch(
        `/api/get-deployments?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to fetch deployments");
      }

      console.log("🚀 Deployments:", result);
      return result;
    } catch (err) {
      console.error("Error fetching deployments:", err);
      return null;
    }
  };

  React.useEffect(() => {
    if (!userEmail) return;

    const load = async () => {
      setLoading(true);
      const data = await fetchDeployments(userEmail);
      if (data) {
        setDeployments(data);
        setError(null);
      } else {
        setError("Could not load deployments");
      }
      setLoading(false);
    };

    load();
  }, [userEmail]);

  const handleRefresh = async () => {
    if (!userEmail) return;

    setLoading(true);
    const data = await fetchDeployments(userEmail);
    if (data) {
      setDeployments(data);
      setError(null);
    } else {
      setError("Could not refresh deployments");
    }
    setLoading(false);
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Stack direction="row" spacing={2}>
          <IconButton size="large" onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
          <CustomButton
            variant="contained"
            startIcon={<AddIcon />}
            href="/settings"
          >
            New Deployment
          </CustomButton>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  align="center"
                  sx={{ color: "error.main" }}
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : deployments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No deployments found
                </TableCell>
              </TableRow>
            ) : (
              deployments.map((deployment) => (
                <TableRow key={deployment.id || deployment.project_id}>
                  <TableCell>
                    {deployment.name || deployment.project_name}
                  </TableCell>
                  <TableCell>
                    {deployment.provider || deployment.selected_service}
                  </TableCell>
                  <TableCell>{deployment.region}</TableCell>
                  <TableCell>
                    <Chip
                      label={deployment.status}
                      color={
                        deployment.status === "running" ||
                        deployment.status === "active"
                          ? "success"
                          : deployment.status === "deploying" ||
                              deployment.status === "pending"
                            ? "info"
                            : deployment.status === "failed"
                              ? "error"
                              : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(deployment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{deployment.progress || 100}%</TableCell>
                  <TableCell>
                    <IconButton>
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
