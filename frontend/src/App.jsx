import { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("/");

export default function App() {
  const [nickname, setNickname] = useState("");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isNicknameSet, setIsNicknameSet] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const receiveMessage = useCallback((msg) => {
    setMessages((prevMessages) => [...prevMessages, msg]);
    setAlertMessage(`NUEVO MENSAJE de ${msg.nickname}`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000); // Ocultar alerta después de 3 segundos
  }, []);

  useEffect(() => {
    const handleUserConnected = (users) => setUsers(users);
    const handleUserDisconnected = (users) => setUsers(users);

    socket.on("user connected", handleUserConnected);
    socket.on("user disconnected", handleUserDisconnected);
    socket.on("message", receiveMessage);

    return () => {
      socket.off("user connected", handleUserConnected);
      socket.off("user disconnected", handleUserDisconnected);
      socket.off("message", receiveMessage);
    };
  }, [receiveMessage]);

  const handleNicknameSubmit = () => {
    if (nickname.trim()) {
      socket.emit("set nickname", nickname);
      setIsNicknameSet(true);
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const messageData = {
        nickname,
        message,
        timestamp: new Date().toLocaleString(),
      };
      socket.emit("message", messageData);
      setMessage(""); // Limpiar el mensaje después de enviarlo
    }
  };

  return (
    <div className="App">
      {showAlert && <div className="alert">{alertMessage}</div>}
      {!isNicknameSet ? (
        <div className="nickname-box">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Enter your nickname..."
          />
          <button onClick={handleNicknameSubmit}>Set Nickname</button>
        </div>
      ) : (
        <div className="chat-container">
          <div className="left-panel">
            <h2>Usuarios conectados</h2>
            <ul>
              {users.map((user, index) => (
                <li key={index}>{user.nickname}</li>
              ))}
            </ul>
          </div>
          <div className="right-panel">
            <div className="chat-box">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.nickname === nickname ? "my-message" : "other-message"
                  }
                >
                  <strong>{msg.nickname}</strong>: {msg.message} <br />
                  <small>{msg.timestamp}</small>
                </div>
              ))}
            </div>
            <form onSubmit={handleMessageSubmit}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensaje..."
              />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
