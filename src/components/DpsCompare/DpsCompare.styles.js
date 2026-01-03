import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button } from "@mui/material";

export const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export const ComparisonContainer = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const SlotContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const StatRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 0",
});

export const StatName = styled(Typography)({
  fontWeight: "bold",
});

export const StatValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "highlighted",
})(({ theme, highlighted }) => ({
  fontWeight: highlighted ? "bold" : "normal",
  color: highlighted ? theme.palette.success.main : "inherit",
  transition: "all 0.3s ease-in-out",
}));
