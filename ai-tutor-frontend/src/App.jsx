import { useState, useEffect } from "react";
import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { Dashboard } from "./components/Dashboard";
import { SplashScreen } from "./components/SplashScreen";

function App() {
  const [page, setPage] = useState("splash"); // splash → dashboard → ui

  return (
    <>
      <Loader />
      <Leva hidden />

      {page === "splash" && (
        <SplashScreen onFinish={() => setPage("dashboard")} />
      )}

      {page === "dashboard" && <Dashboard onStart={() => setPage("ui")} />}

      {page === "ui" && (
        <>
          <UI onGoDashboard={() => setPage("dashboard")} />
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            <Experience />
          </Canvas>
        </>
      )}
    </>
  );
}

export default App;
