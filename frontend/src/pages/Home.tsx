import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Witaj!</h2>
      <Link to="/login">Logowanie</Link>
      <br />
      <Link to="/register">Rejestracja</Link>
    </div>
  );
};

export default Home;
