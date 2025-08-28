import React, { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

const VideoCall = ({ selectedUser, authUser }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const socketInstance = io("http://localhost:5001");
    setSocket(socketInstance);

    socketInstance.emit("register-user", authUser._id);

    const pc = new RTCPeerConnection();
    setPeerConnection(pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", {
          candidate: event.candidate,
          target: selectedUser._id,
        });
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => {
        if (pc.signalingState !== "closed") {
          pc.addTrack(track, stream);
        }
      });
    });

    socketInstance.on("incoming-call", (data) => {
      setIncomingCall(data);
    });

    socketInstance.on("call-accepted", async (data) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketInstance.emit("offer", { offer, target: data.callee });
    });

    socketInstance.on("call-rejected", () => {
      alert("Call was rejected.");
    });

    socketInstance.on("offer", async (data) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketInstance.emit("answer", { answer, target: data.caller });
    });

    socketInstance.on("answer", async (data) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socketInstance.on("ice-candidate", (data) => {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    return () => {
      socketInstance.disconnect();
      if (pc.signalingState !== "closed") {
        pc.close();
      }
    };
  }, []);

  const startCall = () => {
    socket.emit("call-user", {
      target: selectedUser._id,
      caller: authUser._id,
      callerName: authUser.fullName,
    });
  };

  const acceptCall = () => {
    socket.emit("accept-call", {
      caller: incomingCall.caller,
      callee: authUser._id,
    });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    socket.emit("reject-call", {
      caller: incomingCall.caller,
      callee: authUser._id,
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (peerConnection && peerConnection.signalingState !== "closed") {
      peerConnection.close();
      setPeerConnection(new RTCPeerConnection());
    }
  };

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted />
      <video ref={remoteVideoRef} autoPlay />
      {incomingCall && (
        <div>
          <p>{incomingCall.callerName} is calling...</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
      <button onClick={startCall}>Start Call</button>
      <button onClick={endCall}>End Call</button>
    </div>
  );
};

export default VideoCall;
