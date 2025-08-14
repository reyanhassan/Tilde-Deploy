// import CloudIcon from "@mui/icons-material/Cloud";
// import AzureIcon from "@mui/icons-material/AcUnit";
// import GcpIcon from "@mui/icons-material/GTranslate";
import { FormData } from "@/src/lib/types/types";

export const initialFormData: FormData = {
  projectName: "",
  selectedCloudProvider: "",
  selectedInstanceType: "",
  applicationType: "",
  region: "",
  volumeSize: 10,
  ipOption: null,
  sshKeyOption: null,
  sshKey: "",
};

// Rename `SERVERS` to `INSTANCE_TYPES` (since they're machine sizes, not cloud providers)
export interface InstanceOption {
  id: string;
  name: string;
  description: string; // Add this
}
export const INSTANCE_TYPES = [
  {
    id: "small",
    name: "Small (1vCPU, 2GB RAM)",
    description: "1 vCPU, 2GB RAM - Good for development and testing",
  },
  {
    id: "medium",
    name: "Medium (2vCPU, 4GB RAM)",
    description: "2 vCPU, 4GB RAM - Best for development and testing",
  },
  {
    id: "large",
    name: "Large (4vCPU, 8GB RAM)",
    description: "4 vCPU, 8GB RAM - Good for development and testing",
  },
];

// Rename `SERVICES` to `CLOUD_PROVIDERS` (AWS, Azure, GCP)
export const CLOUD_PROVIDERS = [
  { id: "AWS", name: "Amazon Web Services" },
  { id: "Azure", name: "Microsoft Azure" },
  { id: "GCP", name: "Google Cloud Platform" },
];

export const APPLICATION_TYPES = [
  { id: "wordpress", name: "WordPress Site", available: true },
  { id: "game", name: "Game", available: true },
  { id: "github", name: "GitHub Code", available: true },
  { id: "shopify", name: "Shopify Site", available: true },
  { id: "cloud-hosting", name: "Cloud Hosting", available: true },
  { id: "database", name: "Database Service", available: false },
  { id: "ci-cd", name: "CI/CD Pipelines", available: false },
  { id: "container-app", name: "Container Application", available: false },
  { id: "static-site", name: "Static Website", available: false },
  { id: "cdn", name: "CDN & Caching", available: false },
  { id: "monitoring", name: "Monitoring & Logging", available: false },
  { id: "ecommerce", name: "E-commerce Solution", available: false },
];
