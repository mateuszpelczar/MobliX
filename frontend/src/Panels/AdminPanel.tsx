import React from "react";

interface AdminPanelProps {
  onLogout: () => void;
  isAdmin: boolean;
}

const MainPanel: React.FC<AdminPanelProps> = ({ onLogout, isAdmin }) => {
  return (
    <div>
      <h1>Panel Admina</h1>
      <p>Panel admina jest w trakcie tworzenia.</p>
      <button onClick={onLogout}>Wyloguj</button>
    </div>
  );
};

export default AdminPanel;
