import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onStartCall, onEndCall, isCallActive }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300 flex items-center justify-between">
      {/* Left Section: User Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="avatar">
          <div className="size-10 rounded-full relative">
            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
          </div>
        </div>

        {/* User Info */}
        <div>
          <h3 className="font-medium text-lg">{selectedUser.fullName}</h3>
          <p className="text-sm text-base-content/70">
            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Right Section: Call Buttons */}
      <div className="flex items-center gap-2">
        {!isCallActive && (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={onStartCall}
          >
            Start Video Call
          </button>
        )}
        {isCallActive && (
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={onEndCall}
          >
            End Call
          </button>
        )}
        {/* Close Button */}
        <button
          className="p-2 rounded-full hover:bg-gray-200 transition"
          onClick={() => setSelectedUser(null)}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
