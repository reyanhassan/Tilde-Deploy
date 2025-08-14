import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface DeploymentCardProps {
  serviceProvider: string;
  nameOfProject: string;
  createdTime: string;
}

const DeploymentCard: React.FC<DeploymentCardProps> = ({
  serviceProvider,
  nameOfProject,
  createdTime,
}) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        backgroundColor: "#24302F",
        display: "flex",
        marginTop: "20px",
        alignItems: "center",
        width: "100%",
        marginBottom: 2,
        boxShadow: 10,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 1, // Adds space between the elements
        }}
      >
        <Typography variant="h6" component="div" fontWeight="bold">
          {nameOfProject}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          service Provider_{serviceProvider}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          CreatedTime_ {createdTime}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DeploymentCard;
