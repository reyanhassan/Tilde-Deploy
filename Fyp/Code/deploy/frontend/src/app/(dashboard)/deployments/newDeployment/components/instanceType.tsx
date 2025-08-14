// src/components/instanceType/index.tsx
import React from "react";
import {
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";
import { FormData } from "@/src/lib/types/types";
import { INSTANCE_TYPES } from "@/src/constants/constants";

interface InstanceTypeSelectionProps {
  instanceType: string;
  handleInputChange: (field: keyof FormData, value: string) => void;
}

const InstanceTypeSelection: React.FC<InstanceTypeSelectionProps> = ({
  instanceType,
  handleInputChange,
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Instance Size
      </Typography>
      <RadioGroup
        value={instanceType}
        onChange={(e) =>
          handleInputChange("selectedInstanceType", e.target.value)
        }
        sx={{ gap: 1 }}
      >
        {INSTANCE_TYPES.map((instance) => (
          <FormControlLabel
            key={instance.id}
            value={instance.id}
            control={<Radio />}
            label={
              <Box>
                <Typography>{instance.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {instance.description || ""}
                </Typography>
              </Box>
            }
            sx={{
              border: "1px solid",
              borderColor:
                instanceType === instance.id ? "primary.main" : "divider",
              borderRadius: 1,
              padding: 1,
              margin: 0,
              alignItems: "flex-start",
            }}
          />
        ))}
      </RadioGroup>
    </Box>
  );
};

export default InstanceTypeSelection;
