import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Use `useNavigate` instead of `useHistory`

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); // Initialize `useNavigate`

  useEffect(() => {
    const fetchUsersForAdmin = async () => {
      try {
        const adminId = localStorage.getItem("adminId"); // Get the adminId from localStorage

        if (adminId) {
          const response = await axios.get(
            `https://trcnfx.com/api/clients-for-admin/${adminId}`
          );
          setUsers(response.data);
        } else {
          console.error("Admin ID not found in localStorage");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsersForAdmin();
  }, []);

  const handleSearch = () => {
    const filtered = users.filter((user) =>
      user.userId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setUsers(filtered);
  };

  const handleViewWalletDetails = (userId) => {
    navigate(`/nimda21/wallet/${userId}`); // Use `navigate` to redirect to the Wallet Details page
  };

  return (
    <div className="user-list p-4">
      <h2 className="text-2xl font-bold mb-4">Client List</h2>
      <div className="mb-4">
        <div style={{ display: "flex" }}>
          <input
            style={{ width: "500px" }}
            type="text"
            placeholder="Search by User ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-4 py-2 mr-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Agent ID
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                User ID
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Email
              </th>
              <th style={{ padding: "10px", border: "1px solid #ccc" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left whitespace-nowrap"
                >
                  {user.agentUID}
                </td>
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left whitespace-nowrap"
                >
                  {user.userId}
                </td>
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left whitespace-nowrap"
                >
                  {user.email}
                </td>
                <td
                  style={{ padding: "10px", border: "1px solid #ccc" }}
                  className="py-3 px-6 text-left"
                >
                  <button
                    className="bg-blue-500 text-white py-1 px-3 rounded"
                    onClick={() => handleViewWalletDetails(user._id)}
                  >
                    View Wallet Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
