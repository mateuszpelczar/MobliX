import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  ChevronDown,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  Search,
  Smartphone,
  Filter,
  Award,
  Activity,
  Clock,
  MessageSquare,
  LogOut,
  Shield,
  Users,
  Bell,
  Heart,
  Plus,
  LogIn,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface SearchStats {
  searchesToday: number;
  topSearchedBrands: Array<{ brand: string; count: number }>;
  topListedBrands: Array<{ brand: string; count: number }>;
  searchTrends: Array<{ date: string; count: number }>;
  priceAnalysis: { avgMinPrice: number; avgMaxPrice: number };
  priceAnalysisByBrand: Array<{
    brand: string;
    avgMinPrice: number;
    avgMaxPrice: number;
    searchCount: number;
  }>;
  priceRangesByBrand: Array<{
    brand: string;
    minPrice: number;
    maxPrice: number;
    count: number;
  }>;
  recentSearchActivity: Array<{
    id: number;
    searchQuery: string;
    brand: string;
    model: string;
    minPrice: number;
    maxPrice: number;
    createdAt: string;
    resultsCount: number;
  }>;
  uniqueUsersToday: number;
  uniqueSessionsToday: number;
  topSearchedModels: Array<{ model: string; count: number }>;
}

interface BrandPeriodStats {
  topBrands: Array<{ brand: string; count: number }>;
  sourceBreakdown: {
    [brand: string]: {
      navbar?: number;
      catalog_search?: number;
      catalog_filter?: number;
    };
  };
  period: string;
}

const Statystyki: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");
  const [brandPeriodStats, setBrandPeriodStats] =
    useState<BrandPeriodStats | null>(null);

  // Fetch search statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<SearchStats>(
          "http://localhost:8080/api/search-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching search stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
    fetchFavoriteCount();
    fetchBrandsByPeriod("today");
  }, []);

  // Fetch brands by period
  const fetchBrandsByPeriod = async (period: "today" | "week" | "month") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<BrandPeriodStats>(
        `http://localhost:8080/api/search-stats/top-brands-by-period?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBrandPeriodStats(response.data);
    } catch (error) {
      console.error("Error fetching brand period stats:", error);
    }
  };

  // Handle period change
  const handlePeriodChange = (period: "today" | "week" | "month") => {
    setSelectedPeriod(period);
    fetchBrandsByPeriod(period);
  };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (query || true) {
      // Log search from navbar
      if (query) {
        try {
          const token = localStorage.getItem("token");
          let userId = null;

          if (token) {
            try {
              const decoded = jwtDecode<JwtPayLoad>(token);
              userId = decoded.sub ? parseInt(decoded.sub) : null;
            } catch (error) {
              console.error("Error decoding token:", error);
            }
          }

          await axios.post("http://localhost:8080/api/search-logs", {
            searchQuery: query,
            brand: null,
            model: null,
            minPrice: null,
            maxPrice: null,
            userId: userId,
            sessionId: null,
            resultsCount: null,
            searchSource: "navbar",
          });
        } catch (error) {
          console.error("Error logging search:", error);
        }
      }

      navigate(query ? `/smartfony?search=${query}` : "/smartfony");
    }
  };

  // Check user role from JWT token
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isStaff = false;
  let isUser = false;
  let isAuthenticated = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const handleAddAdClick = () => {
    if (isAuthenticated) {
      navigate("/user/addadvertisement");
    } else {
      navigate("/login");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "przed chwilą";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    return date.toLocaleDateString("pl-PL");
  };

  // Get gradient color by rank
  const getRankGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-yellow-500 to-yellow-600",
      "from-red-500 to-red-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-cyan-500 to-cyan-600",
    ];
    return gradients[index % gradients.length];
  };

  const getRankColor = (index: number) => {
    const colors = [
      "text-blue-600",
      "text-green-600",
      "text-orange-600",
      "text-purple-600",
      "text-pink-600",
      "text-yellow-600",
      "text-red-600",
      "text-indigo-600",
      "text-teal-600",
      "text-cyan-600",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
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
            {/* Ikona czatu */}
            <button
              onClick={handleMessengerClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Ikona powiadomień */}
            <button
              onClick={handleNotificationsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>

            {/* Ikona ulubionych */}
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

            {/* Przycisk dodaj ogłoszenie */}
            <button
              onClick={handleAddAdClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj ogłoszenie
            </button>

            {/* Dropdown Twoje konto */}
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
                <div className="absolute right-0 mt-2 w-56 bg-purple-600 rounded-lg shadow-xl py-2 z-50">
                  {token ? (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/your-ads");
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        Ogłoszenia
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/message");
                        }}
                      >
                        <MessageSquare className="w-4 h-4 text-green-400" />
                        Chat
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/personaldetails");
                        }}
                      >
                        <User className="w-4 h-4 text-purple-300" />
                        Profil
                      </button>
                      {isAdmin && (
                        <button
                          onClick={handleGoToAdminPanel}
                          className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        >
                          <Shield className="w-4 h-4 text-red-400" />
                          Panel administratora
                        </button>
                      )}
                      {(isAdmin || isStaff) && (
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
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
                          className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
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
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full text-left px-4 py-2 bg-black hover:bg-black flex items-center gap-3 text-white rounded-lg"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn className="w-4 h-4 text-white" />
                      Zaloguj się
                    </button>
                  )}
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
                  Statystyki Wyszukiwań
                </h1>
                <p className="text-gray-300">
                  Analiza zachowań użytkowników i trendów wyszukiwania
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Wyszukiwania dzisiaj
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {stats?.searchesToday || 0}
                  </p>
                </div>
                <Search className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </div>

          {/* Main Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Searched Brands with Period Tabs */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">
                  Najczęściej wyszukiwane marki
                </h3>
              </div>

              {/* Period Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handlePeriodChange("today")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === "today"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Dzisiaj
                </button>
                <button
                  onClick={() => handlePeriodChange("week")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === "week"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  W tym tygodniu
                </button>
                <button
                  onClick={() => handlePeriodChange("month")}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedPeriod === "month"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  W tym miesiącu
                </button>
              </div>

              <div className="space-y-3">
                {brandPeriodStats?.topBrands?.length ? (
                  brandPeriodStats.topBrands.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-700 rounded border border-gray-600 hover:border-purple-500 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${getRankGradient(
                              index
                            )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">
                            {item.brand}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`${getRankColor(
                              index
                            )} font-semibold text-lg`}
                          >
                            {item.count}
                          </span>
                          <p className="text-xs text-gray-400">wyszukiwań</p>
                        </div>
                      </div>
                      {/* Source breakdown */}
                      {brandPeriodStats.sourceBreakdown[item.brand] && (
                        <div className="flex gap-2 text-xs mt-2">
                          {brandPeriodStats.sourceBreakdown[item.brand]
                            .navbar && (
                            <span className="bg-blue-600 text-white px-2 py-1 rounded">
                              Pasek nawigacji:{" "}
                              {
                                brandPeriodStats.sourceBreakdown[item.brand]
                                  .navbar
                              }
                            </span>
                          )}
                          {brandPeriodStats.sourceBreakdown[item.brand]
                            .catalog_search && (
                            <span className="bg-green-600 text-white px-2 py-1 rounded">
                              Wyszukiwarka:{" "}
                              {
                                brandPeriodStats.sourceBreakdown[item.brand]
                                  .catalog_search
                              }
                            </span>
                          )}
                          {brandPeriodStats.sourceBreakdown[item.brand]
                            .catalog_filter && (
                            <span className="bg-orange-600 text-white px-2 py-1 rounded">
                              Filtry:{" "}
                              {
                                brandPeriodStats.sourceBreakdown[item.brand]
                                  .catalog_filter
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Brak danych o wyszukiwaniach
                  </p>
                )}
              </div>
            </div>

            {/* Most Listed Brands */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Najczęściej wystawiane marki
                </h3>
              </div>
              <div className="space-y-3">
                {stats?.topListedBrands?.length ? (
                  stats.topListedBrands.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded border border-gray-600 hover:border-purple-500 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${getRankGradient(
                            index
                          )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-white font-medium">
                          {item.brand}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`${getRankColor(
                            index
                          )} font-semibold text-lg`}
                        >
                          {item.count}
                        </span>
                        <p className="text-xs text-gray-500">
                          ogłoszeń aktywnych
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Brak danych o ogłoszeniach
                  </p>
                )}
              </div>
            </div>

            {/* Search Trends (7 days) */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">
                  Trendy wyszukiwań (7 dni)
                </h3>
              </div>
              <div className="space-y-3">
                {stats?.searchTrends?.length ? (
                  stats.searchTrends.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-700 rounded border border-gray-600"
                    >
                      <span className="text-gray-300 text-sm">
                        {new Date(item.date).toLocaleDateString("pl-PL")}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                (item.count / (stats.searchesToday || 1)) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-green-400 font-semibold text-sm min-w-[3rem] text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Brak danych o trendach
                  </p>
                )}
              </div>
            </div>

            {/* Price Ranges by Brand */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  Najczęściej wyszukiwane przedziały cenowe według marek
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.priceRangesByBrand?.length ? (
                  stats.priceRangesByBrand.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-700 rounded border border-gray-600 hover:border-purple-500 transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${getRankGradient(
                              index
                            )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">
                            {item.brand}
                          </span>
                        </div>
                        <span className="text-xs text-purple-400 font-semibold">
                          {item.count} wyszukiwań
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-300">
                          {item.minPrice?.toLocaleString()} -{" "}
                          {item.maxPrice?.toLocaleString()} zł
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Brak danych o przedziałach cenowych
                  </p>
                )}
              </div>
            </div>

            {/* Recent Search Activity */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Ostatnia aktywność wyszukiwań
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recentSearchActivity?.length ? (
                  stats.recentSearchActivity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-gray-700 rounded border border-gray-600 hover:border-purple-500 transition-all"
                    >
                      <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {item.searchQuery || `${item.brand} ${item.model}`}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.createdAt)}
                          </span>
                          {item.resultsCount !== null && (
                            <span>· {item.resultsCount} wyników</span>
                          )}
                          {item.minPrice && item.maxPrice && (
                            <span>
                              · {item.minPrice}-{item.maxPrice} zł
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Brak ostatniej aktywności
                  </p>
                )}
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
              href="/jak-dziala-moblix"
              className="hover:text-purple-400 transition-colors"
            >
              Jak działa MobliX
            </a>
            <a
              href="/polityka-cookies"
              className="hover:text-purple-400 transition-colors"
            >
              Polityka cookies
            </a>
            <a
              href="/regulamin"
              className="hover:text-purple-400 transition-colors"
            >
              Regulamin
            </a>
            <a
              href="/zasady-bezpieczenstwa"
              className="hover:text-purple-400 transition-colors"
            >
              Zasady bezpieczeństwa
            </a>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2024 MobliX. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Statystyki;
