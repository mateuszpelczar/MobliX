import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPanel from "./components/MainPanel";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PrivateRoute from "./routes/PrivateRoutes";
import ChangeRole from "./components/admin/ChangeRole";
import SystemLogs from "./components/admin/SystemLogs";
import Raports from "./components/admin/Raports";
import AddAdvertisement from "./components/user/AddAdvertisement";
import PersonalDetails from "./components/user/PersonalDetails";
import EditAd from "./components/staff/EditAd";
import UserEditAd from "./components/user/editAd";
import JakDzialaMoblix from "./components/overall/JakDzialaMoblix";
import ZasadyBezpieczeństwa from "./components/overall/ZasadyBezpieczeństwa";
import Regulamin from "./components/overall/Regulamin";
import PolitykaCookies from "./components/overall/PolitykaCookies";
import SmartphoneCatalog from "./components/overall/SmartphoneCatalog";
import SmartphoneDetails from "./components/overall/SmartphoneDetails";
import ManageContent from "./components/admin/ManageContent";
import Message from "./components/user/Message";
import Notifications from "./components/user/Notifications";
import WatchedAds from "./components/user/WatchedAds";
import YourAds from "./components/user/YourAds";
import StaffPanel from "./components/StaffPanel";
import ModeracjaOgloszen from "./components/staff/ModeracjaOgloszen";
import Statystyki from "./components/staff/Statystyki";
import ModeracjaUzytkownikow from "./components/staff/ModeracjaUzytkownikow";
import ModeracjaZgloszen from "./components/staff/ModeracjaZgloszen";
import ForgotPassword from "./auth/ForgotPassword";
import ResetPassword from "./auth/ResetPassword";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPanel />} />

        {/* Login i Register jako overlay na MainPanel */}
        <Route
          path="/login"
          element={
            <>
              <MainPanel />
              <Login />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <MainPanel />
              <Register />
            </>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/main" element={<MainPanel />} />

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
        <Route
          path="/admin/system-logs"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <SystemLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/raports"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <Raports />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/edit-ad"
          element={
            <PrivateRoute requiredRole={["ADMIN", "STAFF"]}>
              <EditAd />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff/edit-ad/:id"
          element={
            <PrivateRoute requiredRole={["ADMIN", "STAFF"]}>
              <EditAd />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-content"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <ManageContent />
            </PrivateRoute>
          }
        />

        <Route path="/userpanel" element={<UserPanel />} />
        <Route path="/staffpanel" element={<StaffPanel />} />
        <Route path="/user/addadvertisement" element={<AddAdvertisement />} />

        <Route path="/user/personaldetails" element={<PersonalDetails />} />
        <Route path="/user/editAd" element={<UserEditAd />} />
        <Route path="/user/edit-ad/:id" element={<UserEditAd />} />
        <Route path="/user/message" element={<Message />} />
        <Route path="/jak-dziala-moblix" element={<JakDzialaMoblix />} />
        <Route path="/user/notifications" element={<Notifications />} />
        <Route path="/user/watchedads" element={<WatchedAds />} />
        <Route path="/user/your-ads" element={<YourAds />} />
        <Route path="/user/mainpanel" element={<MainPanel />} />

        {/* Smartphone routes */}
        <Route path="/smartfony" element={<SmartphoneCatalog />} />
        <Route path="/smartfon/:id" element={<SmartphoneDetails />} />

        <Route
          path="/staff/moderacja-zgloszen"
          element={<ModeracjaZgloszen />}
        />

        <Route
          path="/staff/moderacja-uzytkownikow"
          element={<ModeracjaUzytkownikow />}
        />

        <Route path="/staff/statystyki" element={<Statystyki />} />
        <Route
          path="/staff/moderacja-ogloszen"
          element={<ModeracjaOgloszen />}
        />

        <Route
          path="/zasady-bezpieczenstwa"
          element={<ZasadyBezpieczeństwa />}
        />
        <Route path="/regulamin" element={<Regulamin />} />
        <Route path="/polityka-cookies" element={<PolitykaCookies />} />

        <Route path="/unauthorized" element={<h2>Brak dostępu</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
