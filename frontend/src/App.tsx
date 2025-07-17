import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainPanel from "./components/MainPanel";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./routes/PrivateRoutes";

function App() {
  return (
    <Router>
      <Routes>
        {/* Przekierowanie z / na /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/main"
          element={
            <PrivateRoute>
              <MainPanel />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
