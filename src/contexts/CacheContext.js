import React, { createContext, useState } from "react";

// 캐시 데이터를 저장하고 관리할 Context를 생성합니다.
export const CacheContext = createContext();

// Context를 앱에 제공할 Provider 컴포넌트입니다.
export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  // 캐시에 새로운 값을 저장하는 함수입니다.
  // 예: setCacheValue('weapons', weaponData);
  const setCacheValue = (key, value) => {
    setCache((prevCache) => ({
      ...prevCache,
      [key]: value,
    }));
  };

  return (
    <CacheContext.Provider value={{ cache, setCacheValue }}>
      {children}
    </CacheContext.Provider>
  );
};
