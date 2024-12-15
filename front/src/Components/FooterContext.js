import React, { createContext, useState, useContext } from "react";

const FooterContext = createContext();

export const FooterProvider = ({ children }) => {
  const [activeFooter, setActiveFooter] = useState("home"); // Default active

  return (
    <FooterContext.Provider value={{ activeFooter, setActiveFooter }}>
      {children}
    </FooterContext.Provider>
  );
};

export const useFooter = () => useContext(FooterContext);
