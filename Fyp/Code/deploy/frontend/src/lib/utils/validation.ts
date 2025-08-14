// src/lib/utils/validate.ts
import { FormData, FormErrors } from "../types/types";

export const validateForm = (formData: FormData): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.projectName.trim()) {
    errors.projectName = "Project name is required";
  } else if (formData.projectName.length > 50) {
    errors.projectName = "Project name must be less than 50 characters";
  }

  if (!formData.selectedCloudProvider) {
    errors.selectedCloudProvider = "Cloud provider is required";
  }

  if (!formData.selectedInstanceType) {
    errors.selectedInstanceType = "Instance type is required";
  }

  if (!formData.applicationType) {
    errors.applicationType = "Application type is required";
  }

  if (!formData.region.trim()) {
    errors.region = "Region is required";
  }

  if (!formData.volumeSize || formData.volumeSize <= 0) {
    errors.volumeSize = "Volume size must be positive";
  } else if (formData.volumeSize > 1000) {
    errors.volumeSize = "Volume size must be less than 1000 GiB";
  }

  if (!formData.ipOption) {
    errors.ipOption = "IP option is required";
  }

  if (!formData.sshKeyOption) {
    errors.sshKeyOption = "SSH key option is required";
  }

  if (formData.sshKeyOption === "existing" && !formData.sshKey.trim()) {
    errors.sshKey = "SSH key is required";
  } else if (
    formData.sshKeyOption === "existing" &&
    formData.sshKey.length > 2000
  ) {
    errors.sshKey = "SSH key is too long";
  }

  return errors;
};

export const validateSSHKey = (key: string): boolean => {
  const regex = /^ssh-rsa [A-Za-z0-9+/=]+ ?[A-Za-z0-9]*$/;
  return regex.test(key.trim());
};

export const validateField = (
  field: keyof FormData,
  value: string | number | null,
  formData: FormData
): string | undefined => {
  // const errors: FormErrors = {};
  switch (field) {
    case "projectName":
      if (!value) return "Project name is required";
      if (typeof value === "string" && value.length > 50) {
        return "Must be less than 50 characters";
      }
      return;
    case "selectedCloudProvider":
      if (!value) return "Cloud provider is required";
      return;
    case "selectedInstanceType":
      if (!value) return "Instance type is required";
      return;
    case "applicationType":
      if (!value) return "Application type is required";
      return;
    case "region":
      if (!value) return "Region is required";
      return;
    case "volumeSize":
      if (value === null || value === undefined)
        return "Volume size is required";
      if (Number(value) <= 0) return "Volume size must be positive";
      if (Number(value) > 1000) return "Volume size must be less than 1000 GiB";
      return;
    case "ipOption":
      if (value === null) return "IP option is required";
      return;
    case "sshKeyOption":
      if (value === null) return "SSH key option is required";
      return;
    case "sshKey":
      if (formData.sshKeyOption === "existing") {
        if (!value) return "SSH key is required";
        if (typeof value === "string" && value.length > 2000) {
          return "SSH key is too long";
        }
        if (typeof value === "string" && !validateSSHKey(value)) {
          return "Must be a valid ssh-rsa key (e.g. 'ssh-rsa AAAAB3Nza...')";
        }
      }
      return;
    default:
      return;
  }
};
