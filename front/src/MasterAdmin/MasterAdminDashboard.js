import React from "react";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import Clients from "./Clients";
import TradeControl from "./TradeControl";
import WalletDetails from "./WalletDetails";
import RechargeStatus from "./RechargeStatus";
import ProfitLoss from "./ProfitLoss";
import "./Dashboard.css"; // Import CSS file for styling
import AdminDepositApproval from "./AdminDepositApproval";
import AdminSendApproval from "./AdminSendApproval";
import AdminAgentApproval from "./AdminAgentApproval";
import Agents from "./Agents";
import AdminKyc from "../Components/AdminKyc";
import HelpLoanApplications from "./HelpLoanApplications";
import AssignClientsToAgents from "./AssignClientsToAgents";
import AgentClientApproval from "./AgentClientApproval";
import ContactUsAdmin from "./ContactUsAdmin";
// import AdminInfoWallet from "./AdminInfoWallet";
import ContactUsControl from "./ContactUsControl";
import MasterAdminApproval from "./MasterAdminApproval";
import DeleteAdmin from "./DeleteAdmin";
import { useNavigate } from "react-router-dom";
import WithdrawList from "./WithdrawList";
import AdminInfoWallet from "../Admin/AdminInfoWallet";
const MasterAdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("masterAdminId"); // Remove masterAdminId from localStorage
    navigate("/masteradminlogin"); // Redirect to login page
  };
  return (
    <div className="flex min-h-screen">
      <div className="w-1/6 bg-gray-800 text-white p-5">
        <div className="mb-8">
          <img
            src="https://res.coinpaper.com/coinpaper/bitcoin_btc_logo_62c59b827e.png"
            alt="Logo"
            className="h-24 w-24 mx-auto"
          />
        </div>
        <nav className="flex flex-col space-y-2">
          <Link to="clients" className="text-lg hover:bg-gray-700 p-2 rounded">
            Clients
          </Link>
          <Link
            to="trade-control"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Trade Control
          </Link>
          <Link
            to="wallet-details"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Wallet Details
          </Link>
          <Link
            to="recharge-requests"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Recharge Requests
          </Link>
          <Link
            to="recharge-status"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Recharge status
          </Link>
          <Link
            to="send-approval"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Withdraw requests
          </Link>
          <Link
            to="withdraw-status"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Withdraw status
          </Link>
          <Link
            to="agent-approval"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Agent Approval
          </Link>
          <Link
            to="agent-list"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Agent List
          </Link>
          <Link to="kyc-list" className="text-lg hover:bg-gray-700 p-2 rounded">
            KYC Requests
          </Link>
          <Link
            to="help-loan"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Help Loan
          </Link>
          <Link
            to="agent-client-requests"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Agent-client Requests
          </Link>
          <Link
            to="assign-clients"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Assign Clients to Agents
          </Link>
          <Link
            to="contact-us"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Contact Us Requests
          </Link>
          <Link
            to="profit-loss"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Profit/Loss
          </Link>
          <Link
            to="master-admin-wallet-info"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Wallet info change
          </Link>
          {/* <Link
            to="wallet-info"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Wallet info change
          </Link> */}
          <Link
            to="control-contact-us"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Contact Us Settings
          </Link>
          <Link
            to="admin-approve"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Admin Approval
          </Link>
          <Link
            to="delete-admin"
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Delete Admin
          </Link>
          <Link
            to="#"
            onClick={handleLogout}
            className="text-lg hover:bg-gray-700 p-2 rounded"
          >
            Logout
          </Link>
        </nav>
      </div>
      <div className="w-5/6 p-6">
        <Routes>
          <Route path="clients" element={<Clients />} />
          <Route path="trade-control" element={<TradeControl />} />
          <Route path="wallet-details" element={<WalletDetails />} />
          <Route path="recharge-status" element={<RechargeStatus />} />
          <Route path="profit-loss" element={<ProfitLoss />} />
          <Route path="recharge-requests" element={<AdminDepositApproval />} />
          <Route path="send-approval" element={<AdminSendApproval />} />
          <Route path="agent-approval" element={<AdminAgentApproval />} />
          <Route path="kyc-list" element={<AdminKyc />} />
          <Route path="contact-us" element={<ContactUsAdmin />} />
          {/* <Route path="wallet-info" element={<AdminInfoWallet />} /> */}
          <Route path="delete-admin" element={<DeleteAdmin />} />
          <Route path="withdraw-status" element={<WithdrawList />} />

          <Route
            path="agent-client-requests"
            element={<AgentClientApproval />}
          />

          <Route path="agent-list" element={<Agents />} />
          <Route path="help-loan" element={<HelpLoanApplications />} />
          <Route path="assign-clients" element={<AssignClientsToAgents />} />
          <Route path="control-contact-us" element={<ContactUsControl />} />
          <Route path="admin-approve" element={<MasterAdminApproval />} />
          <Route
            path="master-admin-wallet-info"
            element={<AdminInfoWallet />}
          />

          {/* <Route path="*" element={<Navigate to="clients" />} />{" "} */}
          {/* Redirect to default route */}
        </Routes>
      </div>
    </div>
  );
};

export default MasterAdminDashboard;
