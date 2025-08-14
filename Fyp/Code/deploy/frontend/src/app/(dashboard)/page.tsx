"use client";
import * as React from "react";
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Cloud as CloudIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Sync as SyncIcon,
  Add as AddIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import theme from "@/theme";
import CustomButton from "@/src/components/button";

// Interfaces
interface StatsData {
  total?: number;
  active?: number;
  in_progress?: number;
  failed?: number;
}

interface Deployment {
  id?: string | number;
  name?: string;
  provider?: string;
  region?: string;
  status?: string;
  created_at?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = React.useState<StatsData>({});
  const [recentDeployments, setRecentDeployments] = React.useState<
    Deployment[]
  >([]);
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [loadingDeployments, setLoadingDeployments] = React.useState(true);
  const [errorStats, setErrorStats] = React.useState<string | null>(null);
  const [errorDeployments, setErrorDeployments] = React.useState<string | null>(
    null
  );

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("http://localhost:8080/deployments");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setErrorStats(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch recent deployments
  const fetchRecentDeployments = async () => {
    try {
      setLoadingDeployments(true);
      const res = await fetch("/api/get-deployments");
      if (!res.ok) throw new Error("Failed to fetch recent deployments");
      const data = await res.json();
      setRecentDeployments(data?.slice(0, 5) || []);
    } catch (err) {
      setErrorDeployments(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingDeployments(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    fetchRecentDeployments();
  }, []);

  // Health checks (mock)
  const healthChecks = [
    { status: "operational", system: "API Service" },
    { status: "degraded", system: "Database" },
    { status: "operational", system: "Authentication" },
    { status: "maintenance", system: "Storage" },
  ];

  // Provider distribution (mock)
  const providerDistribution = [
    { name: "AWS", percentage: 45, color: "#FF9900" },
    { name: "GCP", percentage: 30, color: "#4285F4" },
    { name: "Azure", percentage: 20, color: "#0078D4" },
    { name: "Hetzner", percentage: 20, color: "#B22222" },
    { name: "Other", percentage: 5, color: "#58A4B0" },
  ];

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <CustomButton
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          href="/settings"
        >
          New Deployment
        </CustomButton>
      </Stack>

      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            label: "Total Deployments",
            icon: <CloudIcon color="primary" />,
            value: stats.total,
          },
          {
            label: "Active",
            icon: <SuccessIcon color="success" />,
            value: stats.active,
          },
          {
            label: "In Progress",
            icon: <SyncIcon color="info" />,
            value: stats.in_progress,
          },
          {
            label: "Failed",
            icon: <ErrorIcon color="error" />,
            value: stats.failed,
          },
        ].map(({ label, icon, value }, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  {icon}
                  <Box>
                    <Typography variant="h5">
                      {loadingStats ? (
                        <CircularProgress size={24} />
                      ) : (
                        value || 0
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Middle Section */}
      <Grid container spacing={3} mb={4}>
        {/* Health Check */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                System Health Check
              </Typography>
              <Stack spacing={2}>
                {healthChecks.map((check, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "background.default",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {check.status === "operational" ? (
                      <SuccessIcon color="success" sx={{ mr: 2 }} />
                    ) : check.status === "degraded" ? (
                      <WarningIcon color="warning" sx={{ mr: 2 }} />
                    ) : (
                      <SyncIcon color="info" sx={{ mr: 2 }} />
                    )}
                    <Typography>{check.system}</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {check.status}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Provider Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Provider Distribution
              </Typography>
              <Stack spacing={2}>
                {providerDistribution.map((provider, index) => (
                  <Box key={index}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 16,
                          height: 16,
                          bgcolor: provider.color,
                          mr: 1.5,
                        }}
                      />
                      <Typography variant="body2">{provider.name}</Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {provider.percentage}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: "100%",
                        height: 8,
                        bgcolor: "divider",
                        borderRadius: 4,
                      }}
                    >
                      <Box
                        sx={{
                          width: `${provider.percentage}%`,
                          height: "100%",
                          bgcolor: provider.color,
                          borderRadius: 4,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Deployments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          {/* Placeholder: Resource Utilization */}
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Resource Utilization
              </Typography>
              {/* You can enhance this later */}
              <Typography color="text.secondary">Coming soon...</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Recent Deployments
              </Typography>

              {loadingDeployments ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : errorDeployments ? (
                <Typography color="error">Error: {errorDeployments}</Typography>
              ) : recentDeployments.length === 0 ? (
                <Typography>No recent deployments found.</Typography>
              ) : (
                <Stack spacing={2}>
                  {recentDeployments.map((deployment, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Typography variant="subtitle1">
                        {deployment.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {deployment.provider} – {deployment.region} –{" "}
                        {new Date(
                          deployment.created_at || ""
                        ).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        Status: {deployment.status}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
