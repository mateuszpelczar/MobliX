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
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { smartphones as staticSmartphones } from "../overall/SmartphoneDetails";

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
    searchSource?: string;
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
  const [adsList, setAdsList] = useState<any[] | null>(null);

  // navbar-only count for today (preferred in blue card)
  const [navbarSearchesToday, setNavbarSearchesToday] = useState<number | null>(
    null
  );

  // helper to get auth headers if token present
  const getAuthHeaders = (): Record<string, string> | undefined => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  // Fetch main stats
  const fetchStats = async () => {
    try {
      const response = await axios.get<SearchStats>(
        "http://localhost:8080/api/search-stats",
        { headers: getAuthHeaders() }
      );
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching search stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch count of searches made from navbar today
  const fetchNavbarSearchesToday = async () => {
    try {
      const response = await axios.get<{ count: number }>(
        "http://localhost:8080/api/search-stats/navbar-count?period=today",
        { headers: getAuthHeaders() }
      );
      const count = response.data?.count ?? 0;
      setNavbarSearchesToday(count);
    } catch (err) {
      console.warn(
        "Failed to fetch navbar-only count, falling back to derive or 0",
        err
      );
      // Fallback: derive from recentSearchActivity if available
      try {
        const resp = await axios.get<SearchStats>(
          "http://localhost:8080/api/search-stats",
          { headers: getAuthHeaders() }
        );
        if (resp.data?.recentSearchActivity) {
          const today = new Date().toISOString().slice(0, 10);
          const count = resp.data.recentSearchActivity.filter((r) => {
            const createdDate = r.createdAt ? r.createdAt.slice(0, 10) : "";
            const srcRaw =
              (r as any).searchSource ??
              (r as any).search_source ??
              (r as any).source ??
              "";
            const src = srcRaw?.toString?.().toLowerCase?.().trim?.() ?? "";
            return createdDate === today && src === "navbar";
          }).length;
          setNavbarSearchesToday(count);
        } else {
          setNavbarSearchesToday(0);
        }
      } catch (e) {
        console.error("Fallback also failed:", e);
        setNavbarSearchesToday(0);
      }
    }
  };

  const fetchBrandsByPeriod = async (period: "today" | "week" | "month") => {
    try {
      const response = await axios.get<BrandPeriodStats>(
        `http://localhost:8080/api/search-stats/top-brands-by-period?period=${period}`,
        { headers: getAuthHeaders() }
      );
      setBrandPeriodStats(response.data);
    } catch (err) {
      console.error("Error fetching brand period stats:", err);
    }
  };

  const fetchFavoriteCount = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/favorites", {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteCount(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      console.error("Error fetching favorite count:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFavoriteCount();
    fetchBrandsByPeriod("today");
    fetchAdvertisementsList();
    fetchNavbarSearchesToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdvertisementsList = async () => {
    try {
      const response = await axios.get<any[]>(
        "http://localhost:8080/api/advertisements",
        { headers: getAuthHeaders() }
      );
      if (Array.isArray(response.data)) setAdsList(response.data);
    } catch (err) {
      console.warn("Failed to fetch advertisements for brand derivation", err);
      setAdsList([]);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    // always navigate (even if empty)
    if (query) {
      try {
        const token = localStorage.getItem("token");
        let userId: number | null = null;
        if (token) {
          try {
            const decoded = jwtDecode<JwtPayLoad>(token);
            userId = decoded.sub ? parseInt(decoded.sub) : null;
          } catch {
            userId = null;
          }
        }

        // Log search with explicit Authorization header (if required by backend)
        await axios.post(
          "http://localhost:8080/api/search-logs",
          {
            searchQuery: query,
            brand: null,
            model: null,
            minPrice: null,
            maxPrice: null,
            userId: userId,
            sessionId: null,
            resultsCount: null,
            searchSource: "navbar",
          },
          { headers: getAuthHeaders() }
        );

        // refresh navbar count immediately
        fetchNavbarSearchesToday();
      } catch (err) {
        console.error("Error logging navbar search:", err);
      }
    }

    navigate(
      query ? `/smartfony?search=${encodeURIComponent(query)}` : "/smartfony"
    );
  };

  // role checks
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
      isAuthenticated = true;
    } catch {
      // ignore
    }
  }

  const handleAddAdClick = () => {
    if (isAuthenticated) navigate("/user/addadvertisement");
    else navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");

  // Handle period change
  const handlePeriodChange = (period: "today" | "week" | "month") => {
    setSelectedPeriod(period);
    fetchBrandsByPeriod(period);
  };

  // helpers
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

  // Compute top listed brands with random tie-break for equal counts.
  // Limit to maximum 3 brands as requested.
  const topListedBrandsToShow = React.useMemo(() => {
    // Primary source: backend-provided topListedBrands
    let brands: Array<{ brand: string; count: number }> =
      stats?.topListedBrands && stats.topListedBrands.length > 0
        ? stats.topListedBrands.map((b) => ({ brand: b.brand, count: b.count }))
        : [];

    // Secondary: derive counts from live advertisements (only ACTIVE status)
    if ((!brands || brands.length === 0) && adsList && adsList.length > 0) {
      const map = new Map<string, number>();
      const activeAds = adsList.filter(
        (a) => (a.status || "").toString().toUpperCase() === "ACTIVE"
      );
      for (const ad of activeAds) {
        const b = (ad.specification?.brand || ad.specification?.marka || "")
          .toString()
          .trim();
        if (!b) continue;
        map.set(b, (map.get(b) || 0) + 1);
      }
      brands = Array.from(map.entries()).map(([brand, count]) => ({
        brand,
        count,
      }));
    }

    // Tertiary: fall back to topSearchedBrands if available
    if ((!brands || brands.length === 0) && stats?.topSearchedBrands) {
      brands = stats.topSearchedBrands.map((b) => ({
        brand: b.brand,
        count: b.count,
      }));
    }

    // Quaternary: derive from static fixtures (SmartphoneDetails.specifications.brand)
    if (
      (!brands || brands.length === 0) &&
      staticSmartphones &&
      staticSmartphones.length > 0
    ) {
      const map = new Map<string, number>();
      for (const s of staticSmartphones) {
        const b = (s.specifications?.brand || s.brand || "").toString().trim();
        if (!b) continue;
        map.set(b, (map.get(b) || 0) + 1);
      }
      brands = Array.from(map.entries()).map(([brand, count]) => ({
        brand,
        count,
      }));
    }

    // If still empty, show fallback defaults
    if (!brands || brands.length === 0) {
      const defaults = ["Samsung", "Apple", "Xiaomi", "Huawei", "Motorola"];
      for (let i = defaults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [defaults[i], defaults[j]] = [defaults[j], defaults[i]];
      }
      return defaults.slice(0, 3).map((brand) => ({ brand, count: 1 }));
    }

    // If every brand has exactly one listing, show 3 random ACTIVE ads (brands taken from them)
    const maxCount = Math.max(...brands.map((b) => b.count));
    if (maxCount === 1) {
      // Prefer active ads from backend, else static fixtures
      let pool: any[] = [];
      if (adsList && adsList.length > 0) {
        pool = adsList.filter(
          (a) => (a.status || "").toString().toUpperCase() === "ACTIVE"
        );
      }
      if (
        (!pool || pool.length === 0) &&
        staticSmartphones &&
        staticSmartphones.length > 0
      ) {
        pool = staticSmartphones as any[];
      }

      // Shuffle pool and pick up to 3
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const selected = pool.slice(0, 3);
      const result = selected
        .map((ad) => {
          const brand = (
            ad.specification?.brand ||
            ad.specifications?.brand ||
            ad.brand ||
            ""
          )?.toString();
          return brand ? { brand: brand.trim(), count: 1 } : null;
        })
        .filter(Boolean) as Array<{ brand: string; count: number }>;

      if (result.length > 0) return result;
    }

    // Otherwise sort by count desc, tie-break by random value, limit to 3
    const withRand = brands.map((b) => ({ ...b, _rand: Math.random() }));
    withRand.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a._rand - b._rand;
    });
    return withRand.slice(0, 3).map(({ _rand, ...rest }) => rest);
  }, [stats, adsList, staticSmartphones]);

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

  // value to show in blue card: prefer navbar-only number if available
  const blueCardCount =
    navbarSearchesToday !== null
      ? navbarSearchesToday
      : stats?.searchesToday ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Nav */}
      <nav className="bg-black text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div
            className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors"
            onClick={() => navigate("/main")}
          >
            MobliX
          </div>

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
              onClick={handleAddAdClick}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Dodaj ogłoszenie
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" /> Twoje konto{" "}
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

          {/* Blue card */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Wyszukiwania dzisiaj (tylko pasek nawigacji)
                  </p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {blueCardCount}
                  </p>
                </div>
                <Search className="w-12 h-12 text-white opacity-80" />
              </div>
            </div>
          </div>

          {/* Rest of stats grid (unchanged structure) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Searched Brands */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">
                  Najczęściej wyszukiwane marki
                </h3>
              </div>
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
                {topListedBrandsToShow?.length ? (
                  topListedBrandsToShow.map((item, index) => (
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

            {/* Recent search activity */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-7 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">
                  Ostatnia aktywność wyszukiwań
                </h3>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {stats?.recentSearchActivity?.length ? (
                  stats.recentSearchActivity.map((item) => {
                    const srcRaw =
                      (item as any).searchSource ??
                      (item as any).search_source ??
                      (item as any).source ??
                      "";
                    const src =
                      srcRaw?.toString?.().toLowerCase?.().trim?.() ?? "";
                    const sourceLabel =
                      src === "navbar"
                        ? "Pasek"
                        : src === "catalog_filter"
                        ? "Filtry"
                        : src;
                    const title =
                      item.searchQuery && item.searchQuery.trim() !== ""
                        ? item.searchQuery
                        : item.brand
                        ? `${item.brand}${item.model ? " " + item.model : ""}`
                        : "";

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-700 rounded border border-gray-600 hover:border-purple-500 transition-all"
                      >
                        <Search className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-medium truncate">
                              {title}
                            </p>
                            <span className="text-xs bg-gray-600 text-gray-100 px-2 py-0.5 rounded">
                              {sourceLabel}
                            </span>
                            {item.brand && src === "catalog_filter" && (
                              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                Marka: {item.brand}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                            {item.resultsCount !== null && (
                              <span>· {item.resultsCount} wyników</span>
                            )}
                            {item.minPrice != null && item.maxPrice != null && (
                              <span>
                                · {item.minPrice}-{item.maxPrice} zł
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
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

      {/* Footer */}
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
