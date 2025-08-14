// src/types/types.ts
export type CloudProviderType = "AWS" | "Azure" | "GCP";
export type InstanceType = "small" | "medium" | "large";

export type ApplicationType =
  | "wordpress"
  | "game"
  | "github"
  | "shopify"
  | "cloud-hosting"
  | "database"
  | "ci-cd"
  | "container-app"
  | "static-site"
  | "cdn"
  | "monitoring"
  | "ecommerce";

export type IpOptionType = "reserved" | "dynamic" | null;
export type SshKeyOptionType = "generate" | "existing" | null; // Changed from "input"

export interface DeploymentRequest {
  project_name: string;
  selected_service: string;
  selected_server: string;
  region: string;
  volume_size: number;
  ip_option: string;
  ssh_key_option?: string;
  ssh_key?: string | null;
  terraform_template: string;
  user_email: string;
}

export interface ApiResponse {
  status: string;
  message: string;
  returneddata?: any;
  generatedKey?: {
    private_key: string;
    public_key: string;
  };
}

// Form data structure
export interface FormData {
  projectName: string;
  selectedCloudProvider: CloudProviderType | "";
  selectedInstanceType: InstanceType | "";
  applicationType: ApplicationType | "";
  region: string;
  volumeSize: number;
  ipOption: IpOptionType;
  sshKeyOption: SshKeyOptionType;
  sshKey: string;
}

export interface FormErrors {
  projectName?: string;
  selectedCloudProvider?: string;
  selectedInstanceType?: string;
  applicationType?: string;
  region?: string;
  volumeSize?: string;
  ipOption?: string;
  sshKeyOption?: string;
  sshKey?: string;
}

export interface CloudProviderOption {
  id: CloudProviderType;
  name: string;
  Icon: React.ComponentType;
}

export interface InstanceOption {
  id: InstanceType;
  name: string;
}

export interface ApplicationOption {
  id: ApplicationType;
  name: string;
  available?: boolean;
}
