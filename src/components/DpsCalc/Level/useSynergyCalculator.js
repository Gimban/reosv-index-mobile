import { useState, useEffect, useMemo } from "react";
import { calculateSynergies } from "../../../utils/synergyUtils";

/**
 * 플레이어 스탯을 기반으로 시너지 보너스를 계산하는 Hook
 * @param {Object} stats - { str, spd, vit } 형태의 스탯 객체
 */
export const useSynergyCalculator = (stats) => {
  const [synergyDefinitions, setSynergyDefinitions] = useState({
    single: [],
    dual: [],
    triple: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSynergyData = async () => {
      try {
        // public/data/ 폴더에 JSON 파일이 있다고 가정합니다.
        const [singleRes, dualRes, tripleRes] = await Promise.all([
          fetch("/data/single_synergy.json"),
          fetch("/data/dual_synergy.json"),
          fetch("/data/triple_synergy.json"),
        ]);

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
      return {}; // 데이터 로딩 중에는 빈 객체 반환
    }
    const safeStats = {
      str: Number(stats.str) || 0,
      spd: Number(stats.spd) || 0,
      vit: Number(stats.vit) || 0,
    };

    return calculateSynergies(safeStats, synergyDefinitions);
  }, [stats.str, stats.spd, stats.vit, synergyDefinitions, isLoading]);

  return synergies;
};
