export const getCardColorByGrade = (grade) => {
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
