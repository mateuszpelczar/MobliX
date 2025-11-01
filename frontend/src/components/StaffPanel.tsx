import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MobileResponsive.css";
import "../styles/StaffPanel.css";
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
  Eye,
  CheckCircle,
  BarChart3,
  UserCheck,
  Flag,
} from "lucide-react";

const StaffPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Panel Pracownika
                  </h1>
                  <p className="text-orange-100">
                    Zarządzaj treścią i wspieraj użytkowników
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 staff-content max-h-[calc(100vh-320px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* Moderacja ogłoszeń */}
                <button
                  onClick={() => navigate("/staff/moderacja-ogloszen")}
                  className="staff-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#3b82f6",
                      "--card-color-2": "#1d4ed8",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="staff-card-icon bg-white/20 p-4 rounded-full">
                      <Eye className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Moderacja ogłoszeń
                      </h3>
                      <p className="text-blue-100 text-sm">
                        Przeglądaj i zatwierdzaj nowe ogłoszenia
                      </p>
                    </div>
                  </div>
                </button>

                {/* Moderacja użytkowników */}
                <button
                  onClick={() => navigate("/staff/moderacja-uzytkownikow")}
                  className="staff-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#8b5cf6",
                      "--card-color-2": "#7c3aed",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="staff-card-icon bg-white/20 p-4 rounded-full">
                      <Users className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Moderacja użytkowników
                      </h3>
                      <p className="text-purple-100 text-sm">
                        Zarządzaj kontami użytkowników
                      </p>
                    </div>
                  </div>
                </button>

                {/* Moderacja zgłoszeń */}
                <button
                  onClick={() => navigate("/staff/moderacja-zgloszen")}
                  className="staff-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  style={
                    {
                      "--card-color-1": "#dc2626",
                      "--card-color-2": "#b91c1c",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="staff-card-icon bg-white/20 p-4 rounded-full">
                      <Flag className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">
                        Moderacja zgłoszeń
                      </h3>
                      <p className="text-red-100 text-sm">
                        Rozpatruj zgłoszenia użytkowników
                      </p>
                    </div>
                  </div>
                </button>

                {/* Statystyki */}
                <button
                  onClick={() => navigate("/staff/statystyki")}
                  className="staff-card p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl md:col-span-2 lg:col-span-1"
                  style={
                    {
                      "--card-color-1": "#6366f1",
                      "--card-color-2": "#4f46e5",
                    } as React.CSSProperties
                  }
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="staff-card-icon bg-white/20 p-4 rounded-full">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-2">Statystyki</h3>
                      <p className="text-indigo-100 text-sm">
                        Analizuj wyniki i trendy
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Quick Stats Section */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="text-sm text-blue-600 font-medium">
                        Oczekujące ogłoszenia
                      </div>
                      <div className="text-xl font-bold text-blue-800">12</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="text-sm text-green-600 font-medium">
                        Zatwierdzone
                      </div>
                      <div className="text-xl font-bold text-green-800">
                        147
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="text-sm text-purple-600 font-medium">
                        Aktywni użytkownicy
                      </div>
                      <div className="text-xl font-bold text-purple-800">
                        1,234
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                  <div className="flex items-center gap-3">
                    <Flag className="w-6 h-6 text-red-600" />
                    <div>
                      <div className="text-sm text-red-600 font-medium">
                        Zgłoszenia
                      </div>
                      <div className="text-xl font-bold text-red-800">3</div>
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

export default StaffPanel;
