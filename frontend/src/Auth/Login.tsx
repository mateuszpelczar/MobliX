import React, { useState } from "react";
import "../Auth.css";

interface LoginProps {
  onLogin: (jwt: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:8088/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password }),
      });
      if (!res.ok) throw new Error("Błędny login lub hasło");
      const jwt = await res.text();
      onLogin(jwt);
    } catch (err: any) {
      setError(err.message || "Błąd logowania");
    }
  };

  return (
    <div className="center-container">
      <h2>Logowanie</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Zaloguj</button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        Nie masz konta? <a href="/register">Zarejestruj się</a>
      </div>
    </div>
  );
};

export default Login;
