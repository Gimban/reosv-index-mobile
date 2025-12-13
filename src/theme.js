import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#3b82f6" },
    background: { default: "#fff", paper: "#fff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: [
      '-apple-system','BlinkMacSystemFont','Segoe UI','Roboto','Noto Sans KR',
      'Apple SD Gothic Neo','Helvetica Neue','Arial','sans-serif'
    ].join(','),
    body1: { fontSize: "0.95rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
  },
  components: {
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingInline: 16,
          textTransform: "none",
          borderRadius: 12,
        },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiListItemButton: { styleOverrides: { root: { minHeight: 48 } } },
    MuiBottomNavigationAction: {
      styleOverrides: { root: { paddingTop: 8, paddingBottom: 8 } },
    },
    MuiAppBar: {
      defaultProps: { color: "inherit", elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiPaper: { styleOverrides: { root: { boxShadow: "0 4px 20px rgba(0,0,0,0.06)" } } },
  },
});

export default theme;
