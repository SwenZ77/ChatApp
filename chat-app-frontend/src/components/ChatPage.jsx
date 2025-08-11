import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";

const ChatPage = () => {
  const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Redirect if not connected
  useEffect(() => {
    if (!connected) navigate("/");
  }, [connected, roomId, currentUser, navigate]);

  // Load existing messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessagess(roomId);
        setMessages(data);
      } catch {
        // ignore silently
      }
    }
    if (connected && roomId) loadMessages();
  }, [connected, roomId]);

  // Auto-scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    if (!connected || !roomId) return;
    const sock = new SockJS(`${baseURL}/chat`);
    const client = Stomp.over(sock);
    client.connect({}, () => {
      setStompClient(client);
      toast.success("Connected");
      client.subscribe(`/topic/room/${roomId}`, (frame) => {
        const newMessage = JSON.parse(frame.body);
        setMessages((prev) => [...prev, newMessage]);
      });
    });
    return () => {
      try { client.disconnect(() => {}); } catch {/* noop */}
    };
  }, [roomId, connected]);

  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      const message = { sender: currentUser, content: input, roomId };
      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }
  };

  const handleLogout = () => {
  try { stompClient?.disconnect(() => {}); } catch {/* noop */}
    setConnected(false);
    setRoomId("");
    setCurrentUser("");
    navigate("/");
  };

  return (
    <div className="relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-8 py-4 flex items-center justify-between glass backdrop-saturate-150">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center font-bold text-white shadow shadow-indigo-900/40">
            {roomId?.substring(0, 2)?.toUpperCase() || "RM"}
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-wide text-slate-200">Room</h1>
            <p className="text-sm font-mono text-indigo-300/90">{roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">User</p>
            <p className="font-semibold text-slate-100">{currentUser}</p>
          </div>
            <button onClick={handleLogout} className="btn-danger text-sm px-6 py-2">Leave</button>
        </div>
      </header>

      {/* Messages */}
      <main ref={chatBoxRef} className="pt-32 pb-32 px-4 md:px-10 w-full md:w-4/5 lg:w-3/5 mx-auto h-screen overflow-y-auto space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4">
            <div className="h-20 w-20 rounded-2xl glass flex items-center justify-center animate-pulse">
              <MdSend size={34} className="text-indigo-400" />
            </div>
            <p className="text-sm tracking-wide">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((message, index) => {
          const own = message.sender === currentUser;
          return (
            <div key={index} className={`flex fade-in ${own ? "justify-end" : "justify-start"}`}>
              <div className={`group relative max-w-[78%] md:max-w-[60%] rounded-2xl px-4 py-3 backdrop-blur message-shadow ${own ? "message-bubble-own" : "message-bubble-other"}`}>
                <div className="flex items-start gap-3">
                  {!own && (
                    <img
                      className="h-10 w-10 rounded-xl ring-2 ring-slate-700 object-cover"
                      src={"https://api.dicebear.com/7.x/pixel-art/png"}
                      alt={message.sender}
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{message.sender}</p>
                    <p className="leading-relaxed break-words whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className="text-[10px] mt-1 tracking-wider font-medium text-white/60">{timeAgo(message.timeStamp)}</p>
                  </div>
                </div>
                <span className={`absolute top-0 ${own ? "right-0" : "left-0"} h-3 w-3 translate-y-[-60%] rounded-full bg-gradient-to-br from-indigo-400/60 to-fuchsia-500/60 backdrop-blur-sm blur-sm opacity-0 group-hover:opacity-100 transition`} />
              </div>
            </div>
          );
        })}
      </main>

      {/* Composer */}
      <div className="fixed bottom-6 left-0 right-0 z-30">
        <div className="w-[94%] md:w-4/5 lg:w-3/5 mx-auto flex items-center gap-4 glass rounded-2xl px-4 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            type="text"
            placeholder="Type a message..."
            className="input bg-slate-900/40 border-slate-700/60 focus:border-indigo-500/70 focus:ring-indigo-600/30"
          />
          <div className="flex items-center gap-2 pr-1">
            <button className="btn bg-slate-800/70 hover:bg-slate-700 text-slate-200 h-11 w-11 p-0" aria-label="Attach file">
              <MdAttachFile size={20} />
            </button>
            <button onClick={sendMessage} className="btn-accent h-11 w-11 p-0 flex-shrink-0" aria-label="Send message">
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
