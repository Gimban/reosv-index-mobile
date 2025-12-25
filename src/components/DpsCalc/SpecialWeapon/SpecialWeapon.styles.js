export const container = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

export const itemPaper = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

export const itemHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const statsBox = {
  mt: "12px",
  p: "8px",
  backgroundColor: (theme) => theme.palette.background.default,
  borderRadius: "4px",
  display: "flex",
  justifyContent: "space-around",
};

export const totalStatsPaper = {
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  backgroundColor: "primary.main",
  color: "primary.contrastText",
};
