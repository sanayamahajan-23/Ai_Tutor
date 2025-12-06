import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { Dashboard } from "./components/Dashboard";
import { SplashScreen } from "./components/SplashScreen";
import { LoginScreen } from "./components/LoginScreen";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { ChatProvider } from "./hooks/useChat"; // ✅ import ChatProvider

function AppContent() {
  const { page, setPage } = useAuth();

  return (
    <>
      <Loader />
      <Leva hidden />

      {page === "splash" && <SplashScreen onFinish={() => setPage("login")} />}
      {page === "login" && <LoginScreen />}
      {page === "dashboard" && <Dashboard onStart={() => setPage("ui")} />}

      {page === "ui" && (
        <ChatProvider>
          {" "}
          {/* ✅ wrap UI and Canvas */}
          <UI onGoDashboard={() => setPage("dashboard")} />
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            <Experience />
          </Canvas>
        </ChatProvider>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
