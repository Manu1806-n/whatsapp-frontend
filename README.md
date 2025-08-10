# 💬 WhatsApp Web Clone – Frontend

A React.js frontend that mimics WhatsApp Web, connected to a real-time backend that processes WhatsApp-like webhook payloads and displays chats.

---

## 🚀 Live Demo
- **Frontend:** [https://whatsapp-frontend-flax.vercel.app](https://whatsapp-frontend-flax.vercel.app)  
- **Backend API:** [https://whatsapp-backend-9b43.onrender.com](https://whatsapp-backend-9b43.onrender.com)  

---

## 📌 Features
- Real-time chat interface (WebSocket / Socket.IO)
- Conversations grouped by user
- Date separators & status indicators (✓ Sent, ✓✓ Delivered, ✓✓ Read)
- Responsive UI (mobile & desktop friendly)
- Send messages (saved to DB, no actual sending outside platform)
- Displays sender name, number, and chat history

---

## 🖥️ Backend Info
This frontend works with a Node.js + MongoDB backend.

- **Backend GitHub Repo:** [whatsapp-backend](https://github.com/Manu1806-n/whatsapp-backend)
- **Backend Stack:** Node.js, Express.js, MongoDB Atlas, Socket.IO
- **Functions:**
  - Process sample WhatsApp webhook payloads
  - Store messages in MongoDB (`processed_messages` collection)
  - Serve messages via REST API
  - Push updates in real-time to connected clients

---

## 📂 Folder Structure
```
whatsapp-frontend/
  ├── src/
  │   ├── components/   # UI Components (ChatList, ChatWindow, etc.)
  │   ├── styles/       # CSS / styling
  │   └── App.js        # Main app entry
  ├── public/           # Static files
  └── package.json
```

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Socket.IO Client, Axios
- **Backend:** Node.js, Express.js, MongoDB Atlas, Socket.IO
- **Hosting:** Vercel (Frontend), Render (Backend)

---

## 📦 Installation & Local Run
```bash
# Clone repo
git clone https://github.com/Manu1806-n/whatsapp-frontend.git
cd whatsapp-frontend

# Install dependencies
npm install

# Start development server
npm start
```

---

## 📜 License
This project is for educational/demonstration purposes only. No real WhatsApp messages are sent.
