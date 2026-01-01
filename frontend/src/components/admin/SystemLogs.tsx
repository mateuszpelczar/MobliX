import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../overall/SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Activity,
  Server,
  Database,
  AlertTriangle,
  XCircle,
  Clock,
  Search,
  Filter,
  Calendar,
  Eye,
  Zap,
  FileText,
  Settings,
  Monitor,
  Wifi,
  BarChart3,
  RefreshCw,
  Loader,
  Bell,
  Heart,
  Plus,
} from "lucide-react";

// ⚠️ ZMIANA: Backend używa uppercase (INFO, WARN, ERROR) zamiast lowercase
type LogLevel = "INFO" | "WARN" | "ERROR";
type LogCategory =
  | "system"
  | "database"
  | "authentication"
  | "api"
  | "security"
  | "advertisement"
  | "opinion"
  | "profile"
  | "admin";

interface SystemLog {
  id: number;
  timestamp: string; // LocalDateTime z backendu w formacie ISO
  level: LogLevel;
  category: LogCategory;
  message: string;
  details: string | null;
  source: string;
  userEmail: string | null;
  ipAddress: string | null;
}

// Interfejs odpowiedzi z paginacją (Page<LogDTO> z backendu)
interface PageResponse {
  content: SystemLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const SystemLogs: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ NOWE: Stan dla logów z API
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ✅ NOWE: Funkcja pobierająca logi z backendu
  const fetchLogs = async (level: string = "all", page: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let url = "";
      const pageSize = 5; // Liczba logów na stronę

      if (level === "all") {
        // Wszystkie logi
        url = `http://localhost:8080/api/logs?page=${page}&size=${pageSize}`;
      } else {
        // Filtrowanie po poziomie (INFO, WARN, ERROR)
        url = `http://localhost:8080/api/logs/level/${level}?page=${page}&size=${pageSize}`;
      }

      const response = await axios.get<PageResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogs(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      setCurrentPage(response.data.number);
    } catch (err: any) {
      console.error("Błąd pobierania logów:", err);
      if (err.response?.status === 403) {
        setError("Brak uprawnień do przeglądania logów (wymagana rola ADMIN)");
      } else if (err.response?.status === 401) {
        setError("Sesja wygasła. Zaloguj się ponownie.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(
          "Błąd podczas pobierania logów: " + (err.message || "Nieznany błąd")
        );
      }
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOWE: Pobierz logi przy montowaniu komponentu i przy zmianie filtra
  useEffect(() => {
    fetchLogs(levelFilter, currentPage);
    fetchFavoriteCount();
  }, [levelFilter, currentPage]);

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

  // Filtrowanie lokalne (po pobraniu z backendu)
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details &&
        log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userEmail &&
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === "all" || log.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Get level configuration - ⚠️ ZMIANA: uppercase
  const getLevelConfig = (level: LogLevel) => {
    switch (level) {
      case "INFO":
        return {
          icon: Clock,
          color: "text-blue-600",
          bg: "bg-blue-100",
          text: "Info",
        };
      case "WARN":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Ostrzeżenie",
        };
      case "ERROR":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Błąd",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-600",
          bg: "bg-gray-100",
          text: "Nieznany",
        };
    }
  };

  // Get category configuration
  const getCategoryConfig = (category: LogCategory) => {
    switch (category) {
      case "system":
        return { icon: Server, color: "text-purple-600", text: "System" };
      case "database":
        return { icon: Database, color: "text-green-600", text: "Baza danych" };
      case "authentication":
        return { icon: Shield, color: "text-blue-600", text: "Autoryzacja" };
      case "api":
        return { icon: Zap, color: "text-orange-600", text: "API" };
      case "security":
        return { icon: Shield, color: "text-red-600", text: "Bezpieczeństwo" };
      case "advertisement":
        return {
          icon: ShoppingBag,
          color: "text-indigo-600",
          text: "Ogłoszenia",
        };
      case "profile":
        return { icon: User, color: "text-pink-600", text: "Profil" };
      case "admin":
        return { icon: Shield, color: "text-red-700", text: "Administracja" };
      default:
        return { icon: FileText, color: "text-white-600", text: "Inne" };
    }
  };

  // ✅ NOWE: Formatowanie daty z ISO do czytelnego formatu
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

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
                        className="w-full text-left text-white hover:bg-gray-800 rounded-lg transition-colors"
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
          {/* Header z ikoną Activity */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-4 rounded-full">
                <Activity className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Centrum Logów Systemowych
                </h1>
                <p className="text-gray-300">
                  Monitorowanie aktywności systemu, analiza błędów i zarządzanie
                  bezpieczeństwem platformy
                </p>
              </div>
            </div>
          </div>

          {/* Komunikat błędu */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              <strong className="font-bold">Błąd: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Sekcja filtrów */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Pasek wyszukiwania */}
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Szukaj w logach po wiadomości, źródle, użytkowniku..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-10"
                />
              </div>

              {/* Filtr poziomu - ⚠️ ZMIANA: uppercase wartości */}
              <div className="flex gap-2 flex-wrap flex-shrink-0">
                <button
                  onClick={() => {
                    setLevelFilter("all");
                    setCurrentPage(0);
                  }}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    levelFilter === "all"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Wszystkie
                  </div>
                </button>
                <button
                  onClick={() => {
                    setLevelFilter("INFO");
                    setCurrentPage(0);
                  }}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    levelFilter === "INFO"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Info
                  </div>
                </button>
                <button
                  onClick={() => {
                    setLevelFilter("WARN");
                    setCurrentPage(0);
                  }}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    levelFilter === "WARN"
                      ? "bg-yellow-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Ostrzeżenia
                  </div>
                </button>
                <button
                  onClick={() => {
                    setLevelFilter("ERROR");
                    setCurrentPage(0);
                  }}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    levelFilter === "ERROR"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Błędy
                  </div>
                </button>
              </div>
            </div>

            {/* Licznik wyników */}
            <div className="mt-3 flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>
                  Wyświetlono {filteredLogs.length} z {totalElements} logów
                  systemowych (strona {currentPage + 1} z {totalPages})
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setLevelFilter("all");
                  setCategoryFilter("all");
                  setCurrentPage(0);
                }}
                disabled={loading}
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Resetuj filtry
              </button>
            </div>
          </div>

          {/* Obszar wyświetlania logów */}
          <div className="bg-gray-800 rounded-lg p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-gray-300">Ładowanie logów...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Monitor className="w-16 h-16 text-gray-500" />
                      <p className="text-gray-400 text-lg">
                        {logs.length === 0
                          ? "Brak logów w systemie"
                          : "Nie znaleziono logów spełniających kryteria"}
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setLevelFilter("all");
                          setCategoryFilter("all");
                          setCurrentPage(0);
                        }}
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        Wyczyść filtry
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const levelConfig = getLevelConfig(log.level);
                    const categoryConfig = getCategoryConfig(log.category);
                    const LevelIcon = levelConfig.icon;
                    const CategoryIcon = categoryConfig.icon;

                    return (
                      <div
                        key={log.id}
                        className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                      >
                        {/* Nagłówek logu */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${levelConfig.bg} ${levelConfig.color}`}
                            >
                              <LevelIcon className="w-3 h-3" />
                              {levelConfig.text}
                            </div>
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-600 ${categoryConfig.color}`}
                            >
                              <CategoryIcon className="w-3 h-3" />
                              {categoryConfig.text}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {formatTimestamp(log.timestamp)}
                          </div>
                        </div>

                        {/* Wiadomość logu */}
                        <div className="mb-3">
                          <h3 className="font-semibold text-white mb-1">
                            {log.message}
                          </h3>
                          {log.details && (
                            <p className="text-gray-300 text-sm">
                              {log.details}
                            </p>
                          )}
                        </div>

                        {/* Metadane logu */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pt-3 border-t border-gray-600">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span>Źródło: {log.source}</span>
                          </div>
                          {log.userEmail && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>Użytkownik: {log.userEmail}</span>
                            </div>
                          )}
                          {log.ipAddress && (
                            <div className="flex items-center gap-2">
                              <Wifi className="w-4 h-4" />
                              <span>IP: {log.ipAddress}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            <Eye className="w-4 h-4" />
                            <span>ID: #{log.id}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Paginacja */}
            {totalPages > 1 && !loading && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-600">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Poprzednia
                </button>
                <span className="text-gray-300">
                  Strona {currentPage + 1} z {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Następna
                </button>
              </div>
            )}
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

export default SystemLogs;
