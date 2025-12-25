import React, { createContext, useState, useEffect, useContext } from "react";

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

  const updateDpsState = (key, value) => {
    setDpsState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <DpsCalcContext.Provider value={{ dpsState, updateDpsState }}>
      {children}
    </DpsCalcContext.Provider>
  );
};
