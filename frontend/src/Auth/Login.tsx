import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8088/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", String(res.data));
      const token = String(res.data);
      // Fetch current user and persist id/role
      try {
        const me = await axios.get("http://localhost:8088/api/auth/me", {
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-white to-[#191929]">
      <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Logowanie
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-lg transition-colors w-full"
          >
            Zaloguj
          </button>
        </form>
        <p className="text-center text-gray-600 text-sm">
          Nie masz konta?{" "}
          <Link to="/register" className="text-purple-600 hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
