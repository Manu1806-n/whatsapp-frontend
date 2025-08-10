// src/components/SendMessage.js
import React, { useState } from "react";
import PropTypes from "prop-types";

const PLATFORM_WA_ID = process.env.REACT_APP_PLATFORM_WA_ID || "919999999999";

const SendMessage = ({ wa_id, onSend }) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const timestampSecs = Math.floor(Date.now() / 1000);
    const localMessage = {
      id: `${wa_id}-${timestampSecs}-${trimmed.slice(0,10)}`,
      wa_id,
      from: PLATFORM_WA_ID,
      to: wa_id,
      message: trimmed,
      timestamp: timestampSecs,
      status: "sent",
      type: "text",
    };

    setSending(true);
    try {
      await onSend({ wa_id, text: trimmed, localMessage });
      setText("");
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 bg-[#202c33] border-t border-gray-700 flex items-center gap-3">
      <input className="flex-1 rounded-full px-4 py-3 bg-[#111b21] text-white focus:outline-none" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} disabled={!wa_id || sending} />
      <button type="submit" disabled={!text.trim() || sending || !wa_id} className="px-4 py-2 rounded-full bg-[#00a884] hover:bg-[#008f72] text-white font-medium disabled:opacity-60">
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  );
};

SendMessage.propTypes = {
  wa_id: PropTypes.string,
  onSend: PropTypes.func.isRequired,
};

SendMessage.defaultProps = {
  wa_id: null,
};

export default SendMessage;
