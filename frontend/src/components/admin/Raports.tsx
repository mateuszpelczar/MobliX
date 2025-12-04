import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../SearchBar";
import {
  User,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Users,
  Activity,
  FileText,
  LogOut,
  Shield,
  Bell,
  Heart,
  Plus,
  Search,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeAds: number;
  todayActivity: number;
  newUsersLast7Days: number;
  activeUsersToday: number;
  newAdsLast24h: number;
  pendingModeration: number;
  activeReports: number;
  userGrowthPercent: number;
  adGrowthPercent: number;
  activityGrowthPercent: number;
}

const Raports: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

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

  useEffect(() => {
    fetchDashboardStats();
    fetchFavoriteCount();
  }, []);

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

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<DashboardStats>(
        "http://localhost:8080/api/admin/stats/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
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

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <Activity className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Ładowanie statystyk...</p>
        </div>
      </div>
    );
  }

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
          <SearchBar />

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
        <div className="max-w-7xl mx-auto">
          {/* Header z ikoną BarChart3 */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-4 rounded-full">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Raporty i Analiza
                </h1>
                <p className="text-gray-300">
                  Kompletne dane analityczne i statystyki systemu
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Wszyscy użytkownicy
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats?.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {formatPercent(stats?.userGrowthPercent || 0)} w tym
                    miesiącu
                  </p>
                </div>
                <Users className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Aktywne ogłoszenia
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats?.activeAds.toLocaleString()}
                  </p>
                  <p className="text-orange-200 text-xs mt-1">
                    {formatPercent(stats?.adGrowthPercent || 0)} w tym miesiącu
                  </p>
                </div>
                <ShoppingBag className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Aktywność dzisiaj
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats?.todayActivity.toLocaleString()}
                  </p>
                  <p className="text-purple-200 text-xs mt-1">
                    {formatPercent(stats?.activityGrowthPercent || 0)} od
                    wczoraj
                  </p>
                </div>
                <Activity className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Analytics */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Analiza użytkowników
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600">
                  <span className="text-gray-300">
                    Nowi użytkownicy (7 dni)
                  </span>
                  <span className="font-semibold text-blue-400">
                    {stats?.newUsersLast7Days}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600">
                  <span className="text-gray-300">Aktywni dzisiaj</span>
                  <span className="font-semibold text-green-400">
                    {stats?.activeUsersToday}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Reports */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Raporty zawartości
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600">
                  <span className="text-gray-300">Nowe ogłoszenia (24h)</span>
                  <span className="font-semibold text-blue-400">
                    {stats?.newAdsLast24h}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600">
                  <span className="text-gray-300">Oczekujące moderację</span>
                  <span className="font-semibold text-orange-400">
                    {stats?.pendingModeration}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600">
                  <span className="text-gray-300">Zgłoszenia</span>
                  <span className="font-semibold text-red-400">
                    {stats?.activeReports}
                  </span>
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

export default Raports;
