import React, { useState, useMemo, useContext } from "react";
import { Typography } from "@mui/material";
import {
  MainContainer,
  ComparisonContainer,
  SlotContainer,
  UploadButton,
  StatRow,
  StatName,
  StatValue,
} from "./DpsCompare.styles";
import { CacheContext } from "../../contexts/CacheContext";
import { SHARED_STAT_INFO } from "../DpsCalc/DivineShard/DivineShardData";

// The calculation logic from useFinalStats.js, converted to a standalone function.
const calculateFinalStats = (dpsState, processedWeaponData) => {
  if (!dpsState) return null;

  let baseDps = 0;
  let totalMps = 0;
  let totalMpr = 0;
  let finalDamageMultiplier = 1; // 최종 대미지 배율 (기본 100%)
  let totalMaxMana = 0;

  const parseNumber = (str) => {
    if (!str) return 0;
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

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

  const cooldownMultiplier =
    1 - Math.min(acc.cooldownReductionPercent, 40) / 100;

  if (dpsState.specialWeapons) {
    const uniqueItems = {};
    dpsState.specialWeapons.forEach((item) => {
      if (!item.name) return;
      if (!uniqueItems[item.name] || item.enh > uniqueItems[item.name].enh) {
        uniqueItems[item.name] = item;
      }
    });

    const parseValue = (str) => {
      if (str === null || str === undefined) return null;
      if (typeof str === "number") return str;
      const num = parseFloat(str);
      return isNaN(num) ? null : num;
    };

    Object.values(uniqueItems).forEach((item) => {
      let { damage, hits, cooldown, mana, grade } = item;
      if (
        (damage === undefined || damage === null) &&
        Object.keys(processedWeaponData).length > 0
      ) {
        const weaponData = processedWeaponData[item.name];
        const weapon = weaponData?.byEnhancement[item.enh];
        if (weapon) {
          damage = weapon["피해량"];
          hits = weapon["타수"];
          cooldown = weapon["쿨타임"];
          mana = weapon["마나"];
          grade = weapon["등급"];
        }
      }
      const numDamage = parseValue(damage);
      const numHits = parseValue(hits);
      const numCooldown = parseValue(cooldown);
      const numMana = parseValue(mana);
      const totalDamage =
        numDamage !== null && numHits !== null ? numDamage * numHits : 0;
      const effectiveCooldown =
        numCooldown > 0 ? numCooldown * cooldownMultiplier : 0;
      const dps =
        totalDamage > 0 && effectiveCooldown > 0
          ? totalDamage / effectiveCooldown
          : 0;
      const mps =
        numMana > 0 && effectiveCooldown > 0 ? numMana / effectiveCooldown : 0;
      let weaponDamageMultiplier = 1 + acc.specialWeaponDamagePercent / 100;
      if (grade) {
        if (grade === "일반" || grade === "고급") {
          weaponDamageMultiplier += acc.commonAdvancedWeaponDamagePercent / 100;
        }
        if (grade === "희귀") {
          weaponDamageMultiplier += acc.rareWeaponDamagePercent / 100;
        }
        if (grade === "영웅") {
          weaponDamageMultiplier += acc.heroicWeaponDamagePercent / 100;
        }
        if (grade === "전설") {
          weaponDamageMultiplier += acc.legendaryWeaponDamagePercent / 100;
          weaponDamageMultiplier += acc.legendaryMortalWeaponDamagePercent / 100;
        }
        if (grade === "필멸") {
          weaponDamageMultiplier += acc.mortalWeaponDamagePercent / 100;
          weaponDamageMultiplier += acc.legendaryMortalWeaponDamagePercent / 100;
        }
        if (grade === "운명") {
          weaponDamageMultiplier += acc.destinyWeaponDamagePercent / 100;
        }
      }
      baseDps += dps * weaponDamageMultiplier;
      totalMps += mps;
    });
  }
  const {
    level = 1,
    moveSpeed = 0,
    statType = "attack",
    customAttack = 0,
    customHealth = 0,
  } = dpsState || {};
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
  damageBonusFromStats += acc.finalDamageStat * 0.65;
  damageBonusFromStats += acc.healthStat * 0.4;
  const guildState = dpsState.guild || {};
  const bondLevel = parseInt(guildState.atk_percent || 1, 10);
  const bondBonusPoints = Math.max(0, bondLevel - 1);
  damageBonusFromStats += bondBonusPoints * 1 * 0.65;
  damageBonusFromStats += bondBonusPoints * 1 * 0.4;
  let shardFinalDamagePercent = 0;
  let shardMaxManaFlat = 0;
  let shardManaRegenFlat = 0;
  if (dpsState.divineShard) {
    Object.values(dpsState.divineShard).forEach((shard) => {
      if (!shard.stats) return;
      shard.stats.forEach((level, index) => {
        if (level <= 0) return;
        const statInfo = SHARED_STAT_INFO[index];
        if (!statInfo) return;
        if (statInfo.name === "최종 데미지 증가") {
          shardFinalDamagePercent += statInfo.effects[0].values[level] || 0;
        } else if (statInfo.name === "최대 마나 & 마나 회복량 증가") {
          shardMaxManaFlat += statInfo.effects[0].values[level] || 0;
          shardManaRegenFlat += statInfo.effects[1].values[level] || 0;
        }
      });
    });
  }
  finalDamageMultiplier +=
    (damageBonusFromStats + shardFinalDamagePercent) / 100;
  const baseMaxManaFromLevel = 100 + Math.floor(safeLevel / 5) * 5;
  const manaRegenFromLevel = 4 + Math.floor(safeLevel / 5) * 0.05;
  totalMaxMana =
    (baseMaxManaFromLevel + acc.maxManaFlat + shardMaxManaFlat) *
    (1 + acc.maxManaPercent / 100);
  totalMpr =
    (manaRegenFromLevel + acc.manaRegenFlat + shardManaRegenFlat) *
    (1 + acc.manaRegenPercent / 100);
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
          damage += acc.classBasicAttackDamage;
          skillDps = damage / effectiveCooldown;
        } else {
          damage *= 1 + acc.classSkillDamagePercent / 100;
          skillDps = damage / effectiveCooldown;
        }
        baseDps += skillDps;
      }
    });
  }
  const finalDps = baseDps * finalDamageMultiplier;
  const totalDpsVsNormal =
    finalDps * (1 + acc.normalMonsterDamagePercent / 100);
  const totalDpsVsBoss = finalDps * (1 + acc.bossMonsterDamagePercent / 100);
  const totalDpmVsNormal = totalDpsVsNormal * 60;
  const totalDpmVsBoss = totalDpsVsBoss * 60;

  return {
    "DPS (일반)": totalDpsVsNormal,
    "DPS (보스)": totalDpsVsBoss,
    "DPM (일반)": totalDpmVsNormal,
    "DPM (보스)": totalDpmVsBoss,
    "최대 마나": totalMaxMana,
    "초당 마나 소모": totalMps,
    "초당 마나 회복": totalMpr,
  };
};

const StatDisplay = ({ title, stats, compareStats }) => {
  if (!stats) {
    return <Typography>JSON 파일을 업로드하세요.</Typography>;
  }

  return (
    <>
      <Typography variant="h6">{title}</Typography>
      {Object.entries(stats).map(([key, value]) => {
        const isHighlighted =
          compareStats &&
          typeof value === "number" &&
          value > (compareStats[key] || 0);
        return (
          <StatRow key={key}>
            <StatName variant="body1">{key}</StatName>
            <StatValue variant="body1" highlighted={isHighlighted}>
              {typeof value === "number" ? value.toFixed(2) : value}
            </StatValue>
          </StatRow>
        );
      })}
    </>
  );
};

const DpsCompare = () => {
  const { cache } = useContext(CacheContext);
  const { weapons: allWeaponsData } = cache;

  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);

  const processedWeaponData = useMemo(() => {
    if (!allWeaponsData) return {};
    const data = {};
    allWeaponsData.forEach((w) => {
      const name = w["이름"];
      if (!name) return;
      if (!data[name]) {
        data[name] = { enhancements: [], byEnhancement: {} };
      }
      const enh = parseInt(w["강화 차수"], 10);
      if (!isNaN(enh)) {
        data[name].enhancements.push(enh);
        data[name].byEnhancement[enh] = w;
      }
    });
    Object.values(data).forEach((entry) => {
      entry.enhancements.sort((a, b) => a - b);
    });
    return data;
  }, [allWeaponsData]);

  const statsA = useMemo(
    () => calculateFinalStats(slotA, processedWeaponData),
    [slotA, processedWeaponData]
  );
  const statsB = useMemo(
    () => calculateFinalStats(slotB, processedWeaponData),
    [slotB, processedWeaponData]
  );

  const handleFileUpload = (event, slotSetter) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        slotSetter(json);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("잘못된 형식의 파일입니다.");
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  return (
    <MainContainer>
      <Typography variant="h5" sx={{ mb: 2 }}>
        DPS 비교
      </Typography>
      <ComparisonContainer>
        <SlotContainer>
          <UploadButton
            variant="contained"
            component="label"
          >
            슬롯 A 파일 업로드
            <input
              type="file"
              hidden
              accept=".json"
              onChange={(e) => handleFileUpload(e, setSlotA)}
            />
          </UploadButton>
          <StatDisplay title="슬롯 A 결과" stats={statsA} compareStats={statsB} />
        </SlotContainer>
        <SlotContainer>
          <UploadButton
            variant="contained"
            component="label"
          >
            슬롯 B 파일 업로드
            <input
              type="file"
              hidden
              accept=".json"
              onChange={(e) => handleFileUpload(e, setSlotB)}
            />
          </UploadButton>
          <StatDisplay title="슬롯 B 결과" stats={statsB} compareStats={statsA} />
        </SlotContainer>
      </ComparisonContainer>
    </MainContainer>
  );
};

export default DpsCompare;
