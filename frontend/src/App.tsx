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
import EditAd from "./components/admin/EditAd";
import UserEditAd from "./components/user/editAd";
import JakDzialaMoblix from "./components/overall/JakDzialaMoblix";
import PopularneWyszukiwania from "./components/overall/PopularneWyszukiwania";
import ZasadyBezpieczeństwa from "./components/overall/ZasadyBezpieczeństwa";
import Regulamin from "./components/overall/Regulamin";
import PolitykaCookies from "./components/overall/PolitykaCookies";
import UstawieniaPlikowCookies from "./components/overall/UstawieniaPlikowCookies";
import ManageContent from "./components/admin/ManageContent";
import Message from "./components/user/Message";
import Notifications from "./components/user/Notifications";
import WatchedAds from "./components/user/WatchedAds";
import YourAds from "./components/user/YourAds";
import Ratings from "./components/user/Ratings";

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
          path="/admin/edit-ad"
          element={
            <PrivateRoute requiredRole="ADMIN">
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
        <Route path="/user/addadvertisement" element={<AddAdvertisement />} />
        <Route path="/user/addadvertisements" element={<AddAdvertisement />} />
        <Route path="/user/personaldetails" element={<PersonalDetails />} />
        <Route path="/user/editAd" element={<UserEditAd />} />
        <Route path="/user/message" element={<Message />} />
        <Route path="/jak-dziala-moblix" element={<JakDzialaMoblix />} />
        <Route path="/user/notifications" element={<Notifications />} />
        <Route path="/user/watched-ads" element={<WatchedAds />} />
        <Route path="/user/your-ads" element={<YourAds />} />
        <Route path="/user/ratings" element={<Ratings />} />
        <Route
          path="/popularne-wyszukiwania"
          element={<PopularneWyszukiwania />}
        />
        <Route
          path="/zasady-bezpieczenstwa"
          element={<ZasadyBezpieczeństwa />}
        />
        <Route path="/regulamin" element={<Regulamin />} />
        <Route path="/polityka-cookies" element={<PolitykaCookies />} />
        <Route
          path="/ustawienia-plikow-cookies"
          element={<UstawieniaPlikowCookies />}
        />
        <Route path="/unauthorized" element={<h2>Brak dostępu</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
