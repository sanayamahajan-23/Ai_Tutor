// src/components/Dashboard.jsx
export const Dashboard = ({ onStart }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-xl">
      <div className="text-center p-8 rounded-3xl bg-white/30 border border-white/40 shadow-2xl max-w-md">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Dashboard</h2>
        <p className="text-gray-700 mb-6">
          Track your learning streaks and progress here.
        </p>

        {/* Placeholder for streak / analytics future */}
        <div className="bg-white/40 p-4 rounded-xl mb-6 border border-white/50">
          🔥 <span className="font-bold">Streak: 0 days</span>
          <p className="text-xs text-gray-700">
            Keep practicing daily to build your streak!
          </p>
        </div>

        <button
          onClick={onStart}
          className="
    px-7 py-3.5 rounded-2xl font-semibold
    bg-gradient-to-br from-white/90 via-white/80 to-white/60
    text-gray-800 tracking-tight
    border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.07)]
    backdrop-blur-xl 
    transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
    
    hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)]
    hover:-translate-y-0.5 hover:from-white hover:to-white/85
    hover:border-white/90

    active:scale-[0.985] active:shadow-[0_5px_14px_rgba(0,0,0,0.12)]
    relative overflow-hidden
  "
        >
          <span className="relative z-10">Start Speaking Practice</span>

          {/* soft highlight sweep */}
          <span
            className="
      absolute inset-0 opacity-0
      bg-gradient-to-r from-transparent via-white/40 to-transparent
      transition-all duration-500
      hover:opacity-100 hover:translate-x-full
    "
            style={{ transform: "translateX(-100%)" }}
          ></span>
        </button>
      </div>
    </div>
  );
};
