import React, { useState } from "react";
import "../Auth.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch("http://localhost:8088/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, password, email }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Błąd rejestracji");
      }
      setMessage("Rejestracja zakończona sukcesem! Możesz się zalogować.");
    } catch (err: any) {
      setError(err.message || "Błąd rejestracji");
    }
  };

  return (
    <div className="center-container">
      <h2>Rejestracja</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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

        <button type="submit">Zarejestruj</button>
      </form>
      {message && <div style={{ color: "green" }}>{message}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        Masz już konto? <a href="/login">Zaloguj się</a>
      </div>
    </div>
  );
};

export default Register;
