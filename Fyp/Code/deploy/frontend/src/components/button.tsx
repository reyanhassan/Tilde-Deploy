import { Button, ButtonProps, CircularProgress } from "@mui/material";
import Link from "next/link";

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  href?: string; // Using href instead of to for Next.js
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  loading,
  href,
  startIcon,
  ...props
}) => {
  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <Button
          component="a" // Using 'a' tag for Next.js Link
          startIcon={startIcon}
          disabled={loading}
          {...props}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              {children}
            </>
          ) : (
            children
          )}
        </Button>
      </Link>
    );
  }

  return (
    <Button startIcon={startIcon} disabled={loading} {...props}>
      {loading ? (
        <>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
