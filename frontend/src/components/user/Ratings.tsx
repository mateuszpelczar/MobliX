import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../styles/MobileResponsive.css";
import {
  Star,
  User,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
  Shield,
  Users,
  LogOut,
  Calendar,
  TrendingUp,
  Award,
  Eye,
  Edit,
  Trash2,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type Rating = {
  id: number;
  title: string;
  user: string;
  date: string;
  status: "received" | "to-rate" | "rated";
  value?: number;
  comment?: string;
};

const mockRatings: Rating[] = [
  {
    id: 1,
    title: "iPhone 13 128GB",
    user: "Jan Kowalski",
    date: "2025-08-20",
    status: "received",
    value: 5,
    comment: "Wszystko OK!",
  },
  {
    id: 2,
    title: "Samsung S22 Ultra",
    user: "Anna Nowak",
    date: "2025-08-18",
    status: "to-rate",
  },
  {
    id: 3,
    title: "Pixel 7 Pro",
    user: "Marek Testowy",
    date: "2025-08-15",
    status: "rated",
    value: 4,
    comment: "Dobry kontakt.",
  },
  {
    id: 4,
    title: "Xiaomi 12",
    user: "Kasia Test",
    date: "2025-08-10",
    status: "to-rate",
  },
  {
    id: 5,
    title: "iPhone 12 Pro",
    user: "Jan Kowalski",
    date: "2025-08-05",
    status: "received",
    value: 3,
    comment: "Mogło być szybciej.",
  },
  {
    id: 6,
    title: "Samsung S21",
    user: "Anna Nowak",
    date: "2025-08-01",
    status: "rated",
    value: 5,
    comment: "Super!",
  },
];

const tabLabels = [
  {
    key: "received",
    label: "Otrzymane oceny",
    icon: ThumbsUp,
    count: mockRatings.filter((r) => r.status === "received").length,
  },
  {
    key: "to-rate",
    label: "Do oceny",
    icon: Clock,
    count: mockRatings.filter((r) => r.status === "to-rate").length,
  },
  {
    key: "rated",
    label: "Wystawione",
    icon: CheckCircle,
    count: mockRatings.filter((r) => r.status === "rated").length,
  },
];

const Ratings: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"received" | "to-rate" | "rated">(
    "received"
  );

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

  // Funkcja do renderowania gwiazdek
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

  // Funkcja do określenia koloru statusu
  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-green-100 text-green-800";
      case "to-rate":
        return "bg-yellow-100 text-yellow-800";
      case "rated":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Funkcja do określenia ikony statusu
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <ThumbsUp className="w-4 h-4" />;
      case "to-rate":
        return <Clock className="w-4 h-4" />;
      case "rated":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filtered = mockRatings.filter((r) => r.status === activeTab);

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
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
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="dropdown-logout flex items-center gap-3 px-4 py-2"
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
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-52 pb-12 max-w-5xl">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 min-h-[300px]">
            {/* Header z ikonami i statystykami */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Oceny i opinie
                  </h2>
                  <p className="text-sm text-gray-600">
                    Zarządzaj swoimi ocenami i opiniami
                  </p>
                </div>
              </div>
            </div>
            {/* Tabs z ikonami */}
            <div className="flex gap-2 sm:gap-4 mb-4 overflow-x-auto">
              {tabLabels.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 text-sm sm:text-base whitespace-nowrap ${
                      activeTab === tab.key
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    onClick={() => setActiveTab(tab.key as any)}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.key
                          ? "bg-white bg-opacity-20 text-white"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Lista ocen */}
            <div className="flex flex-col gap-4">
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Brak ocen w tej kategorii
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === "to-rate"
                      ? "Nie masz użytkowników do oceny"
                      : "Nie masz jeszcze żadnych ocen w tej kategorii"}
                  </p>
                </div>
              )}
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Lewa część - informacje o transakcji */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate text-lg">
                            {r.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 text-sm">
                              {r.user}
                            </span>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600 text-sm">
                                {r.date}
                              </span>
                            </div>
                          </div>

                          {/* Status badge */}
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                r.status
                              )}`}
                            >
                              {getStatusIcon(r.status)}
                              {r.status === "received" && "Otrzymano ocenę"}
                              {r.status === "to-rate" && "Do oceny"}
                              {r.status === "rated" && "Oceniono"}
                            </span>
                          </div>

                          {/* Ocena gwiazdkowa */}
                          {r.value && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex">{renderStars(r.value)}</div>
                              <span className="text-lg font-bold text-yellow-600">
                                {r.value}/5
                              </span>
                            </div>
                          )}

                          {/* Komentarz */}
                          {r.comment && (
                            <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                <p className="text-gray-700 text-sm italic">
                                  "{r.comment}"
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prawa część - przyciski akcji */}
                    <div className="flex flex-row sm:flex-col gap-2">
                      {activeTab === "to-rate" && (
                        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          <Plus className="w-4 h-4" />
                          Oceń
                        </button>
                      )}
                      {activeTab === "rated" && (
                        <>
                          <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Edit className="w-4 h-4" />
                            Edytuj
                          </button>
                          <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </>
                      )}
                      {activeTab === "received" && (
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          <Eye className="w-4 h-4" />
                          Zobacz
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
  );
};

export default Ratings;
