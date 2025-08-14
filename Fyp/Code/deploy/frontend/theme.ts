"use client";
import { createTheme } from "@mui/material/styles";
// import { experimental_extendTheme as extendTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },

  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: "#1B1B1E",
        },
        secondary: {
          main: "#D8DBE2",
        },
        background: {
          default: "#D8DBE2",
          paper: "#A9BCD0",
        },
        text: {
          primary: "#000000",
          secondary: "#666666",
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#58A4B0",
        },
        secondary: {
          main: "#1B1B1E",
        },
        background: {
          default: "#1B1B1E",
          paper: "#24302F",
        },
        text: {
          primary: "#FFFFFF",
        },
      },
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: "200px", // Adjust sidebar width here
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "#ffffff", // Default item text color

          "&.Mui-selected": {
            backgroundColor:
              theme.palette.mode === "light" ? "#373F51" : "#58A4B0", // Light mode = dark gray, Dark mode = blue
            color: theme.palette.mode === "light" ? "#ffffff" : "#000000", // Active text color
          },
        }),
      },
    },
    // MuiListItemIcon: {
    //   styleOverrides: {
    //     root: {
    //       color: "#ffffff", // Default icon color
    //       "&:hover": {
    //         color: "#58A4B0", // Icon color on hover
    //       },
    //       "&.Mui-selected": {
    //         color: "#000000", // Icon color when selected
    //       },
    //     },
    //   },
    // },
  },
});

export default theme;
