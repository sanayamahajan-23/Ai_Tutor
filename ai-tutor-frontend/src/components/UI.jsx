import { useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, onGoDashboard }) => {
  const { user, updateTimeSpent, saveChatToDB } = useAuth();
  const startTimeRef = useRef(null);
  const input = useRef();
  const sessionActiveRef = useRef(false);

  const {
    chat,
    loading,
    cameraZoomed,
    setCameraZoomed,
    message,
    question,
    answer,
  } = useChat();

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  // Start speech recognition
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onstart = () => console.log("🎤 Listening...");
    recognition.onerror = (err) => console.log("Speech Error:", err);
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      input.current.value = text;
    };
    recognition.onend = () => console.log("🎤 Stopped listening.");
  };

  // End session and save time spent
  const endSession = async () => {
    if (!sessionActiveRef.current || !user) return;

    const endTime = Date.now();
    const secondsSpent = Math.floor((endTime - startTimeRef.current) / 1000);

    await updateTimeSpent(user.uid, secondsSpent);

    sessionActiveRef.current = false;
    startTimeRef.current = null;
  };

  // Handle dashboard click
  const handleGoDashboard = async () => {
    await endSession();
    onGoDashboard();
  };

  // Handle tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = async () => {
      input.current.value = "";
      await endSession();
      resetChat();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  // Send message and start session if not started
  const sendMessage = async () => {
    const text = input.current.value.trim();
    if (!loading && !message && text) {
      chat(text);

      // Start session
      if (!sessionActiveRef.current) {
        startTimeRef.current = Date.now();
        sessionActiveRef.current = true;
      }

      if (user) await saveChatToDB(user.uid, text, null);

      // Optional: Wait for AI response
      const backendResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, userId: user.uid }),
        }
      );
      const data = await backendResponse.json();
      const aiAnswer = data.answer || "";

      if (user) await saveChatToDB(user.uid, text, aiAnswer);

      input.current.value = "";
    }
  };

  if (hidden) return null;

  return (
    <>
      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between">
        {/* Top Glass Navigation */}
        <header
          className="pointer-events-auto px-6 py-2 flex items-center justify-between 
          backdrop-blur-2xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl mt-4 mx-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-lg animate-pulse"></div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight drop-shadow-sm">
              Virtual Pro Tutor
            </h1>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-800">
            <button
              onClick={handleGoDashboard}
              className="hover:text-indigo-700 transition"
            >
              Dashboard
            </button>
          </div>
        </header>

        {/* Left Floating Tools */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="p-4 bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl hover:bg-white/60 transition flex justify-center"
          >
            {cameraZoomed ? (
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 15l6 6M10 18a8 8 0 110-16 8 8 0 010 16z" />
                <path d="M13 11H7" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 15l6 6M10 18a8 8 0 110-16 8 8 0 010 16z" />
                <path d="M10 7v6m3-3H7" />
              </svg>
            )}
          </button>
        </div>

        {/* Q/A Display Section */}
        <div className="absolute bottom-40 left-8 flex flex-col gap-4 z-20">
          {question && (
            <div className="max-w-xs p-4 bg-indigo-100 text-gray-900 rounded-xl shadow-md self-start">
              <strong>You:</strong> {question}
            </div>
          )}
          {answer && (
            <div className="max-w-xs p-4 bg-green-100 text-gray-900 rounded-xl shadow-md self-end">
              <strong>AI:</strong> {answer}
            </div>
          )}
        </div>

        {/* Bottom Chat Bar */}
        <div className="pointer-events-auto flex flex-col items-start mb-8 gap-4 pl-8">
          <div className="absolute top-24 right-6 pointer-events-auto animate-slide-in">
            <div
              className="px-5 py-4 max-w-sm bg-white/30 backdrop-blur-2xl border border-white/40 
              shadow-2xl rounded-2xl text-sm font-semibold text-gray-900 leading-relaxed"
            >
              Hi, I'm your personal English speaking mentor. Here to help you
              build confidence for interviews and real communication.
            </div>
          </div>

          <div
            className="w-[480px] flex items-center gap-3 bg-white/20 
            backdrop-blur-2xl border border-white/40 p-5 rounded-3xl shadow-2xl"
          >
            <input
              ref={input}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Say Anything...'"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-600 text-lg"
            />
            <button
              onClick={startListening}
              className="p-3 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 
                shadow-md hover:scale-110 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]
                active:scale-95"
              title="Speak"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-900"
              >
                <path d="M12 1a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <button
              disabled={loading || message}
              onClick={sendMessage}
              className={`relative overflow-hidden px-7 py-3.5 rounded-2xl font-semibold text-gray-800
                bg-gradient-to-br from-white/90 via-white/80 to-white/60
                border border-white/70 backdrop-blur-xl
                shadow-[0_8px_24px_rgba(0,0,0,0.07)]
                transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
                tracking-tight
                ${
                  loading || message
                    ? "cursor-not-allowed opacity-60"
                    : "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)] active:scale-[0.985]"
                }`}
            >
              <span className="relative z-10">Send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
