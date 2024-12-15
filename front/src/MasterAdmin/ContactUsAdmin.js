import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal"; // Import the Modal component

const ContactUsAdmin = () => {
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get("https://trcnfx.com/api/contacts");
        setContacts(response.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://trcnfx.com/api/contacts/${selectedContactId}`
      );
      setContacts(
        contacts.filter((contact) => contact._id !== selectedContactId)
      );
      setShowModal(false);
      setSelectedContactId(null);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const openModal = (id) => {
    setSelectedContactId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedContactId(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Contact Submissions</h2>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-2">UID</th>
            <th className="py-2">Title</th>
            <th className="py-2">Description</th>
            <th className="py-2">Submitted At</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact._id}>
              <td className="border px-4 py-2">{contact.uid}</td>
              <td className="border px-4 py-2">{contact.title}</td>
              <td className="border px-4 py-2">{contact.description}</td>
              <td className="border px-4 py-2">
                {new Date(contact.submittedAt).toLocaleString()}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => openModal(contact._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        show={showModal}
        onClose={closeModal}
        onConfirm={handleDelete}
        message="Are you sure you want to delete this contact submission?"
      />
    </div>
  );
};

export default ContactUsAdmin;
