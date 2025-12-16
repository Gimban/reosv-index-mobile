import { getCardColorByGrade } from "../../utils/gradeColor";

export const container = {
  padding: 2,
};

export const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 2,
};

export const card = (grade) => (theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  overflow: "hidden",
  textAlign: "center",
  backgroundColor: getCardColorByGrade(grade),
  color: "white",
  height: "190px",
  display: "flex",
  flexDirection: "column",
});

export const cardImage = {
  width: "100%",
  height: "120px",
  objectFit: "contain",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
};

export const cardContent = {
  padding: 1,
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const weaponName = {
  fontWeight: "bold",
};
