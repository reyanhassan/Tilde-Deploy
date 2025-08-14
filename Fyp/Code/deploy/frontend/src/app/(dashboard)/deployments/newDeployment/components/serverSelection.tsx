import React from "react";
import { Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";

interface ServerSelectionProps {
  selectedServer: string;
  handleInputChange: (field: string, value: string) => void;
}

const ServerSelection: React.FC<ServerSelectionProps> = ({
  selectedServer,
  handleInputChange,
}) => {
  return (
    <div>
      <Typography variant="h6">Select Server</Typography>
      <RadioGroup
        value={selectedServer}
        onChange={(e) => handleInputChange("selectedServer", e.target.value)}
      >
        <FormControlLabel value="aws" control={<Radio />} label="AWS" />
        <FormControlLabel value="azure" control={<Radio />} label="Azure" />
        <FormControlLabel value="gcp" control={<Radio />} label="GCP" />
      </RadioGroup>
    </div>
  );
};

export default ServerSelection;
