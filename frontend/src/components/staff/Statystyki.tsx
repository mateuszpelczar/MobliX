import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/StaffPanel.css";

import {
  User,
  ChevronDown,
  ShoppingBag,
  Star,
  BarChart3,
  TrendingUp,
  Search,
  Smartphone,
  Eye,
  Filter,
  Award,
  Users,
  Activity,
  Clock,
  MessageSquare,
  Shield,
  LogOut,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const Statystyki: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  // Check user role from JWT token
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        {/* Logo in top left */}
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={handleLogoClick}
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

      {/* Content: purple background with white card */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12 max-w-7xl">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 280px)",
              scrollbarWidth: "thin",
              scrollbarColor: "#8B5CF6 #F3F4F6",
            }}
          >
            {/* Header with gradient */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Statystyki Wyszukiwań i Marek
                </h1>
                <p className="text-sm text-gray-600">
                  Analiza popularności marek smartfonów i trendów wyszukiwań
                </p>
              </div>
            </div>

            {/* Search Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Wyszukiwania dzisiaj
                    </p>
                    <p className="text-2xl font-bold text-blue-800">2,847</p>
                    <p className="text-blue-500 text-xs">+18% od wczoraj</p>
                  </div>
                  <Search className="w-10 h-10 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Searched Brands */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Najczęściej wyszukiwane marki
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <span className="text-gray-800 font-medium">
                        Apple iPhone
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-600 font-semibold text-lg">
                        892
                      </span>
                      <p className="text-xs text-gray-500">wyszukiwań/dzień</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <span className="text-gray-800 font-medium">
                        Samsung Galaxy
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold text-lg">
                        647
                      </span>
                      <p className="text-xs text-gray-500">wyszukiwań/dzień</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <span className="text-gray-800 font-medium">Xiaomi</span>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-600 font-semibold text-lg">
                        423
                      </span>
                      <p className="text-xs text-gray-500">wyszukiwań/dzień</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        4
                      </div>
                      <span className="text-gray-800 font-medium">Huawei</span>
                    </div>
                    <div className="text-right">
                      <span className="text-purple-600 font-semibold text-lg">
                        312
                      </span>
                      <p className="text-xs text-gray-500">wyszukiwań/dzień</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Most Listed Brands */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Najczęściej wystawiane marki
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <span className="text-gray-800 font-medium">Samsung</span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-600 font-semibold text-lg">
                        1,247
                      </span>
                      <p className="text-xs text-gray-500">
                        aktywnych ogłoszeń
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <span className="text-gray-800 font-medium">Apple</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-semibold text-lg">
                        934
                      </span>
                      <p className="text-xs text-gray-500">
                        aktywnych ogłoszeń
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <span className="text-gray-800 font-medium">Xiaomi</span>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-600 font-semibold text-lg">
                        678
                      </span>
                      <p className="text-xs text-gray-500">
                        aktywnych ogłoszeń
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        4
                      </div>
                      <span className="text-gray-800 font-medium">OnePlus</span>
                    </div>
                    <div className="text-right">
                      <span className="text-purple-600 font-semibold text-lg">
                        445
                      </span>
                      <p className="text-xs text-gray-500">
                        aktywnych ogłoszeń
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Trends */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Trendy wyszukiwań
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">iPhone 15 Pro</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-green-600 font-semibold text-sm">
                        +45%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">Samsung Galaxy S24</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-3/5 h-full bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm">
                        +32%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">Xiaomi 14 Ultra</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-2/5 h-full bg-orange-500 rounded-full"></div>
                      </div>
                      <span className="text-orange-600 font-semibold text-sm">
                        +28%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">Google Pixel 8</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/5 h-full bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-purple-600 font-semibold text-sm">
                        +15%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Range Analysis */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Analiza cen wyszukiwanych
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">0 - 500 zł</span>
                    <span className="font-semibold text-green-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">500 - 1500 zł</span>
                    <span className="font-semibold text-blue-600">41%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">1500 - 3000 zł</span>
                    <span className="font-semibold text-orange-600">28%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <span className="text-gray-600">3000+ zł</span>
                    <span className="font-semibold text-purple-600">8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Search Activity */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Ostatnia aktywność wyszukiwań
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-white rounded border">
                  <Search className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Wyszukiwanie: "iPhone 15 Pro Max 256GB"
                    </p>
                    <p className="text-xs text-gray-500">
                      2 minuty temu · 23 wyniki
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded border">
                  <Eye className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Popularne: "Samsung Galaxy S24 Ultra"
                    </p>
                    <p className="text-xs text-gray-500">
                      5 minut temu · 67 wyników
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded border">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Trending: "Xiaomi 14 Pro"
                    </p>
                    <p className="text-xs text-gray-500">
                      12 minut temu · 34 wyniki
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded border">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Szpik wyszukiwań o 14:30
                    </p>
                    <p className="text-xs text-gray-500">
                      30 minut temu · 156 wyszukiwań/min
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

export default Statystyki;
