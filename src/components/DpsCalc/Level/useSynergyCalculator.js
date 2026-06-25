import { useState, useEffect, useMemo } from "react";
import { calculateSynergies } from "../../../utils/synergyUtils";

/**
 * 플레이어 스탯을 기반으로 시너지 보너스를 계산하는 Hook
 * @param {Object} stats - { str, spd, vit } 형태의 스탯 객체
 */
export const useSynergyCalculator = (stats, isSynergyMultiplierEnabled = false) => {
  const [synergyDefinitions, setSynergyDefinitions] = useState({
    single: [],
    dual: [],
    triple: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSynergyData = async () => {
      try {
        const publicUrl = process.env.PUBLIC_URL || "";

        // public/data/ 폴더에 JSON 파일이 있다고 가정합니다.
        const [singleRes, dualRes, tripleRes] = await Promise.all([
          fetch(`${publicUrl}/data/single_synergy.json`),
          fetch(`${publicUrl}/data/dual_synergy.json`),
          fetch(`${publicUrl}/data/triple_synergy.json`),
        ]);

        // 응답 상태 확인
        if (!singleRes.ok || !dualRes.ok || !tripleRes.ok) {
          const failed = [];
          if (!singleRes.ok) failed.push("single_synergy.json");
          if (!dualRes.ok) failed.push("dual_synergy.json");
          if (!tripleRes.ok) failed.push("triple_synergy.json");

          throw new Error(
            `파일을 찾을 수 없습니다: ${failed.join(", ")} (Status: ${singleRes.status})`,
          );
        }

        // JSON 형식인지 추가 확인 (HTML이 반환되는 것 방지)
        const isJson = (res) =>
          res.headers.get("content-type")?.includes("application/json");

        if (!isJson(singleRes) || !isJson(dualRes) || !isJson(tripleRes)) {
          throw new Error(
            "서버에서 JSON 대신 HTML 형식이 반환되었습니다. public/data/ 내에 파일이 있는지 확인해주세요.",
          );
        }

        const [single, dual, triple] = await Promise.all([
          singleRes.json(),
          dualRes.json(),
          tripleRes.json(),
        ]);

        setSynergyDefinitions({ single, dual, triple });
      } catch (error) {
        console.error("시너지 데이터 로딩에 실패했습니다:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSynergyData();
  }, []); // 컴포넌트 마운트 시 1회만 실행

  const synergies = useMemo(() => {
    if (isLoading) {
      return {
        bonuses: {},
        activeSynergies: [],
      };
    }
    const safeStats = {
      str: Number(stats.str) || 0,
      spd: Number(stats.spd) || 0,
      vit: Number(stats.vit) || 0,
    };

    const result = calculateSynergies(safeStats, synergyDefinitions);
    const multiplier = isSynergyMultiplierEnabled ? 1.5 : 1;

    const multipliedTotals = {};
    Object.entries(result.totals).forEach(([key, val]) => {
      multipliedTotals[key] = val * multiplier;
    });

    const multipliedActiveSynergies = (result.activeSynergies || []).map((syn) => ({
      ...syn,
      effects: (syn.effects || []).map((eff) => ({
        ...eff,
        value: eff.value * multiplier,
      })),
    }));

    return {
      bonuses: multipliedTotals,
      activeSynergies: multipliedActiveSynergies,
    };
  }, [stats.str, stats.spd, stats.vit, synergyDefinitions, isLoading, isSynergyMultiplierEnabled]);

  return synergies;
};
