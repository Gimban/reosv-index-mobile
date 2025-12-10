import { css } from "@emotion/react";

export const container = css`
  padding: 16px;
`;

export const gridContainer = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

export const card = (grade) => css`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  background-color: ${getCardColorByGrade(grade)};
  color: white;
  height: 190px;
  display: flex;
  flex-direction: column;
`;

export const cardImage = css`
  width: 100%;
  height: 120px;
  object-fit: contain;
  background-color: rgba(0, 0, 0, 0.1);
`;

export const cardContent = css`
  padding: 8px;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const weaponName = css`
  font-weight: bold;
`;

// 무기 등급에 따른 카드 배경색을 반환합니다.
// 시트의 "등급" 값에 따라 색상을 조정해야 할 수 있습니다.
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
