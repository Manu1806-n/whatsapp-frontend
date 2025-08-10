// src/components/ChatList.js
import React from "react";
import PropTypes from "prop-types";

const API_DATE_FMT = { hour: "2-digit", minute: "2-digit" };

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

const ChatList = ({ chats, selectedWaId, setSelectedWaId, userInfoMap, loading }) => {
  const sortedChats = Object.entries(chats).sort(([waIdA, chatA], [waIdB, chatB]) => {
    const lastA = chatA.messages[chatA.messages.length - 1];
    const lastB = chatB.messages[chatB.messages.length - 1];
    const tA = normalizeTsToMs(lastA?.timestamp) || 0;
    const tB = normalizeTsToMs(lastB?.timestamp) || 0;
    return tB - tA;
  });

  const formatTime = (timestamp) => {
    const ms = normalizeTsToMs(timestamp);
    if (!ms) return "";
    const now = new Date();
    const msgDate = new Date(ms);
    if (now.toDateString() === msgDate.toDateString()) return msgDate.toLocaleTimeString([], API_DATE_FMT);
    return msgDate.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getLastMessageText = (lastMsg) => {
    if (!lastMsg) return "No messages yet";
    let text = lastMsg.message || "";
    if (lastMsg.type === "image") text = "📷 Photo";
    if (lastMsg.type === "video") text = "🎥 Video";
    if (lastMsg.type === "document") text = "📄 Document";
    return text.length > 40 ? `${text.substring(0, 40)}...` : text;
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold px-4 py-3 border-b border-gray-700 bg-[#202c33] sticky top-0 z-10">
        Chats {loading && <span className="text-xs text-gray-400 ml-2">(loading...)</span>}
      </h2>

      <div className="overflow-y-auto p-2">
        {sortedChats.length === 0 ? (
          <div className="p-4 text-gray-400 text-sm">
            {loading ? "Loading chats..." : "No chats yet. Start a conversation."}
          </div>
        ) : (
          sortedChats.map(([wa_id, chat]) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const userName = userInfoMap[wa_id]?.name || chat.name || `User (${wa_id})`;
            const lastMessageText = getLastMessageText(lastMsg);
            return (
              <div
                key={wa_id}
                onClick={() => setSelectedWaId(wa_id)}
                className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${wa_id === selectedWaId ? "bg-[#2a3942]" : "hover:bg-[#162022]"}`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                  {userName.split(" ").map(s => s[0]).slice(0,2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className="font-medium text-white truncate">{userName}</p>
                    <span className="text-xs text-gray-400 ml-2">{formatTime(lastMsg?.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{lastMessageText}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

ChatList.propTypes = {
  chats: PropTypes.object.isRequired,
  selectedWaId: PropTypes.string,
  setSelectedWaId: PropTypes.func.isRequired,
  userInfoMap: PropTypes.object,
  loading: PropTypes.bool,
};

ChatList.defaultProps = {
  userInfoMap: {},
  loading: false,
};

export default ChatList;
