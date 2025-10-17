import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import {
  MessageSquare,
  ShoppingBag,
  Star,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Activity,
  Server,
  Database,
  AlertTriangle,
  CheckCircle,
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
  HardDrive,
  Cpu,
  BarChart3,
  ArrowLeft,
  RefreshCw,
  Loader,
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
  userEmail: string | null; // ⚠️ ZMIANA: było "user", teraz "userEmail"
  ipAddress: string | null; // ⚠️ ZMIANA: było "ip", teraz "ipAddress"
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
      const pageSize = 50; // Liczba logów na stronę

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
  }, [levelFilter, currentPage]);

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
      case "opinion":
        return { icon: Star, color: "text-yellow-600", text: "Opinie" };
      case "profile":
        return { icon: User, color: "text-pink-600", text: "Profil" };
      case "admin":
        return { icon: Shield, color: "text-red-700", text: "Administracja" };
      default:
        return { icon: FileText, color: "text-gray-600", text: "Inne" };
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
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header: white bar with logo and account menu */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/main")}
          style={{ userSelect: "none" }}
        >
          MobliX
        </div>
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button text-sm sm:text-base whitespace-nowrap px-2 sm:px-4 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Twoje konto
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
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
                    onClick={handleLogout}
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="panel-content-with-search flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-7xl mx-auto min-h-[500px] max-h-[80vh] flex flex-col gap-6 sm:gap-8 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#a855f7 #f3f4f6",
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-8 h-8" />
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Centrum Logów Systemowych
                </h2>
              </div>
              <p className="text-purple-100 text-sm sm:text-base">
                Monitorowanie aktywności systemu, analiza błędów i zarządzanie
                bezpieczeństwem platformy
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Błąd: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Filter Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex-shrink-0">
              <div className="flex flex-col xl:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Szukaj w logach po wiadomości, źródle, użytkowniku..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-10"
                  />
                </div>

                {/* Level Filter - ⚠️ ZMIANA: uppercase wartości */}
                <div className="flex gap-2 flex-wrap flex-shrink-0 pb-5">
                  <button
                    onClick={() => {
                      setLevelFilter("all");
                      setCurrentPage(0);
                    }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      levelFilter === "all"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Błędy
                    </div>
                  </button>
                </div>

                {/* Results Counter */}
                <div className="mt-3 text-sm text-gray-600 flex items-center gap-2 pb-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>
                    Wyświetlono {filteredLogs.length} z {totalElements} logów
                    systemowych (strona {currentPage + 1} z {totalPages})
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setLevelFilter("all");
                      setCategoryFilter("all");
                      setCurrentPage(0);
                    }}
                    disabled={loading}
                    className="ml-auto text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                    />
                    Resetuj filtry
                  </button>
                </div>
              </div>

              {/* Logs Display Area */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600">Ładowanie logów...</p>
                  </div>
                ) : (
                  <div className="space-y-3 pb-6">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <Monitor className="w-16 h-16 text-gray-400" />
                          <p className="text-gray-500 text-lg">
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
                            className="text-purple-600 hover:text-purple-800 underline"
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
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            {/* Log Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${levelConfig.bg} ${levelConfig.color}`}
                                >
                                  <LevelIcon className="w-3 h-3" />
                                  {levelConfig.text}
                                </div>
                                <div
                                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${categoryConfig.color}`}
                                >
                                  <CategoryIcon className="w-3 h-3" />
                                  {categoryConfig.text}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </div>

                            {/* Log Message */}
                            <div className="mb-3">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {log.message}
                              </h3>
                              {log.details && (
                                <p className="text-gray-600 text-sm">
                                  {log.details}
                                </p>
                              )}
                            </div>

                            {/* Log Metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
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
              </div>

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Poprzednia
                  </button>
                  <span className="text-gray-600">
                    Strona {currentPage + 1} z {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Następna
                  </button>
                </div>
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
    </div>
  );
};

export default SystemLogs;
