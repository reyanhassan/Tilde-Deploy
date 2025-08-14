import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { FormData } from "@/src/lib/types/types";
import { APPLICATION_TYPES } from "@/src/constants/constants";

const StyledTab = styled(Box)(() => ({
  cursor: "pointer",
  padding: "15px 20px",
  borderRadius: "12px",
  textAlign: "center",
  transition: "all 0.3s ease",
  backdropFilter: "blur(8px)",
  background: "rgb(98, 149, 162)",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  "&:hover": {
    backdropFilter: "blur(12px)",
    background: "#57A6A1",
    color: "black",
  },
}));

interface ApplicationTypeSelectionProps {
  applicationType: string;
  handleInputChange: (field: keyof FormData, value: string) => void;
}

const ApplicationTypeSelection: React.FC<ApplicationTypeSelectionProps> = ({
  applicationType,
  handleInputChange,
}) => {
  // Filter to only show available application types
  const availableApplications = APPLICATION_TYPES.filter(
    (app) => app.available
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 1,
        "@media (min-width: 1424px)": {
          gridTemplateColumns: "repeat(4, 1fr)",
        },
        "@media (max-width: 1024px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
        },
        "@media (max-width: 600px)": {
          gridTemplateColumns: "repeat(1, 1fr)",
        },
      }}
    >
      {availableApplications.map((app) => (
        <StyledTab
          key={app.id}
          onClick={() => handleInputChange("applicationType", app.id)}
          sx={{
            background:
              applicationType === app.id ? "#497D74" : "rgb(98, 149, 162)",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          <Typography variant="body1">{app.name}</Typography>
        </StyledTab>
      ))}
    </Box>
  );
};

export default ApplicationTypeSelection;
