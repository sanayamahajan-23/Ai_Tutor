import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export const Dashboard = ({ onStart }) => {
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState(0);
  const [timeData, setTimeData] = useState([]); // Array of { date: 'DD/MM', hours: X }

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data() || {};
      setStreak(data.streak || 0);

      // Prepare graph data: last 7 days
      const logs = data.sessionLogs || [];

      // ✅ Sort logs by date ascending
      const sortedLogs = [...logs].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const last7Days = sortedLogs.slice(-7);

      let graphData;

      if (last7Days.length === 0) {
        // Show empty chart if no data
        graphData = Array.from({ length: 7 }).map((_, i) => ({
          date: `Day ${i + 1}`,
          hours: 0,
        }));
      } else {
        graphData = last7Days.map((s) => ({
          date: new Date(s.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          }),
          // ✅ Ensure s.timeSpent is in seconds before dividing by 3600
          hours: +(s.timeSpent / 3600).toFixed(2),
        }));
      }

      setTimeData(graphData);
    };

    fetchData();
  }, [user]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-xl p-6">
      <div className="relative w-full max-w-3xl bg-white/20 backdrop-blur-xl rounded-xl border border-white/40 shadow-2xl p-4 flex flex-col gap-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-xl bg-red-500 text-white font-semibold shadow-md hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <p className="text-gray-700 text-sm">
          Track your learning streaks and time spent practicing English.
        </p>

        {/* Streak Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 shadow-lg border border-yellow-100">
          <div className="text-3xl">🔥</div>
          <div>
            <p className="text-xl font-bold">
              {streak} day{streak > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-gray-800">
              Keep practicing to maintain your streak!
            </p>
          </div>
        </div>

        {/* Time Spent Graph */}
        <div className="bg-white/30 p-4 rounded-2xl shadow-md border border-white/40">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Time Spent (Hours)
          </h3>

          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={timeData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="mx-auto px-8 py-2 rounded-2xl font-semibold bg-gradient-to-br from-white/90 via-white/80 to-white/60 text-gray-800 border border-white/70 shadow-lg hover:shadow-xl transition-all"
        >
          Start Speaking Practice
        </button>
      </div>
    </div>
  );
};
