import { useState, useCallback } from "react";
import {
  FormData,
  FormErrors,
  DeploymentRequest,
  ApiResponse,
} from "../lib/types/types";
import { validateForm, validateField } from "../lib/utils/validation";
import { deployInfrastructure } from "../lib/api/api";

export const useDeploymentForm = (
  initialState: FormData,
  userEmail?: string
) => {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeployClicked, setIsDeployClicked] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleInputChange = useCallback(
    <K extends keyof FormData>(
      field: K,
      value: FormData[K] | React.ChangeEvent<HTMLInputElement> | null
    ) => {
      if (value === null) return;
      const newValue =
        typeof value === "object" && "target" in value
          ? value.target.value
          : value;

      if (newValue === null) return;

      setFormData((prev) => ({ ...prev, [field]: newValue }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setIsDeployClicked(false);

      if (newValue !== "" && newValue) {
        setIsSidebarOpen(true);
      }
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof FormData) => {
      const error = validateField(field, formData[field], formData);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData]
  );

  const handleDeploy = useCallback(
    async (e: React.FormEvent): Promise<ApiResponse> => {
      e.preventDefault();
      setIsDeployClicked(true);
      console.log("starting deployment...");

      if (!userEmail?.trim()) {
        throw new Error("you must be logged in to deploy");
      }

      setIsDeployClicked(true);
      setIsSidebarOpen(false);

      try {
        const validationErrors = validateForm(formData);

        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          throw new Error("form validation failed");
        }

        console.log("form data", formData);
        console.log("user email", userEmail);

        const payload: DeploymentRequest = {
          project_name: formData.projectName,
          selected_service: formData.selectedCloudProvider as string,
          selected_server: "cx22",
          region: formData.region,
          volume_size: formData.volumeSize,
          ip_option: formData.ipOption as string,
          ssh_key_option: formData.sshKeyOption as string,
          ssh_key:
            formData.sshKeyOption === "existing" ? formData.sshKey : null,
          terraform_template: "hetzner",
          user_email: userEmail, //  actual user email from auth
        };

        console.log("payload being sent__", payload);

        const response = await deployInfrastructure(payload);
        setFormData(initialState);

        if (formData.sshKeyOption === "generate" && response.generatedKey) {
          setGeneratedKey(response.generatedKey.private_key);
        }

        return response;
      } catch (error) {
        setIsDeployClicked(false);
        console.error("Deployment failed:", error);
        throw error;
      } finally {
        setIsDeployClicked(false);
      }
    },
    [formData, userEmail, initialState]
  );

  return {
    formData,
    errors,
    isSidebarOpen,
    isDeployClicked,
    handleInputChange,
    handleBlur,
    handleDeploy,
    setIsSidebarOpen,
    generatedKey,
  };
};
