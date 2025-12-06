import { useState } from "react";
import { useAuth } from "./AuthProvider";

export const LoginScreen = () => {
  const { signInWithGoogle, signInWithEmail, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Email login handler
  const handleEmailLogin = async () => {
    await signInWithEmail(email.trim(), password);
  };

  // Google login handler
  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{
        backgroundColor: "#faaca8",
        backgroundImage: "linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)",
      }}
    >
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-lg p-10 w-96 flex flex-col items-center text-gray-700">
        <h1 className="text-3xl font-bold mb-6">Welcome</h1>

        {/* Email login */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-white text-white border border-white/30 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded-xl bg-white/20 placeholder-white/70 text-white border border-white/30 focus:outline-none"
        />
        <button
          onClick={handleEmailLogin}
          className="w-full py-3 mb-4 bg-white/30 hover:bg-white/50 rounded-xl font-semibold text-white transition"
        >
          Sign in with Email
        </button>

        <div className="my-4 text-white/90">or</div>

        {/* Google Sign-In */}
        <button
          onClick={handleGoogleLogin}
          className="w-full py-3 mb-2 bg-white/60 hover:bg-white/50 rounded-xl font-semibold text-black transition flex items-center justify-center gap-3"
        >
          <img src="/src/assets/google.png" alt="Google" className="w-6 h-6" />
          Sign in with Google
        </button>

        {/* Show auth error from context */}
        {authError && <p className="text-red-400 mt-2 text-sm">{authError}</p>}
      </div>
    </div>
  );
};
