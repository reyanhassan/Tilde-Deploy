import React, { useState } from "react";
import Form from "./mainForm";
import { Alert, Box } from "@mui/material";
import { FormData, FormErrors, ApiResponse } from "@/src/lib/types/types";

interface ParentComponentProps {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string | number) => void;
  handleBlur: (field: keyof FormData) => void;
  handleDeploy: (e: React.FormEvent) => Promise<ApiResponse>;
  errors: FormErrors;
  isSubmitting?: boolean;
  generatedKey?: string | null;
}

const ParentComponent: React.FC<ParentComponentProps> = ({
  formData,
  handleDeploy,
  handleInputChange,
  handleBlur,
  errors,
  isSubmitting = false,
  generatedKey,
}) => {
  // const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<ApiResponse | null>(
    null
  );

  const handleDeployWithFeedback = async (e: React.FormEvent) => {
    try {
      const result = await handleDeploy(e);
      setDeploymentResult(result);
      // Show success notification
    } catch (error) {
      setDeploymentResult({
        status: "error",
        message: error instanceof Error ? error.message : "Deployment failed",
      });
    }
  };

  React.useEffect(() => {
    if (deploymentResult) {
      const timer = setTimeout(() => {
        setDeploymentResult(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deploymentResult]);

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1700,
          p: 2,
          transition: "all 0.3 ease",
          transform: deploymentResult ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        {deploymentResult && (
          <Alert
            severity={
              deploymentResult.status === "success" ? "success" : "error"
            }
            sx={{
              backgroundColor: (theme) =>
                deploymentResult.status === "success"
                  ? theme.palette.mode === "dark"
                    ? "#58A4B0"
                    : "#1B1B1E"
                  : theme.palette.mode === "dark"
                    ? "#D32F2F"
                    : "#F44336",
              color: "#ffffff",
              transition: "opacity 0.5s ease-in-out",
              opacity: deploymentResult ? 1 : 0,
            }}
          >
            {deploymentResult.message}
          </Alert>
        )}
      </Box>
      <Form
        formData={formData}
        handleInputChange={handleInputChange}
        handleDeploy={handleDeployWithFeedback} // Use the enhanced handler
        handleBlur={handleBlur}
        errors={errors}
        isSubmitting={isSubmitting}
        generatedKey={generatedKey}
        // setGeneratedKey={setGeneratedKey}
        keyModalOpen={keyModalOpen}
        setKeyModalOpen={setKeyModalOpen}
      />
    </>
  );
};

export default ParentComponent;
