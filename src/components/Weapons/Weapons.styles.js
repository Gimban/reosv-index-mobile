// 무기 등급에 따른 카드 배경색을 반환합니다.
const getCardColorByGrade = (grade) => {
  switch (grade) {
    case "필멸":
      return "#d32f2f"; // 빨간색 계열
    case "전설":
      return "#fbc02d"; // 노란색 계열
    case "영웅":
      return "#9c27b0"; // 보라색 계열
    case "운명":
      return "#1565c0"; // 어두운 파란색 계열
    case "희귀":
      return "#1976d2"; // 파란색 계열
    case "고급":
      return "#388e3c"; // 녹색 계열
    case "보스":
      return "#ffb6c1"; // 연분홍색 계열
    case "기타":
      return "#66cdaa"; // 민트색 계열
    case "일반":
    default:
      return "#616161"; // 회색 계열
  }
};

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
