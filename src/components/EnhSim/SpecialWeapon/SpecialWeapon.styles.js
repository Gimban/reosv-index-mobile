import { getCardColorByGrade } from "../../../utils/gradeColor";

export const selectedWeaponPaper = {
  p: 2,
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const weaponImage = {
  width: 80,
  height: 80,
  objectFit: "contain",
  backgroundColor: "rgba(0,0,0,0.05)",
  borderRadius: 1,
};

export const weaponName = {
  fontWeight: "bold",
};

export const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 500,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
  maxHeight: "80vh",
  overflowY: "auto",
};

export const modalGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 1,
};

export const modalWeaponCard = (grade) => ({
  border: "1px solid #ddd",
  textAlign: "center",
  backgroundColor: getCardColorByGrade(grade),
  color: "white",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
});

export const modalWeaponImage = {
  width: "100%",
  height: 60,
  objectFit: "contain",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
};

export const modalWeaponName = {
  fontSize: "0.75rem",
  p: 1,
};
