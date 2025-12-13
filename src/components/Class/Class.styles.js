const getCardColorByClassName = (className) => {
  // TODO: 실제 클래스 이름에 맞게 case를 수정하거나 추가해주세요.
  switch (className) {
    case "블레이드":
      return "#d32f2f"; // 빨간색 계열
    case "워리어":
      return "#fbc02d"; // 노란색 계열
    case "메이지":
      return "#9c27b0"; // 보라색 계열
    case "프로스트":
      return "#1565c0"; // 어두운 파란색 계열
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

export const card = (className) => (theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  overflow: "hidden",
  textAlign: "center",
  backgroundColor: "#424242", // 이름 부분의 배경색
  color: "white",
  height: "190px",
  display: "flex",
  flexDirection: "column",
});

export const cardImage = (className) => ({
  width: "100%",
  height: "120px",
  objectFit: "contain",
  // 이미지 영역에만 그라데이션 적용
  background: `radial-gradient(circle, #424242, ${getCardColorByClassName(
    className
  )} 150%)`,
});

export const cardContent = {
  padding: 1,
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const className = {
  fontWeight: "bold",
};
