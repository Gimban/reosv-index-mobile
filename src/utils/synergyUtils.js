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
  const activeSynergies = [];

  const addGlobal = (key, val) => {
    const internalKey = getInternalKey(key); // 한글 키가 들어오면 영문 키로 변환
    totals[internalKey] = (totals[internalKey] || 0) + val;
  };

  // 1. 단일 스탯 시너지 (계단식 누적형)
  single.forEach(({ name, stat, tiers = [] }) => {
    const statVal = stats[stat] || 0;
    let lastTier = 0;
    const synergyTotals = {};

    tiers.forEach((tier, index) => {
      if (statVal >= tier.threshold) {
        lastTier = index + 1;
        tier.effects.forEach(({ key, value }) => {
          synergyTotals[key] = (synergyTotals[key] || 0) + value;
          addGlobal(key, value);
        });
      }
    });

    if (lastTier > 0) {
      activeSynergies.push({
        name,
        tier: lastTier,
        effects: Object.entries(synergyTotals).map(([key, value]) => ({
          key,
          value,
        })),
      });
    }
  });

  // 2. 다중 스탯 시너지 (계단식 누적형)
  [...dual, ...triple].forEach(({ name, tiers = [] }) => {
    let lastTier = 0;
    const synergyTotals = {};

    tiers.forEach((tier, index) => {
      if (checkRequirements(stats, tier.req)) {
        lastTier = index + 1;
        tier.effects.forEach(({ key, value }) => {
          synergyTotals[key] = (synergyTotals[key] || 0) + value;
          addGlobal(key, value);
        });
      }
    });

    if (lastTier > 0) {
      activeSynergies.push({
        name,
        tier: lastTier,
        effects: Object.entries(synergyTotals).map(([key, value]) => ({
          key,
          value,
        })),
      });
    }
  });

  return { totals, activeSynergies };
};
