import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Activity,
  Clock,
  MessageSquare,
  LogOut,
  DollarSign,
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

const Statystyki: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Check user role from JWT token
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

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

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={handleLogoClick}
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
                      <User className="w-4 h-4 text-red-600" />
                      Panel Admina
                    </button>
                  )}
                  {(isStaff || isAdmin) && (
                    <button
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/staff");
                      }}
                    >
                      <User className="w-4 h-4 text-orange-600" />
                      Panel Staff
                    </button>
                  )}
                  <button
                    className="dropdown-item w-full text-left bg-white text-red-600 flex items-center gap-3 px-4 py-2 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12 max-w-7xl">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto"
            style={{
              maxHeight: "calc(100vh - 280px)",
              scrollbarWidth: "thin",
              scrollbarColor: "#f97316 #F3F4F6",
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Statystyki Wyszukiwań
                </h1>
                <p className="text-sm text-gray-600">
                  Analiza popularności marek smartfonów i trendów wyszukiwań
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">
                          Wyszukiwania dzisiaj
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          {stats?.searchesToday || 0}
                        </p>
                      </div>
                      <Search className="w-10 h-10 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">
                          Unikalni użytkownicy
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {stats?.uniqueUsersToday || 0}
                        </p>
                      </div>
                      <User className="w-10 h-10 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium">
                          Anonimowe sesje
                        </p>
                        <p className="text-2xl font-bold text-orange-800">
                          {stats?.uniqueSessionsToday || 0}
                        </p>
                      </div>
                      <Eye className="w-10 h-10 text-orange-600" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">
                          Średnia cena (min)
                        </p>
                        <p className="text-2xl font-bold text-purple-800">
                          {stats?.priceAnalysis?.avgMinPrice || 0} zł
                        </p>
                      </div>
                      <DollarSign className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Main Statistics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Searched Brands */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Award className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Najczęściej wyszukiwane marki
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {stats?.topSearchedBrands?.length ? (
                        stats.topSearchedBrands
                          .slice(0, 10)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-white rounded border shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 bg-gradient-to-r ${getRankGradient(
                                    index
                                  )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                                >
                                  {index + 1}
                                </div>
                                <span className="text-gray-800 font-medium">
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
                                  wyszukiwań
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Brak danych o wyszukiwaniach
                        </p>
                      )}
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
                    <div className="space-y-3">
                      {stats?.topListedBrands?.length ? (
                        stats.topListedBrands
                          .slice(0, 10)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-white rounded border shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 bg-gradient-to-r ${getRankGradient(
                                    index
                                  )} rounded-full flex items-center justify-center text-white font-bold text-sm`}
                                >
                                  {index + 1}
                                </div>
                                <span className="text-gray-800 font-medium">
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
                                  ogłoszeń
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Brak danych o ogłoszeniach
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Search Trends (7 days) */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Trendy wyszukiwań (7 dni)
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {stats?.searchTrends?.length ? (
                        stats.searchTrends.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-white rounded border"
                          >
                            <span className="text-gray-600 text-sm">
                              {new Date(item.date).toLocaleDateString("pl-PL")}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (item.count /
                                        (stats.searchesToday || 1)) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-green-600 font-semibold text-sm min-w-[3rem] text-right">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Brak danych o trendach
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Analysis by Brand */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Filter className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        Analiza cen według marek
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {stats?.priceAnalysisByBrand?.length ? (
                        stats.priceAnalysisByBrand.map((item, index) => (
                          <div
                            key={index}
                            className="p-4 bg-white rounded border shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-800 font-medium">
                                {item.brand}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.searchCount} wyszukiwań
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-green-600">
                                Min: {Math.round(item.avgMinPrice)} zł
                              </span>
                              <span className="text-orange-600">
                                Max: {Math.round(item.avgMaxPrice)} zł
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Brak danych o cenach
                        </p>
                      )}
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
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {stats?.recentSearchActivity?.length ? (
                      stats.recentSearchActivity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 bg-white rounded border hover:shadow-md transition-shadow"
                        >
                          <Search className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 font-medium truncate">
                              {item.searchQuery ||
                                `${item.brand} ${item.model}`}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
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
                      <p className="text-gray-500 text-center py-4">
                        Brak ostatniej aktywności
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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
