import React, { createContext, useState, useMemo } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import baseTheme from "../theme";

export const ThemeContext = createContext({
  mode: "dark",
  toggleTheme: () => {},
});

const getDesignTokens = (mode) => ({
  ...baseTheme,
  palette: {
    mode,
    primary: baseTheme.palette.primary,
    ...(mode === "light"
      ? {
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
        }
      : {
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
        }),
  },
});

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  const themeValue = useMemo(
    () => ({
      toggleTheme: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode,
    }),
    [mode]
  );

  const themeWithMode = useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  return (
    <ThemeContext.Provider value={themeValue}>
      <MuiThemeProvider theme={themeWithMode}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
