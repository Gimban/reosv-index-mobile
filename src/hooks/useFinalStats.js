import { useMemo } from "react";

export const useFinalStats = (dpsState, processedWeaponData) => {
  const finalStats = useMemo(() => {
    // 기본값 설정
    let baseDps = 0;
    let totalMps = 0;
    let totalMpr = 0;
    let finalDamageMultiplier = 1; // 최종 대미지 배율 (기본 100%)
    let totalMaxMana = 0;

    // 숫자 파싱 헬퍼 함수
    const parseNumber = (str) => {
      if (!str) return 0;
      const num = parseFloat(str);
      return isNaN(num) ? 0 : num;
    };

    // 장신구 옵션 처리
    const accessoryStats = dpsState.accessories?.totalStats || {};
    const getStat = (name) => parseNumber(accessoryStats[name]);

    const acc = {
      classBasicAttackDamage: getStat("클래스 기본 공격 데미지 증가 +"),
      classSkillDamagePercent: getStat("클래스 스킬 데미지 증가 %"),
      finalDamageStat: getStat("최종 데미지 스탯 증가 +"),
      healthStat: getStat("체력 스탯 증가 +"),
      normalMonsterDamagePercent: getStat("일반 몬스터 대상 데미지 증가 %"),
      bossMonsterDamagePercent: getStat("보스 공격 시 대상 데미지 증가 %"),
      cooldownReductionPercent: getStat("스킬 쿨타임 감소 %"),
      specialWeaponDamagePercent: getStat("특수 무기 데미지 증가 %"),
      commonAdvancedWeaponDamagePercent: getStat(
        "일반&고급 등급 무기 데미지 증가 %"
      ),
      rareWeaponDamagePercent: getStat("희귀 등급 무기 데미지 증가 %"),
      heroicWeaponDamagePercent: getStat("영웅 등급 무기 데미지 증가 %"),
      legendaryWeaponDamagePercent: getStat("전설 등급 무기 데미지 증가 %"),
      legendaryMortalWeaponDamagePercent: getStat(
        "전설&필멸 등급 무기 데미지 증가 %"
      ),
      mortalWeaponDamagePercent: getStat("필멸 등급 무기 데미지 증가 %"),
      destinyWeaponDamagePercent: getStat("운명 등급 무기 데미지 증가 %"),
      maxManaFlat: getStat("최대 마나 증가 +"),
      maxManaPercent: getStat("최대 마나 증가 %"),
      manaRegenFlat: getStat("마나 회복량 증가 +"),
      manaRegenPercent: getStat("마나 회복량 증가 %"),
    };

    // 7. 스킬 쿨타임 감소
    const cooldownMultiplier =
      1 - Math.min(acc.cooldownReductionPercent, 40) / 100;

    // 1. 특수 무기 DPS 및 마나 소모 계산 (Base DPS)
    if (
      dpsState.specialWeapons &&
      Object.keys(processedWeaponData).length > 0
    ) {
      const calculateWeaponStats = (weaponName, enhancement) => {
        const weaponData = processedWeaponData[weaponName];
        if (!weaponData) return { dps: 0, mps: 0, grade: null };
        const weapon = weaponData.byEnhancement[enhancement];
        if (!weapon) return { dps: 0, mps: 0, grade: null };

        const parseValue = (str) => {
          if (!str) return null;
          const num = parseFloat(str);
          return isNaN(num) ? null : num;
        };

        const damage = parseValue(weapon["피해량"]);
        const hits = parseValue(weapon["타수"]);
        const cooldown = parseValue(weapon["쿨타임"]);
        const mana = parseValue(weapon["마나"]);
        const grade = weapon["등급"];

        const totalDamage =
          damage !== null && hits !== null ? damage * hits : 0;

        const effectiveCooldown =
          cooldown > 0 ? cooldown * cooldownMultiplier : 0;

        const dps =
          totalDamage > 0 && effectiveCooldown > 0
            ? totalDamage / effectiveCooldown
            : 0;
        const mps =
          mana > 0 && effectiveCooldown > 0 ? mana / effectiveCooldown : 0;
        return { dps, mps, grade };
      };

      const uniqueItems = {};
      dpsState.specialWeapons.forEach((item) => {
        if (!item.name) return;
        if (!uniqueItems[item.name] || item.enh > uniqueItems[item.name].enh) {
          uniqueItems[item.name] = item;
        }
      });

      Object.values(uniqueItems).forEach((item) => {
        const { dps, mps, grade } = calculateWeaponStats(item.name, item.enh);

        let weaponDamageMultiplier = 1 + acc.specialWeaponDamagePercent / 100;

        if (grade) {
          if (grade === "일반" || grade === "고급") {
            weaponDamageMultiplier +=
              acc.commonAdvancedWeaponDamagePercent / 100;
          }
          if (grade === "희귀") {
            weaponDamageMultiplier += acc.rareWeaponDamagePercent / 100;
          }
          if (grade === "영웅") {
            weaponDamageMultiplier += acc.heroicWeaponDamagePercent / 100;
          }
          if (grade === "전설") {
            weaponDamageMultiplier += acc.legendaryWeaponDamagePercent / 100;
            weaponDamageMultiplier +=
              acc.legendaryMortalWeaponDamagePercent / 100;
          }
          if (grade === "필멸") {
            weaponDamageMultiplier += acc.mortalWeaponDamagePercent / 100;
            weaponDamageMultiplier +=
              acc.legendaryMortalWeaponDamagePercent / 100;
          }
          if (grade === "운명") {
            weaponDamageMultiplier += acc.destinyWeaponDamagePercent / 100;
          }
        }

        baseDps += dps * weaponDamageMultiplier;
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
    } = dpsState.level || {};

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

    // 장신구 스탯 보너스 추가 (3, 4)
    damageBonusFromStats += acc.finalDamageStat * 0.65;
    damageBonusFromStats += acc.healthStat * 0.4;

    // 최종 대미지 배율에 합산
    finalDamageMultiplier += damageBonusFromStats / 100;

    // 마나 계산
    // 최대 마나: 기본 100, 5레벨마다 5 증가
    const baseMaxManaFromLevel = 100 + Math.floor(safeLevel / 5) * 5;
    // 마나 회복량: 기본 4, 5레벨마다 0.05 증가
    const manaRegenFromLevel = 4 + Math.floor(safeLevel / 5) * 0.05;

    totalMaxMana =
      (baseMaxManaFromLevel + acc.maxManaFlat) * (1 + acc.maxManaPercent / 100);
    totalMpr =
      (manaRegenFromLevel + acc.manaRegenFlat) *
      (1 + acc.manaRegenPercent / 100);

    // 3. 클래스 스탯 계산
    if (dpsState.classStats) {
      const { classStats } = dpsState;
      const skills = [
        { name: "좌클릭", damageKey: "좌클릭 피해량", cdKey: "좌클릭 쿨타임" },
        { name: "우클릭", damageKey: "우클릭 피해량", cdKey: "우클릭 쿨타임" },
        {
          name: "쉬프트 좌클릭",
          damageKey: "쉬프트 좌클릭 피해량",
          cdKey: "쉬프트 좌클릭 쿨타임",
        },
        {
          name: "쉬프트 우클릭",
          damageKey: "쉬프트 우클릭 피해량",
          cdKey: "쉬프트 우클릭 쿨타임",
        },
      ];

      skills.forEach((skill) => {
        let damage = parseNumber(classStats[skill.damageKey]);
        const cooldown = parseNumber(classStats[skill.cdKey]);
        const effectiveCooldown =
          cooldown > 0 ? cooldown * cooldownMultiplier : 0;

        if (damage > 0 && effectiveCooldown > 0) {
          let skillDps = 0;
          if (skill.name === "좌클릭") {
            // 1. 클래스 기본 공격 데미지 증가
            damage += acc.classBasicAttackDamage;
            skillDps = damage / effectiveCooldown;
          } else {
            // 2. 클래스 스킬 데미지 증가
            damage *= 1 + acc.classSkillDamagePercent / 100;
            skillDps = damage / effectiveCooldown;
          }
          baseDps += skillDps;
        }
      });
    }

    // TODO: 장신구, 디바인, 길드 스탯 계산 추가

    // 최종 DPS 계산 (모든 배율 적용)
    const finalDps = baseDps * finalDamageMultiplier;

    const totalDpsVsNormal =
      finalDps * (1 + acc.normalMonsterDamagePercent / 100);
    const totalDpsVsBoss = finalDps * (1 + acc.bossMonsterDamagePercent / 100);

    return {
      totalDps: finalDps,
      totalDpsVsNormal,
      totalDpsVsBoss,
      totalDpm: finalDps * 60,
      totalMps,
      totalMpr,
      totalMaxMana,
    };
  }, [dpsState, processedWeaponData]);

  return finalStats;
};
