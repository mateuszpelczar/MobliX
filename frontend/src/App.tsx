import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPanel from "./components/MainPanel";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import PrivateRoute from "./routes/PrivateRoutes";
import ChangeRole from "./components/admin/ChangeRole";
import AddAdvertisement from "./components/user/AddAdvertisement";
import UserProfile from "./components/user/UserProfile";

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

        <Route
          path="/admin/change-role"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <ChangeRole />
            </PrivateRoute>
          }
        />

        <Route path="/userpanel" element={<UserPanel />} />
        <Route path="/user/addadvertisement" element={<AddAdvertisement />} />
        <Route path="/user/addadvertisements" element={<AddAdvertisement />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/unauthorized" element={<h2>Brak dostępu</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
