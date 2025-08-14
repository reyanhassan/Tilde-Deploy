import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";

interface Service {
  id: string;
  name: string;
}

interface ServiceSelectionProps {
  selectedService: string;
  handleInputChange: (field: string, value: string) => void;
}

const services: Service[] = [
  { id: "wordpress", name: "WordPress Site" },
  { id: "game", name: "Game" },
  { id: "github", name: "GitHub Code" },
  { id: "shopify", name: "Shopify Site" },
  { id: "cloud-hosting", name: "Cloud Hosting" },
  { id: "database", name: "Database Service" },
  { id: "ci-cd", name: "CI/CD Pipelines" },
  { id: "container-app", name: "Container Application" },
  { id: "static-site", name: "Static Website" },
  { id: "cdn", name: "CDN & Caching" },
  { id: "monitoring", name: "Monitoring & Logging" },
  { id: "ecommerce", name: "E-commerce Solution" },
];

const StyledTab = styled(Box)(({ theme }) => ({
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

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedService,
  handleInputChange,
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", // Always 3 columns by default
        gap: 1,
        "@media (min-width: 1424px)": {
          gridTemplateColumns: "repeat(4, 1fr)", // 2 columns when sidebar appears
        },
        "@media (max-width: 1024px)": {
          gridTemplateColumns: "repeat(2, 1fr)", // 2 columns when sidebar appears
        },
        "@media (max-width: 600px)": {
          gridTemplateColumns: "repeat(1, 1fr)", // 1 column for mobile
        },
      }}
    >
      {services.map((service) => (
        <StyledTab
          key={service.id}
          onClick={() => handleInputChange("selectedService", service.id)}
          sx={{
            background:
              selectedService === service.id ? "#497D74" : "rgb(98, 149, 162)",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          <Typography variant="body1">{service.name}</Typography>
        </StyledTab>
      ))}
    </Box>
  );
};

export default ServiceSelection;
