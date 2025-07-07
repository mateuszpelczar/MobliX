import React from "react";

interface MainPanelProps {
  onLogout: () => void;
  isAdmin: boolean;
}

const MainPanel: React.FC<MainPanelProps> = ({ onLogout, isAdmin }) => {
  return (
    <div>
      <h1>Panel Główny</h1>
      <p>
        Witaj w aplikacji! To jest widok dostępny dla wszystkich użytkowników.
      </p>
      {isAdmin && (
        <div>
          <a href="/admin">Przejdź do panelu administratora</a>
        </div>
      )}
      <button onClick={onLogout}>Wyloguj</button>
    </div>
  );
};

export default MainPanel;
