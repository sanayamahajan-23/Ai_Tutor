import { useEffect } from "react";

export const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => onFinish(), 2400);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden z-[9999]"
      style={{
        backgroundColor: "#faaca8",
        backgroundImage: "linear-gradient(19deg, #faaca8 0%, #ddd6f3 100%)",
      }}
    >
      {/* Floating Glow Background */}
      <div className="absolute inset-0 opacity-40 blur-3xl pointer-events-none">
        <div className="w-72 h-72 bg-pink-300 rounded-full absolute top-10 left-10 animate-float-slow"></div>
        <div className="w-72 h-72 bg-purple-300 rounded-full absolute bottom-10 right-10 animate-float-slow-2"></div>
      </div>

      {/* Center orb and text */}
      <div className="relative flex flex-col items-center text-center">
        {/* Animated Orb */}
        <div className="relative mb-5">
          <div
            className="
              w-28 h-28 rounded-full 
              backdrop-blur-2xl 
              border border-white/50 
              bg-[rgba(255,255,255,0.55)]
              shadow-[0_0_55px_rgba(255,255,255,0.55)]
              animate-breathe-orb
              flex items-center justify-center 
              relative overflow-hidden
            "
          >
            {/* Inner glow */}
            <div className="absolute w-20 h-20 rounded-full bg-purple-300/40 blur-xl animate-inner-glow"></div>

            {/* Spotify style bars */}
            <div className="flex gap-[5px] opacity-95 relative z-10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-[4px] rounded-full bg-white animate-wave-${i}`}
                  style={{ height: "10px" }}
                />
              ))}
            </div>

            {/* Particles */}
            <div className="absolute w-3 h-3 rounded-full bg-white blur-sm animate-spark1"></div>
            <div className="absolute w-2 h-2 rounded-full bg-purple-200 blur animate-spark2"></div>
            <div className="absolute w-[6px] h-[6px] bg-pink-200 rounded-full blur animate-spark3"></div>
          </div>

          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border border-white/70 animate-pulse-ring"></div>
        </div>

        <div className="text-4xl font-extrabold text-[#1f1f1f] tracking-wide animate-text-drop">
          Vaani
        </div>

        <div className="text-gray-700 mt-2 text-sm tracking-wide animate-fade-in font-medium">
          The voice that guides you.
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-22px); }
          100% { transform: translateY(0px); }
        }
        @keyframes floatSlow2 {
          0% { transform: translateY(0px); }
          50% { transform: translateY(22px); }
          100% { transform: translateY(0px); }
        }
        @keyframes breatheOrb {
          0% { transform: scale(1); box-shadow: 0 0 18px rgba(255,255,255,0.4); }
          50% { transform: scale(1.07); box-shadow: 0 0 65px rgba(255,255,255,0.65); }
          100% { transform: scale(1); box-shadow: 0 0 18px rgba(255,255,255,0.4); }
        }
        @keyframes innerGlow {
          0% { opacity: .4; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.15); }
          100% { opacity: .4; transform: scale(1); }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes textDrop {
          0% { opacity: 0; transform: translateY(22px) scale(.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: .85; }
        }

        /* Spotify wave bars */
        @keyframes wave {
          0%, 100% {
    height: 8px;
    transform: translateY(6px); /* rest down */
    opacity: .9;
  }
  50% {
    height: 22px;
    transform: translateY(0); /* peak up */
    opacity: 1;
  }
        }

        .animate-wave-1 { animation: wave 1s ease-in-out infinite; animation-delay: .0s; }
        .animate-wave-2 { animation: wave 1s ease-in-out infinite; animation-delay: .15s; }
        .animate-wave-3 { animation: wave 1s ease-in-out infinite; animation-delay: .3s; }
        .animate-wave-4 { animation: wave 1s ease-in-out infinite; animation-delay: .45s; }
        .animate-wave-5 { animation: wave 1s ease-in-out infinite; animation-delay: .6s; }

        /* Particles floating */
        @keyframes spark {
          0% { transform: translate(0,0); opacity: 1; }
          100% { transform: translate(12px,-14px); opacity: 0; }
        }
        .animate-spark1 { animation: spark 1.8s infinite ease-in-out; }
        .animate-spark2 { animation: spark 2.4s infinite ease-in-out; }
        .animate-spark3 { animation: spark 2s infinite ease-in-out; }

        .animate-float-slow { animation: floatSlow 6s ease-in-out infinite; }
        .animate-float-slow-2 { animation: floatSlow2 6s ease-in-out infinite; }
        .animate-breathe-orb { animation: breatheOrb 3s ease-in-out infinite; }
        .animate-inner-glow { animation: innerGlow 3s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulseRing 2.2s ease-out infinite; }
        .animate-text-drop { animation: textDrop .7s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 1.2s ease-out forwards .4s; }
      `}</style>
    </div>
  );
};
