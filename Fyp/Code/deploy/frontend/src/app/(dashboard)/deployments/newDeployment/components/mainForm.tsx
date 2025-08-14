import React from "react";
import ApplicationTypeSelection from "./applicationType";
import CloudProviderSelection from "./cloudProvider";
import InstanceTypeSelection from "./instanceType";
import SshKeyInput from "./sshKeySelection";
import VerticalProgressForm from "./verticalProgressBar";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Grid,
  useTheme,
  useMediaQuery,
  Divider,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { FormData, FormErrors } from "@/src/lib/types/types";
import CustomButton from "@/src/components/button";

const SectionTitle = ({
  title,
  tooltip,
  id,
}: {
  title: string;
  tooltip?: string;
  id?: string;
}) => (
  <Box sx={{ mt: 4, mb: 2 }} id={id}>
    <Typography
      variant="subtitle1"
      fontWeight="bold"
      display="flex"
      alignItems="center"
    >
      {title}
      {tooltip && (
        <Tooltip title={tooltip} arrow>
          <IconButton size="small" sx={{ color: "text.secondary", ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Box>
);

const ValidationIndicator = ({
  isValid,
  message,
}: {
  isValid: boolean;
  message?: string;
}) => (
  <Box display="flex" alignItems="center" mt={0.5}>
    {isValid ? (
      <CheckCircleIcon color="success" fontSize="small" />
    ) : (
      <ErrorIcon color="error" fontSize="small" />
    )}
    {message && (
      <Typography
        variant="caption"
        color={isValid ? "text.secondary" : "error"}
        ml={1}
      >
        {message}
      </Typography>
    )}
  </Box>
);

const Form: React.FC<{
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: string | number) => void;
  handleDeploy: (e: React.FormEvent) => void;
  handleBlur: (field: keyof FormData) => void;
  errors: FormErrors;
  isSubmitting?: boolean;
  generatedKey?: string | null;
  setGeneratedKey?: (key: string | null) => void;
  keyModalOpen?: boolean;
  setKeyModalOpen?: (open: boolean) => void;
}> = ({
  formData,
  handleInputChange,
  handleDeploy,
  handleBlur,
  errors,
  isSubmitting = false,
}) => {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sections = [
    "Project",
    "Cloud",
    "Instance",
    "Application",
    "Storage",
    "Network",
  ];

  return (
    <Box gap={1} minHeight="100vh" width="100%">
      <Box
        component="form"
        onSubmit={handleDeploy}
        sx={{
          width: "100%",
          overflowY: "auto",
          // maxWidth: 800,
          // mx: "auto",
          // p: isMobile ? 2 : 3,
          // "& .MuiTextField-root": { mb: 2 },
          maxHeight: "calc(100vh - 100px)",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: "3px",
          },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.4)",
          },
          pt: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mb: 3,
            py: 1.5,
            borderBottom: 1,
            borderColor: "divider",
            position: "sticky",
            top: 0,
            backgroundColor: "background.paper",
            zIndex: 10,
          }}
        >
          {sections.map((item) => (
            <Button
              key={item}
              size="small"
              variant="outlined"
              onClick={() =>
                document
                  .getElementById(item)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {item}
            </Button>
          ))}
        </Box>

        <SectionTitle
          title="Project Details"
          tooltip="Name your project for easy identification"
          id="Project"
        />
        <TextField
          label="Project Name"
          value={formData.projectName}
          onChange={(e) => handleInputChange("projectName", e.target.value)}
          onBlur={() => handleBlur("projectName")}
          fullWidth
          margin="normal"
          error={!!errors.projectName}
          helperText={errors.projectName || "A unique name for your deployment"}
          variant="outlined"
          size="small"
        />
        {formData.projectName && (
          <ValidationIndicator
            isValid={!errors.projectName}
            message={errors.projectName || "Project name is valid"}
          />
        )}

        <SectionTitle
          title="Select Cloud Provider"
          tooltip="Choose where to deploy your application"
          id="Cloud"
        />
        <CloudProviderSelection
          cloudProvider={formData.selectedCloudProvider}
          handleInputChange={handleInputChange}
        />
        {formData.selectedCloudProvider && (
          <ValidationIndicator
            isValid={!errors.selectedCloudProvider}
            message={errors.selectedCloudProvider || "Cloud provider selected"}
          />
        )}

        <SectionTitle
          title="Select Instance Type"
          tooltip="Choose the server configuration that fits your needs"
          id="Instance"
        />
        <InstanceTypeSelection
          instanceType={formData.selectedInstanceType}
          handleInputChange={handleInputChange}
        />
        {formData.selectedInstanceType && (
          <ValidationIndicator
            isValid={!errors.selectedInstanceType}
            message={errors.selectedInstanceType || "Instance type selected"}
          />
        )}

        <SectionTitle
          title="Select Application Type"
          tooltip="Choose what you want to deploy"
          id="Application"
        />
        <ApplicationTypeSelection
          applicationType={formData.applicationType}
          handleInputChange={handleInputChange}
        />
        {formData.applicationType && (
          <ValidationIndicator
            isValid={!errors.applicationType}
            message={errors.applicationType || "Application type selected"}
          />
        )}

        {/* <Grid container spacing={3}> */}
        {/* <Grid item xs={12} md={6}> */}
        <SectionTitle
          title="Select a Region"
          tooltip="Choose the geographical location for your deployment"
        />
        <TextField
          label="Region"
          value={formData.region}
          onChange={(e) => handleInputChange("region", e.target.value)}
          onBlur={() => handleBlur("region")}
          fullWidth
          margin="normal"
          error={!!errors.region}
          helperText={
            errors.region || "Closest to your users for best performance"
          }
          variant="outlined"
          size="small"
        />
        {formData.region && (
          <ValidationIndicator
            isValid={!errors.region}
            message={errors.region || "Region selected"}
          />
        )}
        {/* </Grid> */}

        {/* <Grid item xs={12} md={6}> */}
        <SectionTitle
          title="Storage Configuration"
          tooltip="Amount of disk space allocated to your instance"
          id="Storage"
        />
        <TextField
          label="Volume Size (GiB)"
          type="number"
          value={formData.volumeSize || ""}
          onChange={(e) =>
            handleInputChange("volumeSize", Number(e.target.value))
          }
          onBlur={() => handleBlur("volumeSize")}
          fullWidth
          margin="normal"
          error={!!errors.volumeSize}
          helperText={errors.volumeSize || "Minimum 10 GiB recommended"}
          variant="outlined"
          size="small"
          inputProps={{ min: 1, max: 1000 }}
        />
        {formData.volumeSize && (
          <ValidationIndicator
            isValid={!errors.volumeSize}
            message={errors.volumeSize || "Storage size valid"}
          />
        )}
        {/* </Grid> */}
        {/* </Grid> */}

        <SectionTitle
          title="Select IP Address Type"
          tooltip="Choose between a fixed or dynamic IP address"
          id="Network"
        />
        <RadioGroup
          value={formData.ipOption || ""}
          onChange={(e) => handleInputChange("ipOption", e.target.value)}
          sx={{ mt: 1 }}
        >
          <FormControlLabel
            value="reserved"
            control={<Radio />}
            label={
              <Box>
                <Typography>Reserved Static IP</Typography>
                <Typography variant="caption" color="text.secondary">
                  Fixed IP address that do not change
                </Typography>
              </Box>
            }
            sx={{ alignItems: "flex-start" }}
          />
          <FormControlLabel
            value="dynamic"
            control={<Radio />}
            label={
              <Box>
                <Typography>Dynamic IP</Typography>
                <Typography variant="caption" color="text.secondary">
                  May change after reboot (free)
                </Typography>
              </Box>
            }
            sx={{ alignItems: "flex-start", mt: 1 }}
          />
        </RadioGroup>
        {formData.ipOption && (
          <ValidationIndicator
            isValid={!errors.ipOption}
            message={errors.ipOption || "IP option selected"}
          />
        )}

        <SectionTitle
          title="SSH Key Configuration"
          tooltip="Configure secure access to your instance"
        />
        <SshKeyInput
          sshKeyOption={formData.sshKeyOption || ""}
          sshKey={formData.sshKey}
          handleInputChange={handleInputChange}
          handleBlur={handleBlur}
        />
        {(formData.sshKeyOption || formData.sshKey) && (
          <ValidationIndicator
            isValid={!errors.sshKeyOption && !errors.sshKey}
            message={
              errors.sshKeyOption || errors.sshKey
                ? "Fix SSH configuration"
                : "SSH access configured"
            }
          />
        )}

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <CustomButton
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            loading={isSubmitting}
            sx={{
              minWidth: 120,
              py: 1.5,
              fontWeight: "bold",
              "&:hover": { boxShadow: theme.shadows[2] },
            }}
          >
            {isSubmitting ? "Deploying..." : "Deploy"}
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Form;
