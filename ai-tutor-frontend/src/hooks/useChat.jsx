import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  // ADDED
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const chat = async (userMessage) => {
    setQuestion("");
    setAnswer("");
    setLoading(true);

    try {
      // Save the user's question
      setQuestion(userMessage);

      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const resp = await data.json();

      // Save AI answer
      setAnswer(resp.answer || "");

      // Save messages safely
      setMessages((messages) => [
        ...messages,
        ...(Array.isArray(resp.messages) ? resp.messages : []),
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false); // ensures Send button is re-enabled
    }
  };

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  // Optional optimization: derive message instead of separate state
  const message = messages[0] || null;

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        question,
        answer,
        messages, // optional: expose full messages array if needed
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
