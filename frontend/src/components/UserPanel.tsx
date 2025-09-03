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

      {/* Main content with large white box and user dashboard */}
      <div className="user-panel-content flex-grow w-full overflow-y-auto flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-12 lg:p-16 w-full max-w-6xl flex flex-col gap-6 sm:gap-8 md:gap-10">
          {/* Welcome Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Panel Użytkownika
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Zarządzaj swoimi ogłoszeniami i profilem w jednym miejscu
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-600">0</div>
              <div className="text-xs text-blue-500">Aktywne ogłoszenia</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-xl font-bold text-green-600">0</div>
              <div className="text-xs text-green-500">Wyświetlenia</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-xl font-bold text-purple-600">0</div>
              <div className="text-xs text-purple-500">Obserwowane</div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-xl font-bold text-orange-600">5.0</div>
              <div className="text-xs text-orange-500">Ocena</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Primary Actions */}
            <button
              onClick={() => navigate("/user/addadvertisement")}
              className="group bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 sm:py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Dodaj ogłoszenie</span>
              </div>
              <p className="text-pink-100 text-xs sm:text-sm">
                Sprzedaj swój telefon
              </p>
            </button>

            <button
              onClick={() => navigate("/user/your-ads")}
              className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-4 sm:py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Edit3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Twoje ogłoszenia</span>
              </div>
              <p className="text-yellow-100 text-xs sm:text-sm">
                Zarządzaj ofertami
              </p>
            </button>

            <button
              onClick={() => navigate("/user/message")}
              className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 sm:py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Wiadomości</span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm">
                Komunikacja z kupującymi
              </p>
            </button>

            {/* Secondary Actions */}
            <button
              onClick={() => navigate("/user/watched-ads")}
              className="group bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-4 sm:py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Eye className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Obserwowane</span>
              </div>
              <p className="text-teal-100 text-xs sm:text-sm">
                Ulubione oferty
              </p>
            </button>

            <button
              onClick={() => navigate("/user/notifications")}
              className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 sm:py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Powiadomienia</span>
              </div>
              <p className="text-red-100 text-xs sm:text-sm">
                Ważne informacje
              </p>
            </button>

            <button
              onClick={() => navigate("/user/personaldetails")}
              className="group bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 sm:py-6 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <User className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-base sm:text-lg">Profil</span>
              </div>
              <p className="text-indigo-100 text-xs sm:text-sm">Dane osobowe</p>
            </button>
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Ostatnia aktywność
              </h3>
            </div>
            <div className="text-gray-600 text-center py-8">
              <p>Brak ostatniej aktywności</p>
              <p className="text-sm text-gray-500 mt-1">
                Dodaj swoje pierwsze ogłoszenie!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xxs xs:text-xs sm:text-sm px-1 sm:px-2">
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
