import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
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
  Award,
  Eye,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

type Opinion = {
  id: number;
  advertisementId: number;
  advertisementTitle: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const tabLabels = [
  {
    key: "received",
    label: "Otrzymane oceny",
    icon: ThumbsUp,
  },
  {
    key: "rated",
    label: "Oceniono",
    icon: CheckCircle,
  },
];

const Ratings: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"received" | "rated">("received");
  const [receivedOpinions, setReceivedOpinions] = useState<Opinion[]>([]);
  const [ratedOpinions, setRatedOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchOpinions();
  }, [activeTab]);

  const fetchOpinions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (activeTab === "received") {
        // Pobierz opinie wystawione pod naszymi ogłoszeniami
        const response = await axios.get<Opinion[]>(
          "http://localhost:8080/api/opinions/user/received",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReceivedOpinions(response.data);
      } else if (activeTab === "rated") {
        // Pobierz opinie które my napisaliśmy (APPROVED)
        const response = await axios.get<Opinion[]>(
          "http://localhost:8080/api/opinions/user/status/APPROVED",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRatedOpinions(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching opinions:", error);

      if (error.code === "ERR_NETWORK" || !error.response) {
        setError(
          "Nie udało się połączyć z serwerem. Sprawdź połączenie internetowe."
        );
      } else if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.status === 403) {
        setError("Brak uprawnień do przeglądania opinii.");
      } else {
        setError(
          "Wystąpił błąd podczas pobierania opinii. Spróbuj ponownie później."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const currentOpinions =
    activeTab === "received" ? receivedOpinions : ratedOpinions;

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
                const count =
                  tab.key === "received"
                    ? receivedOpinions.length
                    : ratedOpinions.length;
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
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-800 font-semibold mb-1">
                      Wystąpił problem
                    </h3>
                    <p className="text-red-700 text-sm mb-3">{error}</p>
                    <button
                      onClick={() => fetchOpinions()}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Spróbuj ponownie
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            )}

            {/* Lista ocen */}
            {!loading && !error && (
              <div className="flex flex-col gap-4">
                {currentOpinions.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      {activeTab === "received"
                        ? "Brak otrzymanych ocen"
                        : "Nie wystawiłeś jeszcze żadnych ocen"}
                    </h3>
                    <p className="text-gray-500">
                      {activeTab === "received"
                        ? "Nikt jeszcze nie ocenił Twoich ogłoszeń"
                        : "Dodaj opinię pod ogłoszeniem aby zobaczyć ją tutaj"}
                    </p>
                  </div>
                )}
                {currentOpinions.map((opinion) => (
                  <div
                    key={opinion.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() =>
                      navigate(`/smartfon/${opinion.advertisementId}`)
                    }
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      {/* Lewa część - informacje o opinii */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-lg">
                              {opinion.advertisementTitle}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600 text-sm">
                                {activeTab === "received"
                                  ? `Opinia od: ${opinion.userName}`
                                  : "Twoja opinia"}
                              </span>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 text-sm">
                                  {new Date(
                                    opinion.createdAt
                                  ).toLocaleDateString("pl-PL")}
                                </span>
                              </div>
                            </div>

                            {/* Status badge */}
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  activeTab === "received"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {activeTab === "received" ? (
                                  <ThumbsUp className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                {activeTab === "received"
                                  ? "Otrzymano ocenę"
                                  : "Oceniono"}
                              </span>
                            </div>

                            {/* Ocena gwiazdkowa */}
                            <div className="flex items-center gap-2 mt-3">
                              <div className="flex">
                                {renderStars(opinion.rating)}
                              </div>
                              <span className="text-lg font-bold text-yellow-600">
                                {opinion.rating}/5
                              </span>
                            </div>

                            {/* Komentarz */}
                            {opinion.comment && (
                              <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
                                  <p className="text-gray-700 text-sm italic">
                                    "{opinion.comment}"
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Prawa część - przycisk akcji */}
                      <div className="flex flex-row sm:flex-col gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/smartfon/${opinion.advertisementId}`);
                          }}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Zobacz ogłoszenie
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
  );
};

export default Ratings;
