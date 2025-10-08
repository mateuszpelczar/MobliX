import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  Plus,
  Edit3,
  User,
  Bell,
  Eye,
  BarChart3,
  ShoppingBag,
  Star,
  Heart,
  Clock,
  Shield,
  Users,
  LogOut,
  ChevronDown,
} from "lucide-react";
import "../styles/MobileResponsive.css";
import "../styles/UserPanel.css";

const UserPanel: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isStaff = userRole === "STAFF";

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div
          onClick={() => navigate("/main")}
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          style={{ userSelect: "none" }}
        >
          MobliX
        </div>
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
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
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
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Panel Użytkownika
                  </h1>
                  <p className="text-blue-100">
                    Zarządzaj swoimi ogłoszeniami i profilem
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 user-content max-h-[calc(100vh-320px)] overflow-y-auto">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                  <div className="flex items-center justify-center mb-2">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-blue-600">0</div>
                  <div className="text-xs text-blue-500">
                    Aktywne ogłoszenia
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-xl font-bold text-green-600">0</div>
                  <div className="text-xs text-green-500">Wyświetlenia</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-purple-500">Obserwowane</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center border border-orange-200">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-xl font-bold text-orange-600">5.0</div>
                  <div className="text-xs text-orange-500">Ocena</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Primary Actions */}
                <button
                  onClick={() => navigate("/user/addadvertisement")}
                  className="user-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#ec4899",
                      "--card-color-2": "#db2777",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="user-card-icon bg-white/20 p-4 rounded-full">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Dodaj ogłoszenie
                      </h3>
                      <p className="text-pink-100 text-sm">
                        Sprzedaj swój telefon
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/user/your-ads")}
                  className="user-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#f59e0b",
                      "--card-color-2": "#d97706",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="user-card-icon bg-white/20 p-4 rounded-full">
                      <Edit3 className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Twoje ogłoszenia
                      </h3>
                      <p className="text-amber-100 text-sm">
                        Zarządzaj ofertami
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/user/message")}
                  className="user-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#3b82f6",
                      "--card-color-2": "#1d4ed8",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="user-card-icon bg-white/20 p-4 rounded-full">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Wiadomości</h3>
                      <p className="text-blue-100 text-sm">
                        Komunikacja z kupującymi
                      </p>
                    </div>
                  </div>
                </button>

                {/* Secondary Actions */}
                <button
                  onClick={() => navigate("/user/watched-ads")}
                  className="user-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#10b981",
                      "--card-color-2": "#059669",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="user-card-icon bg-white/20 p-4 rounded-full">
                      <Eye className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Obserwowane</h3>
                      <p className="text-emerald-100 text-sm">
                        Ulubione oferty
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/user/notifications")}
                  className="user-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#dc2626",
                      "--card-color-2": "#b91c1c",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="user-card-icon bg-white/20 p-4 rounded-full">
                      <Bell className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Powiadomienia</h3>
                      <p className="text-red-100 text-sm">Ważne informacje</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate("/user/personaldetails")}
                  className="user-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#8b5cf6",
                      "--card-color-2": "#7c3aed",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="user-card-icon bg-white/20 p-4 rounded-full">
                      <User className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Profil</h3>
                      <p className="text-purple-100 text-sm">Dane osobowe</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Recent Activity Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Ostatnia aktywność
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                  <div className="text-gray-600 text-center py-8">
                    <p>Brak ostatniej aktywności</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Dodaj swoje pierwsze ogłoszenie!
                    </p>
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
            href="/popularne-wyszukiwania"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Popularne wyszukiwania
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
          <a
            href="/ustawienia-plikow-cookies"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Ustawienia plików cookies
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserPanel;
