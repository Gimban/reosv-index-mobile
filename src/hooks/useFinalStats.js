import { useMemo } from "react";

export const useFinalStats = (dpsState, processedWeaponData) => {
  const finalStats = useMemo(() => {
    // 기본값 설정
    let baseDps = 0;
    let totalMps = 0; // Mana Per Second (consumption)
    let totalMpr = 0; // Mana Per Second (regeneration)
    let finalDamageMultiplier = 1; // 최종 대미지 배율 (기본 100%)

    // 1. 특수 무기 DPS 및 마나 소모 계산 (Base DPS)
    if (
      dpsState.specialWeapons &&
      Object.keys(processedWeaponData).length > 0
    ) {
      const calculateWeaponStats = (weaponName, enhancement) => {
        const weaponData = processedWeaponData[weaponName];
        if (!weaponData) return { dps: 0, mps: 0 };
        const weapon = weaponData.byEnhancement[enhancement];
        if (!weapon) return { dps: 0, mps: 0 };

        const parseValue = (str) => {
          if (!str) return null;
          const num = parseFloat(str);
          return isNaN(num) ? null : num;
        };

        const damage = parseValue(weapon["피해량"]);
        const hits = parseValue(weapon["타수"]);
        const cooldown = parseValue(weapon["쿨타임"]);
        const mana = parseValue(weapon["마나"]);
        const totalDamage =
          damage !== null && hits !== null ? damage * hits : 0;
        const dps =
          totalDamage > 0 && cooldown > 0 ? totalDamage / cooldown : 0;
        const mps = mana > 0 && cooldown > 0 ? mana / cooldown : 0;
        return { dps, mps };
      };

      const uniqueItems = {};
      dpsState.specialWeapons.forEach((item) => {
        if (!item.name) return;
        if (!uniqueItems[item.name] || item.enh > uniqueItems[item.name].enh) {
          uniqueItems[item.name] = item;
        }
      });

      Object.values(uniqueItems).forEach((item) => {
        const { dps, mps } = calculateWeaponStats(item.name, item.enh);
        baseDps += dps;
        totalMps += mps;
      });
    }

    // 2. 레벨 스탯 계산
    const {
      level = 1,
      moveSpeed = 0,
      statType = "attack",
      customAttack = 0,
      customHealth = 0,
    } = dpsState;

    const safeLevel = parseInt(level, 10) || 1;
    const totalPoints = Math.max(0, safeLevel - 1);
    const msPoints = parseInt(moveSpeed, 10) || 0;
    const customAtkPoints = parseInt(customAttack, 10) || 0;
    const customHpPoints = parseInt(customHealth, 10) || 0;

    let usedPoints = msPoints;
    if (statType === "custom") {
      usedPoints += customAtkPoints + customHpPoints;
    }

    const isOverLimit =
      statType === "custom" ? usedPoints > totalPoints : msPoints > totalPoints;

    let damageBonusFromStats = 0;
    if (!isOverLimit) {
      if (statType === "attack") {
        const remaining = Math.max(0, totalPoints - msPoints);
        damageBonusFromStats = remaining * 0.65;
      } else if (statType === "health") {
        const remaining = Math.max(0, totalPoints - msPoints);
        damageBonusFromStats = remaining * 0.4;
      } else if (statType === "custom") {
        damageBonusFromStats = customAtkPoints * 0.65 + customHpPoints * 0.4;
      }
    }

    // 최종 대미지 배율에 합산 (e.g., 10% 보너스 -> 1.1 곱하기)
    finalDamageMultiplier += damageBonusFromStats / 100;

    // 마나 회복량 계산
    const manaRegenFromLevel = 4 + Math.floor(safeLevel / 5) * 0.05;
    totalMpr += manaRegenFromLevel;

    // TODO: 클래스, 장신구, 디바인, 길드 스탯 계산 추가

    // 최종 DPS 계산 (모든 배율 적용)
    const finalDps = baseDps * finalDamageMultiplier;

    return {
      totalDps: finalDps,
      totalDpm: finalDps * 60,
      totalMps,
      totalMpr,
    };
  }, [dpsState, processedWeaponData]);

  return finalStats;
};
