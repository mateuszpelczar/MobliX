import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
} from "lucide-react";

type LogLevel = "info" | "warning" | "error" | "success";
type LogCategory =
  | "system"
  | "database"
  | "authentication"
  | "api"
  | "security";

interface SystemLog {
  id: number;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  details: string;
  source: string;
  user?: string;
  ip?: string;
}

const SystemLogs: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock system logs data
  const [logs] = useState<SystemLog[]>([
    {
      id: 1,
      timestamp: "2024-09-09 14:32:15",
      level: "info",
      category: "authentication",
      message: "Użytkownik zalogowany pomyślnie",
      details: "Standardowa procedura logowania wykonana bez błędów",
      source: "AuthService",
      user: "admin@moblix.pl",
      ip: "192.168.1.105",
    },
    {
      id: 2,
      timestamp: "2024-09-09 14:28:43",
      level: "warning",
      category: "database",
      message: "Wysoka latencja zapytań do bazy danych",
      details: "Średni czas odpowiedzi: 2.3s, próg ostrzeżenia: 2.0s",
      source: "DatabaseMonitor",
      ip: "10.0.1.50",
    },
    {
      id: 3,
      timestamp: "2024-09-09 14:25:12",
      level: "error",
      category: "api",
      message: "Błąd API podczas pobierania ogłoszeń",
      details: "HTTP 500 - Internal Server Error w endpoint /api/ads/list",
      source: "APIGateway",
      ip: "203.45.67.89",
    },
    {
      id: 4,
      timestamp: "2024-09-09 14:22:38",
      level: "success",
      category: "system",
      message: "Backup systemu wykonany pomyślnie",
      details: "Rozmiar backupu: 2.4 GB, czas wykonania: 15 minut",
      source: "BackupService",
    },
    {
      id: 5,
      timestamp: "2024-09-09 14:18:55",
      level: "warning",
      category: "security",
      message: "Wykryto podejrzaną aktywność logowania",
      details: "5 nieudanych prób logowania z tego samego IP w ciągu 10 minut",
      source: "SecurityMonitor",
      ip: "45.123.67.12",
    },
    {
      id: 6,
      timestamp: "2024-09-09 14:15:02",
      level: "info",
      category: "system",
      message: "Restart usługi web serwera",
      details: "Planowany restart w ramach aktualizacji systemu",
      source: "SystemManager",
    },
    {
      id: 7,
      timestamp: "2024-09-09 14:12:30",
      level: "error",
      category: "database",
      message: "Utrata połączenia z bazą danych",
      details: "Timeout po 30 sekundach, automatyczne ponowne połączenie",
      source: "DatabasePool",
      ip: "10.0.1.50",
    },
    {
      id: 8,
      timestamp: "2024-09-09 14:08:17",
      level: "info",
      category: "authentication",
      message: "Nowy użytkownik zarejestrowany",
      details: "Rejestracja przez formularz web, wymagana weryfikacja email",
      source: "RegistrationService",
      user: "nowyuser@example.com",
      ip: "178.90.123.45",
    },
  ]);

  // Filtering logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    const matchesCategory =
      categoryFilter === "all" || log.category === categoryFilter;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  // Get level configuration
  const getLevelConfig = (level: LogLevel) => {
    switch (level) {
      case "success":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Sukces",
        };
      case "info":
        return {
          icon: Clock,
          color: "text-blue-600",
          bg: "bg-blue-100",
          text: "Info",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Ostrzeżenie",
        };
      case "error":
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
      default:
        return { icon: FileText, color: "text-gray-600", text: "Inne" };
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
      {/* Header: white bar with logo and account menu (same as AdminPanel) */}
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

      {/* Content: purple gradient background and white card */}
      <div className="panel-content-with-search flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-7xl mx-auto min-h-[500px] max-h-[80vh] flex flex-col gap-6 sm:gap-8 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#a855f7 #f3f4f6",
            }}
          >
            {/* Header with gradient */}
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

            {/* Advanced Filter Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex-shrink-0">
              <div className="flex flex-col xl:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Szukaj w logach po wiadomości, źródle, użytkowniku..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Level Filter */}
                <div className="flex gap-2 flex-wrap flex-shrink-0 pb-5">
                  <button
                    onClick={() => setLevelFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      levelFilter === "all"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Wszystkie
                    </div>
                  </button>
                  <button
                    onClick={() => setLevelFilter("success")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      levelFilter === "success"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Sukces
                    </div>
                  </button>
                  <button
                    onClick={() => setLevelFilter("info")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      levelFilter === "info"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Info
                    </div>
                  </button>
                  <button
                    onClick={() => setLevelFilter("warning")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      levelFilter === "warning"
                        ? "bg-yellow-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Ostrzeżenia
                    </div>
                  </button>
                  <button
                    onClick={() => setLevelFilter("error")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      levelFilter === "error"
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
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
                    Wyświetlono {filteredLogs.length} z {logs.length} logów
                    systemowych
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setLevelFilter("all");
                      setCategoryFilter("all");
                    }}
                    className="ml-auto text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resetuj filtry
                  </button>
                </div>
              </div>

              {/* Logs Display Area - Scrollable */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <div className="space-y-3 pb-6">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <Monitor className="w-16 h-16 text-gray-400" />
                        <p className="text-gray-500 text-lg">
                          Nie znaleziono logów spełniających kryteria
                        </p>
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            setLevelFilter("all");
                            setCategoryFilter("all");
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
                              {log.timestamp}
                            </div>
                          </div>

                          {/* Log Message */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {log.message}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {log.details}
                            </p>
                          </div>

                          {/* Log Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              <span>Źródło: {log.source}</span>
                            </div>
                            {log.user && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Użytkownik: {log.user}</span>
                              </div>
                            )}
                            {log.ip && (
                              <div className="flex items-center gap-2">
                                <Wifi className="w-4 h-4" />
                                <span>IP: {log.ip}</span>
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
              </div>
            </div>
          </div>
        </div>

        {/* White footer bar at bottom */}
        <div className="panel-footer w-full py-2 mt-auto">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xxs xs:text-xs sm:text-sm px-1 sm:px-2">
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
