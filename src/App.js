// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import SendMessage from "./components/SendMessage";

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://whatsapp-backend-9b43.onrender.com"
    : "http://localhost:5001");

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://whatsapp-backend-9b43.onrender.com"
    : "http://localhost:5001");

const PLATFORM_WA_ID = process.env.REACT_APP_PLATFORM_WA_ID || "919999999999";

function normalizeTimestamp(ts) {
  if (ts === undefined || ts === null) return null;
  const n = Number(ts);
  if (isNaN(n)) return null;
  if (n > 0 && n < 1e10) return n * 1000; // seconds -> ms
  return n;
}

function dedupeMessages(msgArray) {
  const map = {};
  for (const m of msgArray) {
    const key =
      m.id ||
      (m._id
        ? String(m._id)
        : `${m.wa_id}-${m.timestamp}-${(m.message || "").slice(0, 10)}`);
    if (!map[key]) map[key] = m;
  }
  return Object.values(map);
}

const userInfoMap = {
  "919937320320": { name: "Ravi Kumar", type: "user" },
  "929967673820": { name: "Neha Sharma", type: "user" },
};

function App() {
  const [messages, setMessages] = useState([]);
  const [selectedWaId, setSelectedWaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true); // toggle for mobile sidebar

  useEffect(() => {
    let mounted = true;

    // initial fetch
    axios
      .get(`${API_BASE}/api/messages`)
      .then((res) => {
        if (!mounted) return;
        const normalized = (res.data || []).map((m) => ({
          ...m,
          timestamp: normalizeTimestamp(m.timestamp) || Date.now(),
        }));
        setMessages(dedupeMessages(normalized));
      })
      .catch((err) => console.error("Error fetching messages:", err))
      .finally(() => setLoading(false));

    // SOCKET.IO - connect
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    // new message arrives
    socket.on("new-message", (msg) => {
      const normalized = {
        ...msg,
        timestamp: msg.timestamp
          ? Number(msg.timestamp) *
              (msg.timestamp > 1e10 ? 1 : 1000) // sec -> ms
          : Date.now(),
      };
      setMessages((prev) => dedupeMessages([...prev, normalized]));
    });

    // status update
    socket.on("status-update", ({ id, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    });

    // delete event
    socket.on("delete-message", ({ id }) => {
      setMessages((prev) =>
        dedupeMessages(prev.filter((m) => (m.id || m._id) !== id))
      );
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, []);

  const handleSendMessage = async ({ wa_id, text, localMessage }) => {
    const timestampSeconds =
      localMessage?.timestamp ?? Math.floor(Date.now() / 1000);
    const id =
      localMessage?.id ??
      `${wa_id}-${timestampSeconds}-${(text || "").slice(0, 10)}`;

    const newMsg = {
      id,
      wa_id,
      from: PLATFORM_WA_ID,
      to: wa_id,
      message: text,
      timestamp: timestampSeconds,
      status: "sent",
      type: "text",
      name: userInfoMap[wa_id]?.name || null,
    };

    setMessages((prev) =>
      dedupeMessages([...prev, { ...newMsg, timestamp: newMsg.timestamp * 1000 }])
    );

    try {
      await axios.post(`${API_BASE}/api/messages`, newMsg);
    } catch (err) {
      console.error("Failed to save message:", err);
      setMessages((prev) => prev.filter((m) => (m.id || m._id) !== id));
      alert("Failed to save message to server.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const prev = [...messages];
    setMessages((prevMsgs) =>
      dedupeMessages(prevMsgs.filter((m) => (m.id || m._id) !== messageId))
    );
    try {
      await axios.delete(
        `${API_BASE}/api/messages/${encodeURIComponent(messageId)}`
      );
    } catch (err) {
      console.error("Delete failed", err);
      setMessages(prev);
      alert("Failed to delete message on server.");
    }
  };

  // group messages
  const groupedMessages = messages.reduce((groups, message) => {
    const wa_id = message.wa_id || message.from || message.to;
    if (!wa_id) return groups;
    if (!groups[wa_id])
      groups[wa_id] = {
        name:
          userInfoMap[wa_id]?.name || `User (${wa_id})`,
        type: userInfoMap[wa_id]?.type || "user",
        messages: [],
      };
    groups[wa_id].messages.push(message);
    return groups;
  }, {});

  // sort inside groups
  Object.values(groupedMessages).forEach((group) => {
    group.messages.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  });

  const selectedChat = selectedWaId
    ? {
        waId: selectedWaId,
        name:
          groupedMessages[selectedWaId]?.name ||
          `User (${selectedWaId})`,
        type: groupedMessages[selectedWaId]?.type || "user",
      }
    : null;

  const onSelectChat = (waId) => {
    setSelectedWaId(waId);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex h-screen overflow-hidden">
        <div
          className={`w-full md:w-1/3 max-w-sm bg-[#111b21] border-r border-gray-700 h-screen shadow-md transform ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-200 md:translate-x-0 md:static fixed z-30`}
        >
          <ChatList
            chats={groupedMessages}
            selectedWaId={selectedWaId}
            setSelectedWaId={onSelectChat}
            userInfoMap={userInfoMap}
            loading={loading}
          />
        </div>

        <div className="flex flex-col flex-1 bg-gray-900 text-white relative overflow-y-auto">
          <div className="md:hidden flex items-center justify-between bg-[#202c33] p-2 border-b border-[#303d45]">
            <button
              onClick={() => setShowSidebar((v) => !v)}
              className="px-3 py-2 rounded-md bg-transparent text-white border border-gray-600"
            >
              Chats
            </button>
            <div className="text-sm font-semibold">WhatsApp Clone</div>
            <div style={{ width: 48 }} />
          </div>

          {Object.keys(groupedMessages).length === 0 && !loading && (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-lg">
              No chats available. Please select a contact.
            </div>
          )}

          {selectedWaId ? (
            <>
              <ChatWindow
                messages={groupedMessages[selectedWaId]?.messages || []}
                selectedChat={selectedChat}
                contactMap={userInfoMap}
                platformWaId={PLATFORM_WA_ID}
                onDeleteMessage={handleDeleteMessage}
                onBack={() => setShowSidebar(true)}
              />
              <SendMessage wa_id={selectedWaId} onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
