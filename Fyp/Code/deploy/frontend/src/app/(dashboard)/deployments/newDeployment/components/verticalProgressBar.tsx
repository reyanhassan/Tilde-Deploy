import { motion } from "framer-motion";
import { FormData } from "@/src/lib/types/types";

interface ProgressProps {
  formData: FormData;
}

export default function VerticalProgressForm({ formData }: ProgressProps) {
  // List of all fields to track
  const fieldsToTrack: (keyof FormData)[] = [
    "projectName",
    "selectedCloudProvider",
    "selectedInstanceType",
    "applicationType",
    "region",
    "volumeSize",
    "ipOption",
    "sshKeyOption",
    "sshKey",
  ];

  // Calculate filled fields
  const filledFields = fieldsToTrack.filter((field) => {
    const value = formData[field];
    return value !== "" && value !== null && value !== undefined;
  }).length;

  // Total fields
  const totalFields = fieldsToTrack.length;

  // Calculate progress percentage
  const progress = (filledFields / totalFields) * 100;

  return (
    <div
      style={{
        position: "relative",
        width: "4px", // Width of the progress bar
        height: "100%", // Height of the progress bar (fills the container)
        backgroundColor: "#c1baa1", // Background color of the progress bar
        borderRadius: "10px", // Rounded corners
        overflow: "hidden", // Ensures the inner bar doesn't overflow
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0, // Starts filling
          left: 0,
          width: "100%",
          backgroundColor: "#58A4B0", // Inner color
        }}
        initial={{ height: 0 }} // Initial height (0%)
        animate={{ height: `${progress}%` }} // Animate to current progress
        transition={{ duration: 0.5 }} // Smooth animation
      />
    </div>
  );
}
