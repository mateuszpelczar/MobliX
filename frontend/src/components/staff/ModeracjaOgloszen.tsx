import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SearchBar from "../SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Bell,
  Heart,
  Plus,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

type Advertisement = {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  status: string;
  createdAt: string;
  userName: string; // Backend wysyła userName zamiast user object
  imageUrls: string[]; // Backend wysyła imageUrls zamiast images array
  approvedAt?: string | null; // local field to track when staff approved an ad (optional)
};

const ModeracjaOgloszen: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAdId, setRejectingAdId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 5;

  const rejectReasons = [
    "Spam lub nieautentyczne ogłoszenie",
    "Nieodpowiednia treści lub wulgarny język",
    "Niepoprawne dane kontaktowe",
    "Naruszenie zasad serwisu",
    "Zdjęcia niezgodne z ogłoszeniem",
    "Inne (proszę podać powód)",
  ];

  // Ładowanie ogłoszeń z API
  useEffect(() => {
    fetchAdvertisements();
    fetchFavoriteCount();
  }, []);

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

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Brak tokenu autoryzacji");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/advertisements/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Błąd podczas ładowania ogłoszeń");
      }

      const data = await response.json();
      console.log("Fetched advertisements data:", data);
      // Ensure PENDING ads appear first, then ACTIVE/others.
      const sortAdvertisements = (arr: Advertisement[]) =>
        arr.slice().sort((a: Advertisement, b: Advertisement) => {
          // PENDING always first
          if (a.status === "PENDING" && b.status !== "PENDING") return -1;
          if (b.status === "PENDING" && a.status !== "PENDING") return 1;

          // If both ACTIVE, prefer approvedAt (most recently approved first)
          if (a.status === "ACTIVE" && b.status === "ACTIVE") {
            const aApproved = a.approvedAt
              ? new Date(a.approvedAt).getTime()
              : 0;
            const bApproved = b.approvedAt
              ? new Date(b.approvedAt).getTime()
              : 0;
            if (aApproved || bApproved) return bApproved - aApproved;
          }

          // Fallback: newest created first
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

      setAdvertisements(sortAdvertisements(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectWithReason = async () => {
    if (!rejectingAdId || !rejectReason) {
      alert("Wybierz powód odrzucenia");
      return;
    }

    const finalReason =
      rejectReason === "Inne (proszę podać powód)"
        ? customReason
        : rejectReason;

    if (rejectReason === "Inne (proszę podać powód)" && !customReason.trim()) {
      alert("Podaj własny powód odrzucenia");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/advertisements/${rejectingAdId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "REJECTED",
            rejectReason: finalReason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Błąd podczas odrzucania ogłoszenia");
      }

      alert("Ogłoszenie zostało odrzucone i użytkownik otrzymał powiadomienie");
      setShowRejectModal(false);
      setRejectingAdId(null);
      setRejectReason("");
      setCustomReason("");
      fetchAdvertisements();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Wystąpił błąd");
    }
  };

  const updateAdvertisementStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Brak tokenu autoryzacji");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/advertisements/${id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Błąd podczas aktualizacji statusu");
      }

      // Update local state so PENDING ads show first and newly accepted stays on top
      setAdvertisements((prev) => {
        const updated = prev.map((ad) =>
          ad.id === id
            ? {
                ...ad,
                status,
                approvedAt:
                  status === "ACTIVE"
                    ? new Date().toISOString()
                    : ad.approvedAt,
              }
            : ad
        );
        // inline sorting: PENDING first, then ACTIVE by approvedAt, then newest created
        return updated.slice().sort((a: Advertisement, b: Advertisement) => {
          if (a.status === "PENDING" && b.status !== "PENDING") return -1;
          if (b.status === "PENDING" && a.status !== "PENDING") return 1;
          if (a.status === "ACTIVE" && b.status === "ACTIVE") {
            const aApproved = a.approvedAt
              ? new Date(a.approvedAt).getTime()
              : 0;
            const bApproved = b.approvedAt
              ? new Date(b.approvedAt).getTime()
              : 0;
            if (aApproved || bApproved) return bApproved - aApproved;
          }
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      });

      alert(
        `Ogłoszenie zostało ${
          status === "ACTIVE" ? "zatwierdzone" : "odrzucone"
        }`
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Wystąpił błąd");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-gray-100 text-gray-800";
      case "SOLD":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      case "SOLD":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Oczekuje";
      case "ACTIVE":
        return "Zatwierdzone";
      case "REJECTED":
        return "Odrzucone";
      case "SOLD":
        return "Sprzedane";
      default:
        return "Nieznany";
    }
  };

  const filteredAds = advertisements.filter((ad) => {
    // Nie pokazuj odrzuconych ogłoszeń
    if (ad.status === "REJECTED") {
      return false;
    }

    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginacja
  const totalPages = Math.ceil(filteredAds.length / adsPerPage);
  const startIndex = (currentPage - 1) * adsPerPage;
  const endIndex = startIndex + adsPerPage;
  const currentAds = filteredAds.slice(startIndex, endIndex);

  // Reset strony przy zmianie wyszukiwania
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
            {/* Header z ikoną ShoppingBag */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-600 p-4 rounded-full">
                  <ShoppingBag className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Moderacja ogłoszeń
                  </h1>
                  <p className="text-gray-300">
                    Zarządzaj i moderuj ogłoszenia użytkowników
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {
                      advertisements.filter((ad) => ad.status === "PENDING")
                        .length
                    }
                  </div>
                  <div className="text-sm text-yellow-100 mt-1">Oczekujące</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {
                      advertisements.filter((ad) => ad.status === "ACTIVE")
                        .length
                    }
                  </div>
                  <div className="text-sm text-green-100 mt-1">
                    Zatwierdzone
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-600 to-gray-800 p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {
                      advertisements.filter((ad) => ad.status === "REJECTED")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-100 mt-1">Odrzucone</div>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 bg-gray-700 rounded-lg flex-shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj ogłoszeń lub użytkowników..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-300">Ładowanie ogłoszeń...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  Błąd
                </h3>
                <p className="text-red-300 mb-4">{error}</p>
                <button
                  onClick={fetchAdvertisements}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {/* Ads List */}
            {!loading && !error && (
              <div className="border border-gray-700 rounded-lg">
                <div className="space-y-4 p-4">
                  {/* Advertisements container */}
                  {currentAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="border border-gray-600 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-r from-gray-800 to-gray-700"
                      onClick={() => navigate(`/smartfon/${ad.id}`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Ad Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-white">
                                {ad.title}
                              </h3>
                              <p className="text-gray-300 text-sm mt-1">
                                {ad.description}
                              </p>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                                ad.status
                              )}`}
                            >
                              {getStatusIcon(ad.status)}
                              {getStatusText(ad.status)}
                            </div>
                          </div>

                          {/* Ad Details */}
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {ad.userName || "Brak użytkownika"}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {ad.price} zł
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {ad.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(ad.createdAt).toLocaleDateString(
                                "pl-PL"
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                          {/* Przycisk Zatwierdź - tylko dla ogłoszeń PENDING */}
                          {ad.status === "PENDING" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAdvertisementStatus(ad.id, "ACTIVE");
                              }}
                              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Zatwierdź
                            </button>
                          )}

                          {/* Przycisk Odrzuć - tylko dla ogłoszeń PENDING i ACTIVE */}
                          {ad.status !== "REJECTED" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectingAdId(ad.id);
                                setShowRejectModal(true);
                              }}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Odrzuć
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Empty State */}
                  {filteredAds.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        Brak ogłoszeń
                      </h3>
                      <p className="text-gray-400">
                        Nie znaleziono ogłoszeń spełniających kryteria
                        wyszukiwania.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && filteredAds.length > 0 && (
              <div className="flex items-center justify-between px-4 py-4 bg-gray-800 border-t border-gray-700">
                <div className="text-sm text-gray-300">
                  Pokazuję {startIndex + 1}-
                  {Math.min(endIndex, filteredAds.length)} z{" "}
                  {filteredAds.length} ogłoszeń
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Poprzednia
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === page
                              ? "bg-purple-600 text-white"
                              : "bg-gray-700 text-white hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Następna
                  </button>
                </div>
              </div>
            )}
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-gray-600 text-xl font-semibold mb-4">
              Odrzuć ogłoszenie
            </h3>
            <p className="text-gray-600 mb-4">
              Wybierz powód odrzucenia ogłoszenia:
            </p>
            <div className="space-y-3 mb-4">
              {rejectReasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-900 flex-1">{reason}</span>
                </label>
              ))}
            </div>
            {rejectReason === "Inne (proszę podać powód)" && (
              <textarea
                placeholder="Podaj własny powód..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                rows={3}
              />
            )}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingAdId(null);
                  setRejectReason("");
                  setCustomReason("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Anuluj
              </button>
              <button
                onClick={handleRejectWithReason}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Odrzuć
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeracjaOgloszen;
