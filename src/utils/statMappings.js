// src/utils/statMappings.js

// 내부 로직용 키(Key) -> 화면 표시용 텍스트(Label) 매핑
export const STAT_MAPPINGS = {
  finalDamagePercent: "최종 데미지 증가 %",
  classBasicAttackDamage: "클래스 기본 공격 데미지 증가 +",
  classBasicAttackPercent: "클래스 기본 공격 데미지 증가 %",
  classSkillDamagePercent: "클래스 스킬 데미지 증가 %",
  cooldownReductionPercent: "스킬 쿨타임 감소 %",
  moveSpeed: "이동 속도 증가 +",
  maxHealthPercent: "최대 체력 증가 %",
  bossMonsterDamagePercent: "보스 공격 시 대상 데미지 증가 %",
  normalMonsterDamagePercent: "일반 몬스터 대상 데미지 증가 %",
  specialWeaponDamagePercent: "특수 무기 데미지 증가 %",
  commonAdvancedWeaponDamagePercent: "일반&고급 등급 무기 데미지 증가 %",
  rareWeaponDamagePercent: "희귀 등급 무기 데미지 증가 %",
  heroicWeaponDamagePercent: "영웅 등급 무기 데미지 증가 %",
  legendaryWeaponDamagePercent: "전설 등급 무기 데미지 증가 %",
  legendaryMortalWeaponDamagePercent: "전설&필멸 등급 무기 데미지 증가 %",
  mortalWeaponDamagePercent: "필멸 등급 무기 데미지 증가 %",
  mythicWeaponDamagePercent: "신화 등급 무기 데미지 증가 %",
  legendaryMythicWeaponDamagePercent: "전설&신화 등급 무기 데미지 증가 %",
  mortalMythicWeaponDamagePercent: "필멸&신화 등급 무기 데미지 증가 %",
  destinyWeaponDamagePercent: "운명 등급 무기 데미지 증가 %",
  maxManaFlat: "최대 마나 증가 +",
  maxManaPercent: "최대 마나 증가 %",
  manaRegenFlat: "마나 회복량 증가 +",
  manaRegenPercent: "마나 회복량 증가 %",
  damageReductionPercent: "받는 피해량 감소 %",
  criticalRate: "치명타 확률 %",
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
