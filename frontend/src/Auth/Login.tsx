import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", String(res.data));
      const token = String(res.data);
      // Fetch current user and persist id/role
      try {
        const me = await axios.get("http://localhost:8080/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = me.data as { id?: number; role?: string };
        if (user?.id != null) {
          localStorage.setItem("userId", String(user.id));
        }
        if (user?.role) {
          localStorage.setItem("role", String(user.role));
        }
      } catch (e) {
        // non-fatal
      }
      navigate("/main");
    } catch (err) {
      alert("Błędne dane logowania");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Tło z MainPanel (rozmazane) */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-slate-900/30 backdrop-blur-sm"></div>

      {/* Formularz logowania */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Logowanie</h2>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="email@przykład.pl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hasło
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-lg transition-colors w-full"
          >
            Zaloguj
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Nie masz konta?{" "}
          <Link
            to="/register"
            className="text-purple-600 hover:underline font-medium"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
