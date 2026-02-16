import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
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
  Edit3,
  Bell,
  Heart,
  Plus,
} from "lucide-react";
import SearchBar from "./overall/SearchBar";

interface StaffStats {
  pendingAdvertisements: number;
  approvedAdvertisements: number;
  activeUsers: number;
  pendingReports: number;
}

const StaffPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [stats, setStats] = useState<StaffStats>({
    pendingAdvertisements: 0,
    approvedAdvertisements: 0,
    activeUsers: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pobierz statystyki przy ładowaniu komponentu
  useEffect(() => {
    fetchStats();
    fetchFavoriteCount();
  }, []);

  const fetchFavoriteCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("=== FETCHING STAFF STATS ===");
      console.log("Token:", token ? "exists" : "missing");

      // Sprawdź rolę użytkownika
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          console.log("Decoded token role:", decoded.role);
          console.log("Full decoded token:", decoded);
        } catch (e) {
          console.error("Failed to decode token:", e);
        }
      }

      const response = await axios.get<StaffStats>(
        `${import.meta.env.VITE_API_URL}/api/admin/stats/staff`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Stats response:", response.data);
      setStats(response.data);
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };
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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Czarny pasek nawigacji */}
      <nav className="bg-black text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors"
            onClick={() => navigate("/main")}
          >
            MobliX
          </div>

          {/* Wyszukiwarka z AI */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMessengerClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <button
              onClick={handleNotificationsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>
            <button
              onClick={handleWatchedAdsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Ulubione ogłoszenia"
            >
              <Heart className="w-6 h-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {favoriteCount > 9 ? "9+" : favoriteCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/user/addadvertisement")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj ogłoszenie
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                Twoje konto
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-purple-600 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/user/your-ads");
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      Ogłoszenia
                    </button>
                    <button
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/user/message");
                      }}
                    >
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      Czat
                    </button>
                    <button
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/user/personaldetails");
                      }}
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      Profil
                    </button>
                    {isAdmin && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <Shield className="w-4 h-4 text-red-400" />
                        Panel administratora
                      </button>
                    )}
                    {(isAdmin || isStaff) && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/staffpanel");
                        }}
                      >
                        <Users className="w-4 h-4 text-orange-400" />
                        Panel pracownika
                      </button>
                    )}
                    {(isAdmin || isStaff || isUser) && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/userpanel");
                        }}
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        Panel użytkownika
                      </button>
                    )}
                    <div className="border-t border-purple-400 my-1"></div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Wyloguj
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header z ikoną Users */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-600 p-4 rounded-full">
                <Users className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Panel Pracownika
                </h1>
                <p className="text-gray-300">
                  Zarządzaj treścią i wspieraj użytkowników
                </p>
              </div>
            </div>
          </div>

          {/* Grid kart funkcji */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Moderacja ogłoszeń */}
            <button
              onClick={() => navigate("/staff/moderacja-ogloszen")}
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Eye className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Moderacja ogłoszeń</h3>
                  <p className="text-blue-100 text-sm">
                    Przeglądaj i zatwierdzaj nowe ogłoszenia
                  </p>
                </div>
              </div>
            </button>

            {/* Edytuj ogłoszenie */}
            <button
              onClick={() => navigate("/staff/edit-ad")}
              className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Edit3 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Edytuj ogłoszenia</h3>
                  <p className="text-purple-100 text-sm">
                    Moderacja i edycja treści ogłoszeń
                  </p>
                </div>
              </div>
            </button>

            {/* Moderacja użytkowników */}
            <button
              onClick={() => navigate("/staff/moderacja-uzytkownikow")}
              className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Users className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Moderacja użytkowników
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    Zarządzaj kontami użytkowników
                  </p>
                </div>
              </div>
            </button>

            {/* Moderacja zgłoszeń */}
            <button
              onClick={() => navigate("/staff/moderacja-zgloszen")}
              className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Flag className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Moderacja zgłoszeń</h3>
                  <p className="text-red-100 text-sm">
                    Rozpatruj zgłoszenia użytkowników
                  </p>
                </div>
              </div>
            </button>

            {/* Statystyki */}
            <button
              onClick={() => navigate("/staff/statystyki")}
              className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 md:col-span-2 lg:col-span-1"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">Statystyki</h3>
                  <p className="text-orange-100 text-sm">
                    Analizuj wyniki i trendy
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-white" />
                <div>
                  <div className="text-sm text-blue-100 font-medium">
                    Oczekujące ogłoszenia
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.pendingAdvertisements}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-white" />
                <div>
                  <div className="text-sm text-green-100 font-medium">
                    Zatwierdzone
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.approvedAdvertisements}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="w-8 h-8 text-white" />
                <div>
                  <div className="text-sm text-purple-100 font-medium">
                    Aktywni użytkownicy
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.activeUsers}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-lg shadow-lg">
              <div className="flex items-center gap-3">
                <Flag className="w-8 h-8 text-white" />
                <div>
                  <div className="text-sm text-red-100 font-medium">
                    Zgłoszenia
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {loading ? "..." : stats.pendingReports}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Czarna stopka jak w MainPanel */}
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <a
              href="/zasady-bezpieczenstwa"
              className="hover:text-purple-400 transition-colors"
            >
              Zasady bezpieczeństwa
            </a>
            <a
              href="/jak-dziala-moblix"
              className="hover:text-purple-400 transition-colors"
            >
              Jak działa MobliX
            </a>
            <a
              href="/regulamin"
              className="hover:text-purple-400 transition-colors"
            >
              Regulamin
            </a>
            <a
              href="/polityka-cookies"
              className="hover:text-purple-400 transition-colors"
            >
              Polityka cookies
            </a>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2024 MobliX. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StaffPanel;
