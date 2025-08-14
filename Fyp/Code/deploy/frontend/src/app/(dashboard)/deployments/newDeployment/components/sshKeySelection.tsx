import React, { useState } from "react";
import {
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { FormData } from "@/src/lib/types/types";

interface SshKeyInputProps {
  sshKeyOption: string;
  sshKey: string;
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleBlur?: (field: keyof FormData) => void;
}

const SshKeyInput: React.FC<SshKeyInputProps> = ({
  sshKeyOption,
  sshKey,
  handleInputChange,
  handleBlur,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange("sshKeyOption", e.target.value);
    if (e.target.value === "generate") {
      handleInputChange("sshKey", ""); // Clear any existing key
    }
  };

  const validateSshKey = (key: string): boolean => {
    return /^ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3}( [^@]+@[^@]+)?$/.test(
      key.trim()
    );
  };
  return (
    <div>
      <RadioGroup
        value={sshKeyOption || ""}
        onChange={(e) => handleInputChange("sshKeyOption", e.target.value)}
      >
        <FormControlLabel
          value="generate"
          control={<Radio />}
          label={
            <Box>
              <Typography>Generate SSH Key</Typography>
              <Typography variant="caption" color="text.secondary">
                Generate SSH key
                {isGenerating && <CircularProgress size={20} sx={{ ml: 1 }} />}
              </Typography>
            </Box>
          }
          sx={{ alignItems: "flex-start" }}
        />
        <FormControlLabel
          value="existing"
          control={<Radio />}
          label={
            <Box>
              <Typography>Use Existing SSH Key</Typography>
              <Typography variant="caption" color="text.secondary">
                Paste your public key (starts with ssh-rsa)
              </Typography>
            </Box>
          }
          sx={{ alignItems: "flex-start", mt: 1 }}
        />
      </RadioGroup>

      {sshKeyOption === "existing" && (
        <TextField
          label="SSH Public Key"
          placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ..."
          helperText={
            sshKey && !validateSshKey(sshKey)
              ? "Invalid format. Must be: ssh-rsa <base64-key> [comment]"
              : "Must start with 'ssh-rsa' followed by base64 key"
          }
          value={sshKey}
          onChange={(e) => handleInputChange("sshKey", e.target.value)}
          onBlur={() => handleBlur?.("sshKey")}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          error={!!sshKey && !validateSshKey(sshKey)}
        />
      )}
    </div>
  );
};

export default SshKeyInput;
