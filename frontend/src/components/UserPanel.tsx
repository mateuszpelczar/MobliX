import React, { useEffect, useState } from "react";
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
  Search,
} from "lucide-react";
import "../styles/MobileResponsive.css";
import "../styles/UserPanel.css";
import axios from "axios";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface UserActivity {
  id: number;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  details: string;
  source: string;
  userEmail: string;
  ipAddress: string;
}

const UserPanel: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

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

  const [stats, setStats] = useState({
    activeAds: 0,
    totalViews: 0,
    favorites: 0,
  });

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const fetchFavoriteCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await axios.get<{ count: number }>(
          "http://localhost:8080/api/favorites/count",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteCount(response.data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (query) {
      // Log search from navbar
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

      navigate(`/main?search=${encodeURIComponent(query)}`);
    }
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");

  useEffect(() => {
    fetchFavoriteCount();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }
        //pobranie statystyk aktywnych ogloszen i wszystkich wyswietlen danego uzytkownika
        const dashboardResponse = await axios.get<{
          activeAds: number;
          totalViews: number;
        }>("http://localhost:8080/api/advertisements/user/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        //pobranie liczby ulubionych ogloszen
        const favoritesResponse = await axios.get<{ count: number }>(
          "http://localhost:8080/api/favorites/count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats({
          activeAds: dashboardResponse.data?.activeAds || 0,
          totalViews: dashboardResponse.data?.totalViews || 0,
          favorites: favoritesResponse.data?.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  //pobranie ostatnich aktywnosci uzytkownika
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get<UserActivity[]>(
          "http://localhost:8080/api/logs/activities?limit=3",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActivities(response.data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, [navigate]);

  //formatowanie czasu
  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityDate = new Date(timestamp);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Przed chwila";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return activityDate.toLocaleDateString();
  };

  //wybor ikony na podstawie tresci wiadomosci
  const getActivityIcon = (message: string) => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes("dodano do ulubionych") ||
      lowerMessage.includes("ulubione")
    ) {
      return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
    } else if (
      lowerMessage.includes("usunięto z ulubionych") ||
      lowerMessage.includes("usunieto z ulubionych")
    ) {
      return <Heart className="w-5 h-5 text-gray-400" />;
    } else if (
      lowerMessage.includes("utworzono ogłoszenie") ||
      lowerMessage.includes("utworzono ogloszenie") ||
      lowerMessage.includes("dodano ogłoszenie")
    ) {
      return <Plus className="w-5 h-5 text-green-600" />;
    } else if (
      lowerMessage.includes("zaktualizowano ogłoszenie") ||
      lowerMessage.includes("zaktualizowano ogloszenie") ||
      lowerMessage.includes("edytowano")
    ) {
      return <Edit3 className="w-5 h-5 text-blue-600" />;
    } else if (
      lowerMessage.includes("usunięto ogłoszenie") ||
      lowerMessage.includes("usunieto ogloszenie")
    ) {
      return <ShoppingBag className="w-5 h-5 text-red-600" />;
    } else if (
      lowerMessage.includes("zaktualizowano dane") ||
      lowerMessage.includes("zmieniono dane") ||
      lowerMessage.includes("profil")
    ) {
      return <User className="w-5 h-5 text-purple-600" />;
    } else if (
      lowerMessage.includes("logowanie") ||
      lowerMessage.includes("zalogowano")
    ) {
      return <LogOut className="w-5 h-5 text-blue-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  // Parsuj advertisementId z details
  const parseAdvertisementId = (details: string): number | null => {
    const match = details?.match(/advertisementId:(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Parsuj rating z details
  const parseRating = (details: string): number | null => {
    const match = details?.match(/rating:(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  // Kliknięcie w aktywność
  const handleActivityClick = (activity: UserActivity) => {
    const adId = parseAdvertisementId(activity.details);
    if (adId && !activity.message.includes("Usunięto")) {
      navigate(`/smartfon/${adId}`);
    }
  };

  return (
    <>
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
            {/* Header z ikoną User */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 p-4 rounded-full">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Panel Użytkownika
                  </h1>
                  <p className="text-gray-300">
                    Zarządzaj swoimi ogłoszeniami i profilem
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Quick Stats - wyraźnie oddzielone */}
              <div className="bg-gray-800 rounded-lg p-6 border-2 border-purple-500">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Twoje statystyki
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-lg shadow-lg border border-blue-400">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ShoppingBag className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? "..." : stats.activeAds}
                      </div>
                      <div className="text-sm text-blue-100 mt-1">
                        Aktywne ogłoszenia
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg border border-green-400">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? "..." : stats.totalViews}
                      </div>
                      <div className="text-sm text-green-100 mt-1">
                        Wyświetlenia
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg shadow-lg border border-purple-400">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Heart className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {loading ? "..." : stats.favorites}
                      </div>
                      <div className="text-sm text-purple-100 mt-1">
                        Obserwowane
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - z nagłówkiem */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                  Szybkie akcje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Primary Actions */}
                  <button
                    onClick={() => navigate("/user/addadvertisement")}
                    className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
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
                    className="bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
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
                    className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
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
                    onClick={() => navigate("/user/watchedads")}
                    className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
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
                    className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="user-card-icon bg-white/20 p-4 rounded-full">
                        <Bell className="w-8 h-8" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-bold mb-2">
                          Powiadomienia
                        </h3>
                        <p className="text-red-100 text-sm">Ważne informacje</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/user/personaldetails")}
                    className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl text-white font-semibold transition-all duration-300 hover:shadow-2xl"
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
              </div>

              {/* Recent Activity Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Ostatnia aktywność
                </h3>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  {activitiesLoading ? (
                    <div className="text-gray-300 text-center py-8">
                      <p>Ładowanie aktywności...</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="text-gray-300 text-center py-8">
                      <p>Brak ostatniej aktywności</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Dodaj swoje pierwsze ogłoszenie!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activities.map((activity) => {
                        const rating = parseRating(activity.details);
                        const adId = parseAdvertisementId(activity.details);
                        const isClickable =
                          adId && !activity.message.includes("Usunięto");

                        return (
                          <div
                            key={activity.id}
                            onClick={() => handleActivityClick(activity)}
                            className={`flex items-start gap-3 p-3 min-h-[72px] bg-gray-700 rounded-lg border border-gray-600 transition-all ${
                              isClickable
                                ? "hover:shadow-md hover:border-purple-500 cursor-pointer"
                                : ""
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {getActivityIcon(activity.message)}
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-sm font-medium text-white">
                                {activity.message}
                              </p>
                              {rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 text-xs text-gray-400">
                              {formatActivityTime(activity.timestamp)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
    </>
  );
};

export default UserPanel;
