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
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  UserCheck,
  Eye,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  UserX,
  Edit,
  MoreHorizontal,
  Flag,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const ModeracjaUzytkownikow: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("wszystkie");
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Przykładowe dane użytkowników
  const mockUsers = [
    {
      id: 1,
      username: "jan.kowalski",
      email: "jan.kowalski@email.com",
      firstName: "Jan",
      lastName: "Kowalski",
      joinDate: "2024-01-15",
      lastActive: "2024-09-04",
      status: "aktywny",
      adsCount: 12,
      rating: 4.8,
      reportsCount: 0,
      location: "Warszawa",
      phone: "+48 123 456 789",
      verificationLevel: "zweryfikowany",
      accountType: "premium",
    },
    {
      id: 2,
      username: "anna.nowak",
      email: "anna.nowak@email.com",
      firstName: "Anna",
      lastName: "Nowak",
      joinDate: "2024-02-20",
      lastActive: "2024-09-03",
      status: "ostrzeżenie",
      adsCount: 8,
      rating: 4.2,
      reportsCount: 2,
      location: "Kraków",
      phone: "+48 987 654 321",
      verificationLevel: "częściowo",
      accountType: "standard",
    },
    {
      id: 3,
      username: "spam.bot.123",
      email: "spambot@suspicious.com",
      firstName: "Spam",
      lastName: "Bot",
      joinDate: "2024-09-01",
      lastActive: "2024-09-02",
      status: "podejrzany",
      adsCount: 25,
      rating: 2.1,
      reportsCount: 8,
      location: "Nieznana",
      phone: "Brak",
      verificationLevel: "niezweryfikowany",
      accountType: "standard",
    },
    {
      id: 4,
      username: "maria.kowalczyk",
      email: "maria.kowalczyk@email.com",
      firstName: "Maria",
      lastName: "Kowalczyk",
      joinDate: "2023-11-10",
      lastActive: "2024-08-15",
      status: "zablokowany",
      adsCount: 5,
      rating: 1.5,
      reportsCount: 12,
      location: "Gdańsk",
      phone: "+48 555 666 777",
      verificationLevel: "zweryfikowany",
      accountType: "standard",
    },
    {
      id: 5,
      username: "piotr.jankowski",
      email: "piotr.jankowski@email.com",
      firstName: "Piotr",
      lastName: "Jankowski",
      joinDate: "2024-03-05",
      lastActive: "2024-09-04",
      status: "aktywny",
      adsCount: 18,
      rating: 4.9,
      reportsCount: 0,
      location: "Wrocław",
      phone: "+48 111 222 333",
      verificationLevel: "zweryfikowany",
      accountType: "premium",
    },
    {
      id: 6,
      username: "katarzyna.nowacka",
      email: "katarzyna.nowacka@email.com",
      firstName: "Katarzyna",
      lastName: "Nowacka",
      joinDate: "2024-06-12",
      lastActive: "2024-09-03",
      status: "aktywny",
      adsCount: 3,
      rating: 5.0,
      reportsCount: 0,
      location: "Poznań",
      phone: "+48 444 555 666",
      verificationLevel: "zweryfikowany",
      accountType: "standard",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aktywny":
        return "bg-green-100 text-green-800";
      case "ostrzeżenie":
        return "bg-yellow-100 text-yellow-800";
      case "podejrzany":
        return "bg-orange-100 text-orange-800";
      case "zablokowany":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aktywny":
        return <CheckCircle className="w-4 h-4" />;
      case "ostrzeżenie":
        return <AlertTriangle className="w-4 h-4" />;
      case "podejrzany":
        return <Eye className="w-4 h-4" />;
      case "zablokowany":
        return <Ban className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case "zweryfikowany":
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case "częściowo":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "niezweryfikowany":
        return <UserX className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "premium":
        return <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
      case "standard":
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesFilter =
      selectedFilter === "wszystkie" || user.status === selectedFilter;
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUserAction = (userId: number, action: string) => {
    console.log(`Akcja ${action} dla użytkownika ${userId}`);
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
        <div className="container mx-auto px-4 relative pt-96 pb-12 max-w-6xl">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6">
            {/* Nagłówek */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                Moderacja Użytkowników
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>
                  Aktywnych użytkowników:{" "}
                  {filteredUsers.filter((u) => u.status === "aktywny").length}
                </span>
              </div>
            </div>

            {/* Filtry i wyszukiwanie */}
            <div className="flex flex-col gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Szukaj użytkowników..."
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
                  Wszyscy
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "wszystkie"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {mockUsers.length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("aktywny")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "aktywny"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  Aktywni
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "aktywny"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {mockUsers.filter((u) => u.status === "aktywny").length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("ostrzeżenie")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "ostrzeżenie"
                      ? "bg-yellow-600 text-white shadow-md"
                      : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Ostrzeżeni
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "ostrzeżenie"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {mockUsers.filter((u) => u.status === "ostrzeżenie").length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("podejrzany")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "podejrzany"
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Podejrzani
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "podejrzany"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {mockUsers.filter((u) => u.status === "podejrzany").length}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFilter("zablokowany")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFilter === "zablokowany"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-red-50 text-red-700 hover:bg-red-100"
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  Zablokowani
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedFilter === "zablokowany"
                        ? "bg-white bg-opacity-20 text-white"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {mockUsers.filter((u) => u.status === "zablokowany").length}
                  </span>
                </button>
              </div>
            </div>

            {/* Lista użytkowników */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Użytkownik
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Ogłoszenia
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Ocena
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Zgłoszenia
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Ostatnia aktywność
                    </th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">
                                {user.username}
                              </span>
                              {getAccountTypeIcon(user.accountType)}
                              {getVerificationIcon(user.verificationLevel)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusIcon(user.status)}
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <ShoppingBag className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{user.adsCount}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <div className="flex">{renderStars(user.rating)}</div>
                          <span className="text-sm font-medium ml-1">
                            {user.rating}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <Flag className="w-4 h-4 text-gray-500" />
                          <span
                            className={`font-medium ${
                              user.reportsCount > 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {user.reportsCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {user.lastActive}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUserAction(user.id, "view")}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Zobacz szczegóły"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, "edit")}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edytuj"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.status !== "zablokowany" && (
                            <button
                              onClick={() => handleUserAction(user.id, "block")}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Zablokuj"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user.id, "more")}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="Więcej opcji"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Brak użytkowników
                </h3>
                <p className="text-gray-500">
                  Nie znaleziono użytkowników spełniających kryteria
                  wyszukiwania.
                </p>
              </div>
            )}
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

export default ModeracjaUzytkownikow;
