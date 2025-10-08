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
  Flag,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Ban,
  TrendingUp,
  FileText,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  UserX,
  Trash2,
  ExternalLink,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const ModeracjaZgloszen: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("wszystkie");
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Przykładowe dane zgłoszeń
  const mockReports = [
    {
      id: 1,
      type: "oszustwo",
      title: "Podejrzane ogłoszenie - iPhone 14 Pro",
      reportedUser: "spam.bot.123",
      reporterUser: "anna.kowalska",
      adTitle: "iPhone 14 Pro Max za 500zł - okazja!",
      description:
        "Użytkownik oferuje telefon w podejrzanie niskiej cenie. Prawdopodobnie oszustwo.",
      date: "2024-09-08",
      priority: "wysoki",
      status: "oczekujace",
      category: "ogłoszenie",
      evidence: ["screenshot1.jpg", "conversation.png"],
    },
    {
      id: 2,
      type: "naruszenie_regulaminu",
      title: "Nieodpowiednie zdjęcia w ogłoszeniu",
      reportedUser: "jan.kowalski",
      reporterUser: "maria.nowak",
      adTitle: "Samsung Galaxy S23 Ultra",
      description:
        "Ogłoszenie zawiera zdjęcia nieodpowiednie do kategorii telefonów.",
      date: "2024-09-07",
      priority: "sredni",
      status: "w_trakcie",
      category: "ogłoszenie",
      evidence: ["photo1.jpg"],
    },
    {
      id: 3,
      type: "spam",
      title: "Masowe wysyłanie wiadomości",
      reportedUser: "spammer.user",
      reporterUser: "piotr.jankowski",
      adTitle: "Kup teraz! Najlepsze telefony!",
      description:
        "Użytkownik wysyła spam wiadomości do wielu użytkowników jednocześnie.",
      date: "2024-09-06",
      priority: "wysoki",
      status: "rozwiazane",
      category: "komunikacja",
      evidence: ["messages.pdf", "screenshot2.jpg"],
    },
    {
      id: 4,
      type: "fake_profile",
      title: "Fałszywy profil użytkownika",
      reportedUser: "fake.seller",
      reporterUser: "katarzyna.nowacka",
      adTitle: "Różne telefony w super cenach",
      description:
        "Podejrzenie, że profil jest fałszywy - brak danych weryfikacyjnych, podejrzane zdjęcia.",
      date: "2024-09-05",
      priority: "wysoki",
      status: "oczekujace",
      category: "użytkownik",
      evidence: ["profile_analysis.pdf"],
    },
    {
      id: 5,
      type: "nieodebrane_zamowienie",
      title: "Brak realizacji transakcji",
      reportedUser: "maria.kowalczyk",
      reporterUser: "andrzej.wisniewski",
      adTitle: "iPhone 13 128GB",
      description:
        "Sprzedawca nie wysłał telefonu mimo otrzymania płatności przed tygodniem.",
      date: "2024-09-04",
      priority: "wysoki",
      status: "w_trakcie",
      category: "transakcja",
      evidence: ["payment_proof.jpg", "conversation_history.pdf"],
    },
    {
      id: 6,
      type: "niewlasciwa_kategoria",
      title: "Ogłoszenie w złej kategorii",
      reportedUser: "tomasz.nowak",
      reporterUser: "system.moderator",
      adTitle: "Sprzedam samochód BMW",
      description:
        "Ogłoszenie samochodu zostało umieszczone w kategorii telefonów.",
      date: "2024-09-03",
      priority: "niski",
      status: "rozwiazane",
      category: "ogłoszenie",
      evidence: [],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "oczekujace":
        return "bg-yellow-100 text-yellow-800";
      case "w_trakcie":
        return "bg-blue-100 text-blue-800";
      case "rozwiazane":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "oczekujace":
        return <Clock className="w-4 h-4" />;
      case "w_trakcie":
        return <AlertTriangle className="w-4 h-4" />;
      case "rozwiazane":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "wysoki":
        return "bg-red-100 text-red-800";
      case "sredni":
        return "bg-orange-100 text-orange-800";
      case "niski":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "wysoki":
        return <AlertTriangle className="w-4 h-4" />;
      case "sredni":
        return <AlertCircle className="w-4 h-4" />;
      case "niski":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "oszustwo":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "spam":
        return <Ban className="w-5 h-5 text-orange-600" />;
      case "fake_profile":
        return <UserX className="w-5 h-5 text-purple-600" />;
      case "naruszenie_regulaminu":
        return <XCircle className="w-5 h-5 text-blue-600" />;
      case "nieodebrane_zamowienie":
        return <ShoppingBag className="w-5 h-5 text-yellow-600" />;
      case "niewlasciwa_kategoria":
        return <FileText className="w-5 h-5 text-gray-600" />;
      default:
        return <Flag className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ogłoszenie":
        return <ShoppingBag className="w-4 h-4" />;
      case "użytkownik":
        return <User className="w-4 h-4" />;
      case "komunikacja":
        return <MessageSquare className="w-4 h-4" />;
      case "transakcja":
        return <Star className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const filteredReports = mockReports.filter((report) => {
    const matchesFilter =
      selectedFilter === "wszystkie" || report.status === selectedFilter;
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReportAction = (reportId: number, action: string) => {
    console.log(`Akcja ${action} dla zgłoszenia ${reportId}`);
    // Tutaj można dodać logikę dla różnych akcji
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Check user role from JWT token
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header like AdminPanel */}
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
              className="account-dropdown-button flex items-center gap-2"
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

      {/* Content*/}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div
          className="container mx-auto px-4 relative pt-12 pb-12 max-w-6xl"
          style={{ paddingTop: "1650px" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6">
            {/* Nagłówek */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Moderacja Zgłoszeń
                  </h1>
                  <p className="text-sm text-gray-600">
                    Zarządzaj zgłoszeniami użytkowników
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Oczekujących:{" "}
                    {
                      filteredReports.filter((r) => r.status === "oczekujace")
                        .length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Priorytetowych:{" "}
                    {
                      filteredReports.filter((r) => r.priority === "wysoki")
                        .length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Filtry i wyszukiwanie */}
            <div className="flex flex-col gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Szukaj zgłoszeń..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Filtry jako przyciski */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedFilter("wszystkie")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "wszystkie"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Wszystkie
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "wszystkie"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {mockReports.length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("oczekujace")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "oczekujace"
                      ? "bg-yellow-600 text-white shadow-md"
                      : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Oczekujące
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "oczekujace"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {
                      mockReports.filter((r) => r.status === "oczekujace")
                        .length
                    }
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("w_trakcie")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "w_trakcie"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />W trakcie
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "w_trakcie"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {mockReports.filter((r) => r.status === "w_trakcie").length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("rozwiazane")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "rozwiazane"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Rozwiązane
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "rozwiazane"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {
                      mockReports.filter((r) => r.status === "rozwiazane")
                        .length
                    }
                  </span>
                </button>
              </div>
            </div>

            {/* Lista zgłoszeń */}
            <div className="flex flex-col gap-4">
              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Flag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Brak zgłoszeń
                  </h3>
                  <p className="text-gray-500">
                    Nie znaleziono zgłoszeń spełniających kryteria wyszukiwania.
                  </p>
                </div>
              )}

              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Lewa część - szczegóły zgłoszenia */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          {getTypeIcon(report.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {report.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  report.status
                                )}`}
                              >
                                {getStatusIcon(report.status)}
                                {report.status === "oczekujace" && "Oczekuje"}
                                {report.status === "w_trakcie" && "W trakcie"}
                                {report.status === "rozwiazane" && "Rozwiązane"}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                  report.priority
                                )}`}
                              >
                                {getPriorityIcon(report.priority)}
                                {report.priority === "wysoki" && "Wysoki"}
                                {report.priority === "sredni" && "Średni"}
                                {report.priority === "niski" && "Niski"}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>
                                Zgłoszony:{" "}
                                <strong>{report.reportedUser}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Flag className="w-4 h-4" />
                              <span>Zgłaszający: {report.reporterUser}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{report.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(report.category)}
                              <span>Kategoria: {report.category}</span>
                            </div>
                          </div>

                          {report.adTitle && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                              <div className="flex items-center gap-2 text-sm">
                                <ShoppingBag className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">Ogłoszenie:</span>
                                <span className="text-blue-600">
                                  {report.adTitle}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-3">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                              <p className="text-gray-700 text-sm">
                                {report.description}
                              </p>
                            </div>
                          </div>

                          {report.evidence.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <ExternalLink className="w-3 h-3" />
                              <span>Załączniki: {report.evidence.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prawa część - akcje */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
                      <button
                        onClick={() => handleReportAction(report.id, "view")}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 lg:flex-none justify-center"
                      >
                        <Eye className="w-4 h-4" />
                        Szczegóły
                      </button>

                      {report.status !== "rozwiazane" && (
                        <>
                          <button
                            onClick={() =>
                              handleReportAction(report.id, "accept")
                            }
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 lg:flex-none justify-center"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Zatwierdź
                          </button>

                          <button
                            onClick={() =>
                              handleReportAction(report.id, "reject")
                            }
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 lg:flex-none justify-center"
                          >
                            <XCircle className="w-4 h-4" />
                            Odrzuć
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* White footer bar at bottom */}
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

export default ModeracjaZgloszen;
