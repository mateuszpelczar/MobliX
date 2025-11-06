import React, { useState, useRef, useEffect } from "react";
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
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Calendar,
  MapPin,
  DollarSign,
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
};

const ModeracjaOgloszen: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("wszystkie");
  const [searchTerm, setSearchTerm] = useState("");
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingAdId, setRejectingAdId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

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
  }, []);

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
      // Sort by createdAt descending (newest first)
      const sortedData = data.sort((a: Advertisement, b: Advertisement) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      setAdvertisements(sortedData);
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

      // Odśwież listę ogłoszeń
      fetchAdvertisements();
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
    const matchesFilter =
      selectedFilter === "wszystkie" ||
      (selectedFilter === "pending" && ad.status === "PENDING") ||
      (selectedFilter === "approved" && ad.status === "ACTIVE") ||
      (selectedFilter === "rejected" && ad.status === "REJECTED") ||
      (selectedFilter === "sold" && ad.status === "SOLD");
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
          style={{ paddingTop: "80px" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 h-full min-h-0">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-shrink-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-orange-600" />
                  Moderacja ogłoszeń
                </h2>
                <p className="text-gray-600 mt-2">
                  Zarządzaj i moderuj ogłoszenia użytkowników
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-600">
                    {
                      advertisements.filter((ad) => ad.status === "PENDING")
                        .length
                    }
                  </div>
                  <div className="text-xs text-yellow-500">Oczekujące</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <div className="text-lg font-bold text-green-600">
                    {
                      advertisements.filter((ad) => ad.status === "ACTIVE")
                        .length
                    }
                  </div>
                  <div className="text-xs text-green-500">Zatwierdzone</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                  <div className="text-lg font-bold text-gray-600">
                    {
                      advertisements.filter((ad) => ad.status === "REJECTED")
                        .length
                    }
                  </div>
                  <div className="text-xs text-gray-500">Odrzucone</div>
                </div>
                {/* <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200">
                  <div className="text-lg font-bold text-blue-600">
                    {advertisements.filter((ad) => ad.status === "SOLD").length}
                  </div>
                  <div className="text-xs text-blue-500">Sprzedane</div>
                </div> */}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                >
                  <option value="wszystkie" className="text-black">
                    Wszystkie
                  </option>
                  <option value="pending" className="text-black">
                    Oczekujące
                  </option>
                  <option value="approved" className="text-black">
                    Zatwierdzone
                  </option>
                  <option value="rejected" className="text-black">
                    Odrzucone
                  </option>
                  <option value="sold" className="text-black">
                    Sprzedane
                  </option>
                </select>
              </div>

              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj ogłoszeń lub użytkowników..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="mt-4 text-gray-600">Ładowanie ogłoszeń...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-600 mb-2">
                  Błąd
                </h3>
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchAdvertisements}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {/* Ads List */}
            {!loading && !error && (
              <div className="flex-1 overflow-y-auto min-h-0 max-h-96 border border-gray-100 rounded-lg">
                <div className="space-y-4 p-4">
                  {/* Scrollable advertisements container */}
                  {filteredAds.map((ad) => (
                    <div
                      key={ad.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-r from-white to-gray-50"
                      onClick={() => navigate(`/smartfon/${ad.id}`)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Ad Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {ad.title}
                              </h3>
                              <p className="text-gray-600 text-sm mt-1">
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
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
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
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        Brak ogłoszeń
                      </h3>
                      <p className="text-gray-500">
                        Nie znaleziono ogłoszeń spełniających kryteria
                        wyszukiwania.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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
          </div>
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
                    <span className="text-sm text-gray-900 flex-1">
                      {reason}
                    </span>
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
      </div>
    </div>
  );
};

export default ModeracjaOgloszen;
