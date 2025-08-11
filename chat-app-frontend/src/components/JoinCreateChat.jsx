import { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({ roomId: "", userName: "" });
  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  const handleFormInputChange = (e) => {
    setDetail({ ...detail, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!detail.roomId || !detail.userName) {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  };

  const joinChat = async () => {
    if (!validateForm()) return;
    try {
      const room = await joinChatApi(detail.roomId);
      toast.success("Joined");
      setCurrentUser(detail.userName);
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.status === 400) toast.error(error.response?.data || "Cannot join");
      else toast.error("Error in joining room");
    }
  };

  const createRoom = async () => {
    if (!validateForm()) return;
    try {
      const response = await createRoomApi(detail.roomId);
      toast.success("Room Created");
      setCurrentUser(detail.userName);
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error.status === 400) toast.error("Room already exists !!");
      else toast.error("Error creating room");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-20 h-96 w-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>
      <div className="card w-full max-w-lg flex flex-col gap-7 relative">
        <div className="flex flex-col items-center gap-5">
          <img src={chatIcon} className="w-24 drop-shadow-[0_0_15px_rgba(99,102,241,0.35)]" />
          <h1 className="text-3xl font-bold tracking-tight heading-grad text-center">Join or Create a Room</h1>
          <p className="text-sm text-slate-400 text-center max-w-sm leading-relaxed">
            Enter a Room ID to join an existing chat or provide a new one to create a fresh space.
          </p>
        </div>
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-xs uppercase tracking-wider font-semibold mb-2 text-slate-300">Your Name</label>
            <input
              onChange={handleFormInputChange}
              value={detail.userName}
              type="text"
              id="name"
              name="userName"
              placeholder="e.g. Alex"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="roomId" className="block text-xs uppercase tracking-wider font-semibold mb-2 text-slate-300">Room ID</label>
            <input
              name="roomId"
              onChange={handleFormInputChange}
              value={detail.roomId}
              type="text"
              id="roomId"
              placeholder="Enter or create a room id"
              className="input"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2">
          <button onClick={joinChat} className="btn-primary flex-1">Join Room</button>
          <button onClick={createRoom} className="btn-accent flex-1">Create Room</button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
