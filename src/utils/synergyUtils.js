import { getInternalKey } from "./statMappings";

/**
 * 조합 시너지 조건 충족 여부 확인
 * 모든 요구 스탯이 최소 기준치를 넘어야 함
 */
export const checkRequirements = (stats, requirements) => {
  return Object.entries(requirements).every(([statKey, minVal]) => {
    return (stats[statKey] || 0) >= minVal;
  });
};

/**
 * 전체 시너지 계산 메인 함수
 * 단일/조합 시너지를 모두 계산하여 합산된 결과를 반환
 */
export const calculateSynergies = (stats, definitions) => {
  const { single = [], dual = [], triple = [] } = definitions;
  const totals = {};

  const add = (key, val) => {
    const internalKey = getInternalKey(key); // 한글 키가 들어오면 영문 키로 변환
    totals[internalKey] = (totals[internalKey] || 0) + val;
  };

  // 1. 단일 스탯 시너지 (계단식 누적형)
  // 예: 힘 10 달성 시 +2, 20 달성 시 +4가 추가되어 총 +6
  single.forEach(({ stat, tiers = [] }) => {
    const statVal = stats[stat] || 0;
    tiers.forEach(({ threshold, effects = [] }) => {
      if (statVal >= threshold) {
        effects.forEach(({ key, value }) => add(key, value));
      }
    });
  });

  // 2. 다중 스탯 시너지 (계단식 누적형)
  [...dual, ...triple].forEach(({ tiers = [] }) => {
    tiers.forEach(({ req, effects = [] }) => {
      if (checkRequirements(stats, req)) {
        effects.forEach(({ key, value }) => add(key, value));
      }
    });
  });

  return totals;
};
