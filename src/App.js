import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./join/Login";
import { SocketProvider } from "./Providers/Socket";
import Room from "./room/Room";
const App = () => {
  return (
    <Router>
      <SocketProvider>
        <Routes>
          <Route element={<Login />} path="/" />
          <Route element={<Room />} path="/room/:roomId" />
        </Routes>
      </SocketProvider>
    </Router>
  );
};

export default App;
