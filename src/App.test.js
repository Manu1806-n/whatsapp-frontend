import React from 'react';

function ChatWindow({ messages, currentUserId, userInfoMap }) {
  return (
    <div className="chat-window">
      {messages.length > 0 && (() => {
        const firstMessage = messages[0];
        const wa_id = firstMessage.from;
        const name = firstMessage.name;
        const userName = (userInfoMap && userInfoMap[wa_id]?.name) || name || `User (${wa_id})`;
        return (
          <div className="sticky top-0 bg-gray-800 px-4 py-2 border-b border-gray-700">
            <h3 className="text-lg font-semibold">{userName}</h3>
          </div>
        );
      })()}
      <div className="messages p-4">
        {messages.map((message) => {
          const wa_id = message.from;
          const name = message.name;
          const userName = (userInfoMap && userInfoMap[wa_id]?.name) || name || `User (${wa_id})`;
          const msgFromCurrentUser = wa_id === currentUserId;
          const formattedTime = new Date(message.timestamp).toLocaleTimeString();
          return (
            <div key={message.id} className={`mb-2 flex ${msgFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${msgFromCurrentUser ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}>
                <p className="font-semibold">{msgFromCurrentUser ? 'You' : userName}</p>
                <p>{message.message}</p>
                <span className="text-xs text-gray-300 block text-right">{message.status} • {formattedTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatWindow;
