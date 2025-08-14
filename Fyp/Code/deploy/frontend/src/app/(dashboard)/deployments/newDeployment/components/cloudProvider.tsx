import React from "react";
import { Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import { FormData } from "@/src/lib/types/types";
import { CLOUD_PROVIDERS } from "@/src/constants/constants";

interface CloudProviderSelectionProps {
  cloudProvider: string;
  handleInputChange: (field: keyof FormData, value: string) => void;
}

const CloudProviderSelection: React.FC<CloudProviderSelectionProps> = ({
  cloudProvider,
  handleInputChange,
}) => {
  return (
    <div>
      <Typography variant="h6">Select Cloud Provider</Typography>
      <RadioGroup
        value={cloudProvider}
        onChange={(e) =>
          handleInputChange("selectedCloudProvider", e.target.value)
        }
      >
        {CLOUD_PROVIDERS.map((provider) => (
          <FormControlLabel
            key={provider.id}
            value={provider.id}
            control={<Radio />}
            label={provider.name}
          />
        ))}
      </RadioGroup>
    </div>
  );
};

export default CloudProviderSelection;
