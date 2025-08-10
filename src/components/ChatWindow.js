// src/components/ChatWindow.js
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const normalizeTsToMs = (timestamp) => {
  if (timestamp === undefined || timestamp === null) return null;
  const n = Number(timestamp);
  if (isNaN(n)) {
    const parsed = Date.parse(timestamp);
    return isNaN(parsed) ? null : parsed;
  }
  if (n > 0 && n < 1e10) return n * 1000;
  return n;
};

const StatusIcon = ({ status }) => {
  switch (status) {
    case "read":
      return <span className="text-blue-400">✓✓</span>;
    case "delivered":
      return <span className="text-gray-300">✓✓</span>;
    case "sent":
      return <span className="text-gray-300">✓</span>;
    default:
      return <span className="text-gray-500">⏳</span>;
  }
};

const ChatWindow = ({ messages, selectedChat, contactMap, platformWaId, onDeleteMessage, onBack }) => {
  const sortedMessages = [...messages].sort((a, b) => (normalizeTsToMs(a.timestamp) || 0) - (normalizeTsToMs(b.timestamp) || 0));
  const messagesEndRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  const formatTime = (timestamp) => {
    const ms = normalizeTsToMs(timestamp);
    if (!ms) return "";
    return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (timestamp) => {
    const ms = normalizeTsToMs(timestamp);
    if (!ms) return "";
    return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getContactName = (waId) => {
    if (!waId) return "Unknown";
    if (waId === platformWaId) return "You";
    if (contactMap?.[waId]?.name) return contactMap[waId].name;
    return `User (${waId})`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c1317] min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#202c33] px-4 py-3 flex items-center gap-3 border-b border-[#303d45]">
        {onBack && <button onClick={onBack} className="md:hidden text-white px-2 py-1 rounded bg-transparent border border-gray-600">Back</button>}
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
          {getContactName(selectedChat?.waId).split(" ").map(s => s[0]).slice(0,2).join("")}
        </div>
        <div className="truncate">
          <h3 className="text-lg font-semibold text-white truncate">{selectedChat ? getContactName(selectedChat.waId) : "Select a chat"}</h3>
          <p className="text-xs text-gray-400 truncate">{selectedChat?.waId || ""}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')]">
        {sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          sortedMessages.map((msg, idx) => {
            const isCurrentUser = msg.from === platformWaId || msg.wa_id === platformWaId;
            const senderName = getContactName(msg.from || msg.wa_id);
            const showDateSeparator = idx === 0 || formatDate(sortedMessages[idx - 1]?.timestamp) !== formatDate(msg.timestamp);

            return (
              <React.Fragment key={msg.id || `${idx}-${msg.timestamp}`}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <div className="bg-[#182229] text-gray-400 text-xs px-3 py-1 rounded-full shadow">
                      {formatDate(msg.timestamp)}
                    </div>
                  </div>
                )}

                <div className={`flex mb-3 ${isCurrentUser ? "justify-end" : "justify-start"}`} onMouseEnter={() => setHoveredMessage(msg.id)} onMouseLeave={() => setHoveredMessage(null)}>
                  {!isCurrentUser && (
                    <div className="mr-2 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-semibold">
                      {senderName.split(" ").map(s => s[0]).slice(0,2).join("")}
                    </div>
                  )}

                  <div className={`relative max-w-[78%] px-4 py-2 ${isCurrentUser ? "bg-[#005c4b] text-white rounded-tr-none" : "bg-[#202c33] text-white rounded-tl-none"} rounded-lg shadow-sm`}>
                    {hoveredMessage === msg.id && (
                      <button onClick={() => onDeleteMessage(msg.id)} className={`absolute ${isCurrentUser ? "-left-10" : "-right-10"} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400`} title="Delete message">🗑️</button>
                    )}

                    {!isCurrentUser && <div className="text-xs text-[#00a884] font-medium mb-1">{senderName}</div>}
                    <p className="text-sm break-words">{msg.message || "[No content]"}</p>

                    <div className={`flex items-center justify-end mt-2 text-xs ${isCurrentUser ? "text-[#cfeee4]" : "text-gray-400"}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isCurrentUser && <span className="ml-2"><StatusIcon status={msg.status} /></span>}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

ChatWindow.propTypes = {
  messages: PropTypes.array.isRequired,
  selectedChat: PropTypes.object,
  contactMap: PropTypes.object,
  platformWaId: PropTypes.string.isRequired,
  onDeleteMessage: PropTypes.func.isRequired,
  onBack: PropTypes.func
};

ChatWindow.defaultProps = {
  contactMap: {},
  onBack: () => {}
};

export default ChatWindow;
