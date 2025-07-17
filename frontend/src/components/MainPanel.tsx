import { useNavigate } from "react-router-dom";

const MainPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h1>Strona Główna</h1>
      <button onClick={handleLogout}>Wyloguj</button>
    </div>
  );
};
export default MainPanel;
