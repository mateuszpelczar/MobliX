import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

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
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "1rem",
        }}
      >
        <h1>Strona Główna</h1>
        <div>
          {isAdmin && (
            <button
              onClick={handleGoToAdminPanel}
              style={{ marginRight: "1rem" }}
            >
              Panel administratora
            </button>
          )}
          <button onClick={handleLogout}>Wyloguj</button>
        </div>
      </header>

      <main style={{ padding: "1rem" }}>
        <p>Witaj w panelu glownym</p>
      </main>
    </div>
  );
};
export default MainPanel;
