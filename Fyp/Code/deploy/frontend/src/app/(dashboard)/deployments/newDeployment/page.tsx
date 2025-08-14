"use client";

import React from "react";
import Sidebar from "./components/sideBar";
import { Box, useMediaQuery, Theme, Typography } from "@mui/material";
import ParentComponent from "./components/parentForm";
import { useDeploymentForm } from "@/src/hooks/useDeploymentForm";
import { initialFormData } from "@/src/constants/constants";
import VerticalProgressForm from "./components/verticalProgressBar";
import { useAuth } from "@/src/context/AuthContext";

const NewDeploymentPage: React.FC = () => {
  const { session, loading } = useAuth();
  const userEmail = session?.user?.email || "";

  // Show loader if auth is still loading
  // if (loading) {
  //   return <CircularProgress />;
  // }

  if (!userEmail) {
    return <div>please log in to deploy</div>;
  }

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  const {
    formData,
    errors,
    isSidebarOpen,
    isDeployClicked,
    handleInputChange,
    handleBlur,
    handleDeploy,
    setIsSidebarOpen,
  } = useDeploymentForm(initialFormData, userEmail);

  // Auto-show sidebar when form starts getting filled (mobile only)
  React.useEffect(() => {
    if (isMobile) {
      const hasFilledFields = Object.values(formData).some(
        (value) =>
          value !== "" && value !== null && value !== undefined && value !== 10
      );
      if (hasFilledFields && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    }
  }, [formData, isMobile, isSidebarOpen, setIsSidebarOpen]);

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          Deploying as: <strong>{userEmail || "Not logged in"}</strong>
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          height: "calc(100vh - 64px)", // Adjust based on your header height
          position: "relative",
          overflow: "hidden",
          scrollbarWidth: "none",
          "&:: -webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1000,
            }}
          >
            <VerticalProgressForm formData={formData} />
          </Box>
        )}

        {/* Main Content */}
        <Box
          sx={{
            p: 3,
            flex: 1,
            ml: 0,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,0.3)",
              borderRadius: "3px",
            },
            "&:hover::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(255,255,255,0.4)",
            },
          }}
        >
          <ParentComponent
            formData={formData}
            handleInputChange={handleInputChange}
            handleBlur={handleBlur}
            handleDeploy={handleDeploy}
            errors={errors}
            isSubmitting={isDeployClicked}
          />
        </Box>

        {/* Sidebar */}
        {isSidebarOpen && !isDeployClicked && (
          <Box
            sx={{
              width: { xs: "100%", sm: "300px" },
              height: { xs: "50vh", sm: "100%" },
              flexShrink: 0,
              p: 3,
              position: "relative",
              borderRadius: "10px 0 0 10px",
              left: 0,
              right: 0,
              top: 0,
              backgroundColor: "#24302F",
              overflowY: "auto",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: "3px",
              },
              "&:hover::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.5)",
              },
            }}
          >
            <Sidebar formData={formData} />
          </Box>
        )}

        {/* Toggle button for non-mobile screens
      {!isMobile && (
        <Box
          sx={{
            position: "fixed",
            right: isSidebarOpen ? "300px" : "10px",
            top: "84px",
            zIndex: 1100,
            transition: "right 0.3s ease",
            cursor: "pointer",
            backgroundColor: "#24302F",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#2d3b3a",
            },
          }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
        </Box>
      )} */}
      </Box>
    </>
  );
};

export default NewDeploymentPage;
