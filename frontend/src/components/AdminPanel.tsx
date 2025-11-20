import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  FileEdit,
  BarChart3,
  UserCheck,
  Activity,
  Crown,
  Bell,
  Heart,
  Search,
  Plus,
} from "lucide-react";

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

  //statystyki w panelu
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAdvertisements: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchFavoriteCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/favorites", {
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

  //useEffect do pobierania statystyk w panelu
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:8080/api/admin/stats/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers || 0,
            activeAdvertisements: data.activeAds || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
    fetchFavoriteCount();
  }, []);

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

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      searchQuery.trim()
        ? `/smartfony?search=${searchQuery.trim()}`
        : "/smartfony"
    );
  };

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

          {/* Wyszukiwarka */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj smartfonów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

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
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/admin");
                        }}
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
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
                      onClick={handleLogout}
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
        <div className="max-w-6xl mx-auto">
          {/* Header z ikoną korony */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 flex items-center gap-4">
            <div className="bg-purple-600 p-4 rounded-full">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Panel Administratora
              </h1>
              <p className="text-gray-300">
                Pełna kontrola nad platformą MobliX
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Zarządzaj kontami */}
            <button
              onClick={() => navigate("/admin/change-role")}
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Zarządzaj kontami</h3>
                  <p className="text-blue-100 text-sm">
                    Kontrola ról użytkowników i uprawnień
                  </p>
                </div>
              </div>
            </button>

            {/* Logi systemowe */}
            <button
              onClick={() => navigate("/admin/system-logs")}
              className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
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
              className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
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
              className="bg-gradient-to-br from-amber-600 to-amber-800 p-6 rounded-lg text-white font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
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

          {/* Statystyki systemu */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Statystyki systemu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-white" />
                  <div>
                    <div className="text-sm text-blue-100 font-medium">
                      Użytkownicy
                    </div>
                    <div className="text-xl font-bold text-white">
                      {loadingStats ? "..." : stats.totalUsers.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-white" />
                  <div>
                    <div className="text-sm text-green-100 font-medium">
                      Aktywne ogłoszenia
                    </div>
                    <div className="text-xl font-bold text-white">
                      {loadingStats
                        ? "..."
                        : stats.activeAdvertisements.toLocaleString()}
                    </div>
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

export default AdminPanel;
