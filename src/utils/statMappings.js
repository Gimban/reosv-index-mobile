// src/utils/statMappings.js

// 내부 로직용 키(Key) -> 화면 표시용 텍스트(Label) 매핑
export const STAT_MAPPINGS = {
  finalDamagePercent: "최종 데미지 증가",
  basicAttackFlat: "클래스 기본 공격 데미지 증가 (+)",
  basicAttackPercent: "클래스 기본 공격 데미지 증가 (%)",
  skillDamagePercent: "클래스 스킬 데미지 증가",
  cooldownReduction: "쿨타임 감소",
  moveSpeed: "이동 속도",
  maxHealthPercent: "최대 체력",
};

// 화면 표시용 텍스트(Label) -> 내부 로직용 키(Key) 역매핑 생성
// 예: "최종 데미지 증가" -> "finalDamagePercent"
export const REVERSE_STAT_MAPPINGS = Object.fromEntries(
  Object.entries(STAT_MAPPINGS).map(([key, value]) => [value, key]),
);

/**
 * 입력된 키를 내부 로직용 영문 키로 변환합니다.
 * 이미 영문 키라면 그대로 반환하고, 한글 키라면 매핑된 영문 키를 반환합니다.
 */
export const getInternalKey = (key) => REVERSE_STAT_MAPPINGS[key] || key;

/**
 * 입력된 키를 화면 표시용 텍스트로 변환합니다.
 */
export const getDisplayName = (key) => STAT_MAPPINGS[key] || key;
