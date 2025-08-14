import React from "react";
import { Box, Typography } from "@mui/material";
import { FormData } from "@/src/lib/types/types";

interface SidebarProps {
  formData: FormData;
}

const Sidebar: React.FC<SidebarProps> = ({ formData }) => {
  // Define all sidebar items in an array for DRY code
  const sidebarItems = [
    { label: "Project Name", value: formData.projectName },
    { label: "Cloud Provider", value: formData.selectedCloudProvider },
    { label: "Instance Type", value: formData.selectedInstanceType },
    { label: "Application Type", value: formData.applicationType },
    { label: "Region", value: formData.region },
    {
      label: "Volume Size",
      value: formData.volumeSize ? `${formData.volumeSize} GiB` : null,
    },
    { label: "IP Option", value: formData.ipOption },
    { label: "SSH Key Option", value: formData.sshKeyOption },
  ];

  return (
    <Box
      sx={{
        height: "calc(100vh - 80px)",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255,255,255,0.3)",
          borderRadius: "3px",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.4)",
          },
        },
        pr: 1,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 100 }}>
        Selected Options
      </Typography>

      {sidebarItems.map((item) => (
        <Typography key={item.label} sx={{ mb: 1.5 }}>
          <Box
            component="span"
            //  variant="body2"
            sx={{
              color: "text.secondary",
              mb: 0.5,
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {item.label}:
          </Box>
          <Box
            component="span"
            sx={{
              fontWeight: 100,
              color: item.value ? "text.primary" : "text.disabled",
              fontStyle: item.value ? "normal" : "italic",
            }}
          >
            {item.value || "not specified"}
          </Box>
        </Typography>
      ))}
    </Box>
  );
};

export default Sidebar;
