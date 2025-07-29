import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainPanel from "./components/MainPanel";
import AdminPanel from "./components/AdminPanel";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./routes/PrivateRoutes";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPanel />} />

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

        <Route
          path="/admin"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminPanel />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<h2>Brak dostępu</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
