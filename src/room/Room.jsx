import React, { useEffect, useCallback, useState } from "react";
import "./Room.css";
import { useSocket } from "../Providers/Socket";
import ReactPlayer from "react-player";
import peer from "../Providers/Peer";
const Room = () => {
  const { socket } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [roomId, setRommId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const handleNewUserJoinedRoom = useCallback(({ email, id, roomId }) => {
    console.log("New user joined the room");
    console.log(email, " #", id);
    setRommId(roomId);
    setRemoteSocketId(id);
  }, []);
  const handleCallUser = useCallback(async () => {
    //following code is used for screen sharing
    // const stream = await navigator.mediaDevices.getDisplayMedia({
    //   audio: true,
    //   video: true,
    // });
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer(); // creating offer for our video stream to share our video to other users within the room
    socket.emit("user:call", { to: remoteSocketId, offer }); // we use this emit for giving our offer to remote user

    setMyStream(stream);
  }, [socket, remoteSocketId]);
  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      setRemoteSocketId(from);
      console.log("Incoming call from :", from, " offer: ", offer);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans }); // have apde jene apdne call kairo ene apde ans mokaliye chiye as a call accepted
    },
    [socket]
  );
  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);
  const handleAcceptedCall = useCallback(
    async (data) => {
      const { ans } = data;
      await peer.setLocalDescription(ans);
      console.log("Call joined both ways");
      //following code is to get receivers video stream and set to remotestream so that we can show the face of receivers camera to the web browser
      sendStreams();
    },
    [sendStreams]
  );
  const handleIncomingNegoNeeded = useCallback(
    async (data) => {
      const { from, offer } = data;
      const ans = await peer.getAnswer(offer);
      socket.emit("nego:done", { to: from, ans });
    },
    [socket]
  );
  const handleNegoFinale = useCallback(async (data) => {
    const { ans } = data;
    await peer.setLocalDescription(ans);
  }, []);
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("nego:needed", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);
  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);
  useEffect(() => {
    peer.peer.addEventListener("track", async (event) => {
      setRemoteStream(event.streams[0]);
    });
  }, []);
  useEffect(() => {
    socket.on("user:joined", handleNewUserJoinedRoom);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleAcceptedCall);
    socket.on("nego:needed", handleIncomingNegoNeeded);
    socket.on("nego:finale", handleNegoFinale);

    return () => {
      socket.off("user:joined", handleNewUserJoinedRoom);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleAcceptedCall);
      socket.off("nego:needed", handleIncomingNegoNeeded);
      socket.off("nego:finale", handleNegoFinale);
    };
  }, [
    socket,
    handleNewUserJoinedRoom,
    handleIncomingCall,
    handleAcceptedCall,
    handleIncomingNegoNeeded,
    handleNegoFinale,
  ]);
  return (
    <>
      <center>
        <h1>Room {roomId}</h1>
        <br />
        <br />
        <br />
        <h1>{remoteSocketId ? "Connected" : "No one is in the Room"}</h1>

        <br />
        <hr />

        <br />
        <h1> My view</h1>
        <br />

        {remoteSocketId && <button onClick={handleCallUser}>Call </button>}
        <br />
        <ReactPlayer url={myStream} playing muted controls />
        <br />
        <hr />
        <hr />

        <br />
        <h1> Receivers view</h1>
        <br />
        {remoteStream && (
          <ReactPlayer url={remoteStream} playing muted controls />
        )}
        <button onClick={sendStreams}>Send Your Video camera</button>
        <br />
        <hr />
      </center>
    </>
  );
};

export default Room;
