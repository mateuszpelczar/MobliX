import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  User,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Shield,
  Users,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

interface Opinion {
  id: number;
  userId: number;
  advertisementId: number;
  advertisementTitle: string;
  advertisementStatus: string; // ACTIVE, SOLD, PAUSED, REJECTED, PENDING, DELETED
  userName: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

type TabType = "PENDING" | "APPROVED" | "REJECTED";

const tabLabels = [
  { key: "PENDING", label: "Oczekujące", icon: Clock, color: "yellow" },
  { key: "APPROVED", label: "Aktywne", icon: CheckCircle, color: "green" },
  { key: "REJECTED", label: "Odrzucone", icon: XCircle, color: "red" },
];

const YourOpinions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    fetchOpinions(activeTab);
  }, [activeTab]);

  const fetchOpinions = async (status: TabType) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get<Opinion[]>(
        `http://localhost:8080/api/opinions/user/status/${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOpinions(response.data);
    } catch (error: any) {
      console.error("Error fetching opinions:", error);
      setError("Nie udało się pobrać opinii. Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getStatusBadge = (status: TabType) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Oczekująca
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Zatwierdzona
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Odrzucona
          </span>
        );
    }
  };

  const getAdvertisementStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Aktywne
          </span>
        );
      case "SOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3" />
            Sprzedane
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Wstrzymane
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Odrzucone
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" />
            Oczekujące
          </span>
        );
      case "DELETED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <AlertCircle className="w-3 h-3" />
            Usunięte
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <AlertCircle className="w-3 h-3" />
            Nieznany
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div
          onClick={() => navigate("/main")}
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
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
                      navigate("/user/your-opinions");
                    }}
                  >
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    Twoje opinie
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

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-32 pb-12 max-w-5xl">
          <div
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-8 min-h-[300px] max-h-[80vh] overflow-y-auto border-t-4 border-purple-500"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#8B5CF6 #F3F4F6",
            }}
          >
            {/* Header with gradient background */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg -z-10"></div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent py-6">
                Twoje Opinie
              </h1>
            </div>

            {/* Tabs with modern design */}
            <div className="flex flex-wrap justify-center gap-2 bg-gray-50 p-2 rounded-xl">
              {tabLabels.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-purple-600 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600 text-lg">
                  Ładowanie opinii...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Opinions List */}
            {!loading && !error && (
              <div className="grid gap-6">
                {opinions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Star className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">
                      Brak opinii w tej kategorii
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      {activeTab === "PENDING" &&
                        "Nie masz oczekujących opinii"}
                      {activeTab === "APPROVED" &&
                        "Nie masz zatwierdzonych opinii"}
                      {activeTab === "REJECTED" &&
                        "Nie masz odrzuconych opinii"}
                    </p>
                  </div>
                ) : (
                  opinions.map((opinion) => (
                    <div
                      key={opinion.id}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-purple-300 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3
                            className="font-semibold text-lg text-gray-900 hover:text-purple-600 cursor-pointer mb-2 group-hover:text-purple-600 transition-colors"
                            onClick={() =>
                              navigate(`/smartfon/${opinion.advertisementId}`)
                            }
                          >
                            {opinion.advertisementTitle}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-500">
                              {formatDate(opinion.createdAt)}
                            </p>
                            {/* Status ogłoszenia */}
                            <span className="text-gray-400">•</span>
                            {getAdvertisementStatusBadge(
                              opinion.advertisementStatus
                            )}
                          </div>
                        </div>
                        {getStatusBadge(opinion.status)}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-600">Ocena:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= opinion.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-gray-700 text-sm">
                          {opinion.comment}
                        </p>
                      </div>

                      {/* Rejection Reason */}
                      {opinion.status === "REJECTED" &&
                        opinion.rejectionReason && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-800 mb-1">
                                  Powód odrzucenia opinii:
                                </p>
                                <p className="text-sm text-red-700">
                                  {opinion.rejectionReason}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Advertisement Status Warning */}
                      {opinion.advertisementStatus !== "ACTIVE" && (
                        <div
                          className={`border rounded-lg p-3 mb-3 ${
                            opinion.advertisementStatus === "DELETED"
                              ? "bg-red-50 border-red-200"
                              : "bg-yellow-50 border-yellow-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle
                              className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                opinion.advertisementStatus === "DELETED"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            />
                            <div>
                              <p
                                className={`text-sm font-medium mb-1 ${
                                  opinion.advertisementStatus === "DELETED"
                                    ? "text-red-800"
                                    : "text-yellow-800"
                                }`}
                              >
                                Uwaga:
                              </p>
                              <p
                                className={`text-sm ${
                                  opinion.advertisementStatus === "DELETED"
                                    ? "text-red-700"
                                    : "text-yellow-700"
                                }`}
                              >
                                {opinion.advertisementStatus === "SOLD" &&
                                  "To ogłoszenie zostało już sprzedane."}
                                {opinion.advertisementStatus === "PAUSED" &&
                                  "To ogłoszenie jest obecnie wstrzymane."}
                                {opinion.advertisementStatus === "REJECTED" &&
                                  "To ogłoszenie zostało odrzucone przez moderację."}
                                {opinion.advertisementStatus === "PENDING" &&
                                  "To ogłoszenie oczekuje na akceptację moderacji."}
                                {opinion.advertisementStatus === "DELETED" &&
                                  "To ogłoszenie zostało usunięte."}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() =>
                            navigate(`/smartfon/${opinion.advertisementId}`)
                          }
                          disabled={opinion.advertisementStatus === "DELETED"}
                          className={`px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium flex items-center gap-2 ${
                            opinion.advertisementStatus === "DELETED"
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          }`}
                        >
                          <Star className="w-4 h-4" />
                          Zobacz ogłoszenie
                        </button>
                      </div>
                    </div>
                  ))
                )}
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

export default YourOpinions;
