import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
  Star,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  FileEdit,
  BarChart3,
  UserCheck,
  Edit3,
  Activity,
  Crown,
} from "lucide-react";
import "../styles/MobileResponsive.css";
import "../styles/AdminPanel.css";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.role;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF";
  const isUser = userRole === "USER";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        {/* Logo in top left */}
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/main")}
          style={{ userSelect: "none" }}
        >
          MobliX
        </div>
        {/* Account dropdown in top right corner */}
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button"
            >
              <User className="w-4 h-4" />
              Twoje konto
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="py-1">
                  <button
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/your-ads");
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 text-blue-600" />
                    Ogłoszenia
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/message");
                    }}
                  >
                    <MessageSquare className="w-4 h-4 text-green-600" />
                    Czat
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/ratings");
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    Oceny
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/personaldetails");
                    }}
                  >
                    <User className="w-4 h-4 text-purple-600" />
                    Profil
                  </button>
                  {isAdmin && (
                    <button
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <Shield className="w-4 h-4 text-red-600" />
                      Panel administratora
                    </button>
                  )}
                  {(isAdmin || isStaff) && (
                    <button
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/staffpanel");
                      }}
                    >
                      <Users className="w-4 h-4 text-orange-600" />
                      Panel pracownika
                    </button>
                  )}
                  {(isAdmin || isStaff || isUser) && (
                    <button
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/userpanel");
                      }}
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      Panel użytkownika
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="dropdown-logout flex items-center gap-3 px-4 py-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main content with modern design */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-[220px] pb-16 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Crown className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Panel Administratora
                  </h1>
                  <p className="text-purple-100">
                    Pełna kontrola nad platformą MobliX
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 admin-content max-h-[calc(100vh-320px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Zarządzaj kontami */}
                <button
                  onClick={() => navigate("/admin/change-role")}
                  className="admin-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#3b82f6",
                      "--card-color-2": "#1d4ed8",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="admin-card-icon bg-white/20 p-4 rounded-full">
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Zarządzaj kontami
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Kontrola ról użytkowników i uprawnień
                      </p>
                    </div>
                  </div>
                </button>

                {/* Edytuj ogłoszenie */}
                <button
                  onClick={() => navigate("/admin/edit-ad")}
                  className="admin-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#8b5cf6",
                      "--card-color-2": "#7c3aed",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="admin-card-icon bg-white/20 p-4 rounded-full">
                      <Edit3 className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Edytuj ogłoszenia
                      </h3>
                      <p className="text-purple-100 text-sm">
                        Moderacja i edycja treści ogłoszeń
                      </p>
                    </div>
                  </div>
                </button>

                {/* Logi systemowe */}
                <button
                  onClick={() => navigate("/admin/system-logs")}
                  className="admin-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#10b981",
                      "--card-color-2": "#059669",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="admin-card-icon bg-white/20 p-4 rounded-full">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Logi systemowe</h3>
                      <p className="text-green-100 text-sm">
                        Monitorowanie aktywności systemu
                      </p>
                    </div>
                  </div>
                </button>

                {/* Zarządzaj treściami */}
                <button
                  onClick={() => navigate("/admin/manage-content")}
                  className="admin-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#ec4899",
                      "--card-color-2": "#db2777",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="admin-card-icon bg-white/20 p-4 rounded-full">
                      <FileEdit className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Zarządzaj treściami
                      </h3>
                      <p className="text-pink-100 text-sm">
                        Edycja stron i zawartości witryny
                      </p>
                    </div>
                  </div>
                </button>

                {/* Raporty */}
                <button
                  onClick={() => navigate("/admin/raports")}
                  className="admin-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#f59e0b",
                      "--card-color-2": "#d97706",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="admin-card-icon bg-white/20 p-4 rounded-full">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Raporty</h3>
                      <p className="text-amber-100 text-sm">
                        Analityka i szczegółowe raporty
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Admin Dashboard Stats */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Statystyki systemu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="text-sm text-blue-600 font-medium">
                          Użytkownicy
                        </div>
                        <div className="text-xl font-bold text-blue-800">
                          2,547
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="text-sm text-green-600 font-medium">
                          Ogłoszenia
                        </div>
                        <div className="text-xl font-bold text-green-800">
                          12,431
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* White footer bar at bottom */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xs xs:text-sm sm:text-base px-1 sm:px-2">
          <a
            href="/zasady-bezpieczenstwa"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Zasady bezpieczeństwa
          </a>

          <a
            href="/jak-dziala-moblix"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Jak działa MobliX
          </a>
          <a
            href="/regulamin"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Regulamin
          </a>
          <a
            href="/polityka-cookies"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Polityka cookies
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
