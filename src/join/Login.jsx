import React, { useState, useEffect, useCallback } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../Providers/Socket";

const Login = () => {
  const { socket } = useSocket();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const nv = useNavigate();

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      // Check for valid room ID
      if (!roomId) {
        alert("Please enter a room ID.");
        return;
      }

      socket.emit("room:join", {
        name: name,
        email: email,
        roomId: roomId,
      });
      console.log("i got email in frotend : ", email);
    },
    [socket, name, email, roomId]
  );

  const handleJoinedRoom = useCallback(
    ({ roomId }) => {
      nv(`/room/${roomId}`);
    },
    [nv]
  );
  useEffect(() => {
    socket.on("room:join", handleJoinedRoom);
    return () => {
      socket.off("room:join", handleJoinedRoom);
    };
  }, [socket, handleJoinedRoom]);

  return (
    <div id="log-cont">
      <form onSubmit={handleSubmit} method="post">
        <input
          type="text"
          name="name"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <input
          type="email"
          name="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <input
          type="text"
          onChange={(e) => setRoomId(e.target.value)}
          name="roomId"
          placeholder="Create room code"
        />
        <button type="submit">Create Room</button>
      </form>
    </div>
  );
};

export default Login;
