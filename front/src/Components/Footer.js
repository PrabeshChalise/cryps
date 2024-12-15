import React from "react";
import { useFooter } from "./FooterContext"; // Adjust path as necessary
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const { activeFooter, setActiveFooter } = useFooter();
  const navigate = useNavigate();

  const handleFooterClick = (route) => {
    setActiveFooter(route); // Update active footer
    navigate(route); // Navigate to the selected route
  };

  return (
    <div className="footer-nav">
      <ul className="footer-icons">
        <li
          className={activeFooter === "/" ? "active" : ""}
          onClick={() => handleFooterClick("/")}
        >
          <i className="fas fa-home"></i>
          <span>Home</span>
        </li>
        <li
          className={activeFooter === "/tradepage" ? "active" : ""}
          onClick={() => handleFooterClick("/tradepage")}
        >
          <i className="fas fa-exchange-alt"></i>
          <span>Trade</span>
        </li>
        <li
          className={activeFooter === "/result" ? "active" : ""}
          onClick={() => handleFooterClick("/result")}
        >
          <i className="fas fa-chart-line"></i>
          <span>Result</span>
        </li>
        <li
          className={activeFooter === "/wallet" ? "active" : ""}
          onClick={() => handleFooterClick("/wallet")}
        >
          <i className="fas fa-wallet"></i>
          <span>Wallet</span>
        </li>
      </ul>
    </div>
  );
};

export default Footer;
