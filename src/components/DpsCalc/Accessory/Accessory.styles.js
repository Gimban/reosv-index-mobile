export const container = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  p: 2,
};

export const loadingContainer = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "50vh",
};

export const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 1,
};

export const title = {
  fontWeight: "bold",
};

export const slotsContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const slotItem = {
  p: 1.5,
  display: "flex",
  flexDirection: "column",
};

export const slotHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  p: 0.5,
  borderRadius: 1,
  "&:hover": {
    bgcolor: "action.hover",
  },
};

export const optionsContainer = {
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  width: "100%",
  pt: 1.5,
};

export const optionRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const dpsOptionLabel = {
  fontWeight: "bold",
  color: "primary.main",
};

export const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  maxHeight: "80vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  overflowY: "auto",
  borderRadius: 2,
};

export const modalGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
  gap: 2,
};

export const modalItemCard = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

export const modalItemImage = {
  height: 100,
  objectFit: "contain",
  p: 1,
};

export const modalItemName = {
  textAlign: "center",
  fontSize: "0.875rem",
  p: 1,
};

export const selectedItemImage = {
  width: 50,
  height: 50,
  objectFit: "contain",
  mr: 2,
};
