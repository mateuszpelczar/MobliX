import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/MainPanel.css";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const MainPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
  };

  const token = localStorage.getItem("token");
  let isAdmin = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN";
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  return (
    <div>
      <header style={{ padding: "1rem" }}>
        <div className="main-buttons">
          {isAdmin && (
            <div>
              <button onClick={handleGoToAdminPanel}>
                Panel administratora
              </button>
            </div>
          )}
          <div>
            <button onClick={handleLogout}>Wyloguj</button>
          </div>
        </div>

        <div className="main-container">
          <h1 className="main-title">Strona Główna</h1>
          <p>Witaj w panelu glownym</p>
        </div>
      </header>
    </div>
  );
};

export default MainPanel;
