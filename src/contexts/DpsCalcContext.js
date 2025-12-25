import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";

const DpsCalcContext = createContext();

export const useDpsCalc = () => {
  const context = useContext(DpsCalcContext);
  if (!context) {
    throw new Error("useDpsCalc must be used within a DpsCalcProvider");
  }
  return context;
};

export const DpsCalcProvider = ({ children }) => {
  const [dpsState, setDpsState] = useState(() => {
    try {
      const stored = sessionStorage.getItem("dpsCalcState");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error("Failed to load DPS Calc state", error);
      return {};
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("dpsCalcState", JSON.stringify(dpsState));
    } catch (error) {
      console.error("Failed to save DPS Calc state", error);
    }
  }, [dpsState]);

  // useCallback으로 함수를 감싸줍니다.
  // 의존성 배열이 비어있으므로, 이 함수는 컴포넌트가 처음 렌더링될 때 단 한 번만 생성됩니다.
  const updateDpsState = useCallback((key, value) => {
    setDpsState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  }, []); // <-- 빈 의존성 배열

  return (
    <DpsCalcContext.Provider value={{ dpsState, updateDpsState }}>
      {children}
    </DpsCalcContext.Provider>
  );
};
