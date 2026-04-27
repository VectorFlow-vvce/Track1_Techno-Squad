import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {

    if (!input) return;

    const userMessage = { sender: "user", text: input };

    setMessages([...messages, userMessage]);

    try {

      const res = await axios.post("http://localhost:5000/chat", {
        message: input
      });

      const botMessage = {
        sender: "bot",
        text: res.data.reply
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (err) {

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Server error." }
      ]);

    }

    setInput("");

  };

  return (
    <div className="chatbot">

      <div className="chat-header">
        🤖 PlantGuard AI Assistant
      </div>

      <div className="chat-messages">

        {messages.map((msg, index) => (

          <div
            key={index}
            className={msg.sender === "user" ? "user-msg" : "bot-msg"}
          >
            {msg.text}
          </div>

        ))}

      </div>

      <div className="chat-input">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about plant diseases..."
        />

        <button onClick={sendMessage}>
          Send
        </button>

      </div>

    </div>
  );
};

export default Chatbot;