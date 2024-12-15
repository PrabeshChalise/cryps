import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Home from "./Components/Home";
import Details from "./Components/CoinDetails/Graph";
import Buy from "./Components/Market";
import "./App.css";
import LoginModal from "./Components/LoginModal";
import Nav from "./Components/Nav";
import Signup from "./Components/Signup";
import PredictionForm from "./Components/PredictionForm";
import Trade from "./Components/Trade";
import Result from "./Components/Result";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminTradeControl from "./Admin/AdminTradeControl";
import WalletDashboard from "./wallet/WalletDashboard";
import AdminDepositApproval from "./Admin/AdminDepositApproval";
import AdminSendApproval from "./Admin/AdminSendApproval";
import TradePage from "./Components/TradePage";
import PredictionDetails from "./Components/PredictionDetails";
import Settings from "./Components/Settings";
import Terms from "./Components/Terms";
import Transactions from "./Components/Transactions";
import TransactionDetails from "./Components/TransactionDetails";
import AdminKyc from "./Components/AdminKyc";
import { ThemeProvider } from "./ThemeContext"; // Import ThemeProvider
import LoginAgent from "./Agent/LoginAgent";
import SignupAgent from "./Agent/SignupAgent";
import AdminAgentApproval from "./Admin/AdminAgentApproval";
import ProfitStatistics from "./Components/ProfitStatistics";
import AgentDashboard from "./Agent/AgentDashboard";
import HelpLoan from "./Components/HelpLoan";
import ContactUs from "./Components/ContactUs";
import MasterAdminDashboard from "./MasterAdmin/MasterAdminDashboard";
import AdminLogin from "./Admin/AdminLogin";
import AdminSignup from "./Admin/AdminSignup";
import PrivateRouteAdmin from "./Admin/PrivateRouteAdmin"; // Import the PrivateRoute component
import PrivateRouteAgent from "./Agent/PrivateRouteAgent";
import PrivateRouteMasterAdmin from "./MasterAdmin/PrivateRouteMasterAdmin";
import MasterAdminLogin from "./MasterAdmin/MasterAdminLogin";
import MasterAdminSignup from "./MasterAdmin/MasterAdminSignup";
import ClientContact from "./Components/ClientContact";
import { FooterProvider } from "./Components/FooterContext";
const AppContent = () => {
  const [open, setOpen] = useState(false);
  const [opensign, setOpensign] = useState(false);
  const location = useLocation();
  const pathsWithNav = [
    "/dashboard",
    "/transactionSell",
    "/coin",
    "/market",
    "/tradeCoin",
    "/dashboard",
    "/profileUpdate",
  ];

  return (
    <>
      {open && <LoginModal closemod={[setOpen, setOpensign]} />}
      {opensign && <Signup closemod={[setOpen, setOpensign]} />}
      {pathsWithNav.includes(location.pathname) && (
        <Nav open={[setOpen, setOpensign]} />
      )}
      <div>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/wallet" element={<WalletDashboard />} />
          <Route
            exact
            path="/coin"
            element={<Details open={[setOpen, setOpensign]} />}
          />
          <Route
            exact
            path="/tradeCoin"
            element={<Details open={[setOpen, setOpensign]} />}
          />
          <Route exact path="/market" element={<Buy />} />
          <Route exact path="/trades" element={<PredictionForm />} />
          <Route exact path="/trade" element={<Trade />} />
          <Route exact path="/result" element={<Result />} />
          <Route
            path="/nimda21/*"
            element={
              <PrivateRouteAdmin>
                <AdminDashboard />
              </PrivateRouteAdmin>
            }
          />{" "}
          <Route path="/tradepage" element={<TradePage />} />
          <Route path="/tradeControl" element={<AdminTradeControl />} />
          <Route path="/viewRequests" element={<AdminDepositApproval />} />
          <Route path="/viewSend" element={<AdminSendApproval />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/transaction" element={<Transactions />} />
          <Route path="/profit-stats" element={<ProfitStatistics />} />
          <Route path="/helpLoan" element={<HelpLoan />} />
          <Route path="/contactUs" element={<ContactUs />} />
          <Route path="/adminKyc" element={<AdminKyc />} />
          <Route path="/agentLogin" element={<LoginAgent />} />
          <Route path="/agentSignup" element={<SignupAgent />} />
          <Route path="/tnega12-dashboard/*" element={<PrivateRouteAgent />}>
            <Route path="*" element={<AgentDashboard />} />
          </Route>{" "}
          <Route
            path="/masternimda21/*"
            element={
              <PrivateRouteMasterAdmin>
                <MasterAdminDashboard />
              </PrivateRouteMasterAdmin>
            }
          />
          <Route path="/masteradminlogin" element={<MasterAdminLogin />} />
          <Route path="/masteradminsignup" element={<MasterAdminSignup />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/agent/approval"
            element={<AdminAgentApproval />}
          />
          <Route
            exact
            path="/prediction/:predictionId"
            element={<PredictionDetails />}
          />
          <Route
            path="/transaction/:transactionId"
            element={<TransactionDetails />}
          />{" "}
          <Route path="/contactus1/" element={<ClientContact />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <FooterProvider>
          <AppContent />
        </FooterProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;