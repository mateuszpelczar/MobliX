import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Plus,
  Edit3,
  Pause,
  Play,
  Trash2,
  Eye,
  Calendar,
  MoreVertical,
  CheckCircle,
  Bell,
  Heart,
  Search,
  MapPin,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

type Ad = {
  id: number;
  title: string;
  price: number;
  category: string;
  date: string;
  status: "active" | "sold" | "paused" | "pending" | "rejected";
  views: number;
  images: string[];
};

const tabLabels = [
  { key: "pending", label: "Oczekujące" },
  { key: "active", label: "Aktywne" },
  { key: "sold", label: "Sprzedane" },
  { key: "paused", label: "Wstrzymane" },
  { key: "rejected", label: "Odrzucone" },
];

const YourAds: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<
    "pending" | "active" | "sold" | "paused" | "rejected"
  >("pending");
  const [adDropdownOpen, setAdDropdownOpen] = useState<number | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    rejected: number;
  }>({ total: 0, active: 0, pending: 0, rejected: 0 });

  // track deletes in progress to prevent parallel deletes and UI race conditions
  const [deleteInProgressMap, setDeleteInProgressMap] = useState<
    Record<number, boolean>
  >({});

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

  // Debug adDropdownOpen changes
  useEffect(() => {
    console.log("adDropdownOpen state changed to:", adDropdownOpen);
  }, [adDropdownOpen]);

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

  // Funkcje do obsługi akcji na ogłoszeniach
  const handleDeleteAd = async (adId: number) => {
    if (deleteInProgressMap[adId]) {
      // already in progress
      return;
    }

    if (!confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;

    // set in progress
    setDeleteInProgressMap((m) => ({ ...m, [adId]: true }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/advertisements/${adId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setAds((prev) => prev.filter((ad) => ad.id !== adId));
        alert("Ogłoszenie zostało usunięte");
      } else {
        const errorText = await response.text();
        console.error("Delete error:", errorText);
        // Przydatne: pokaż bardziej szczegółową wiadomość, jeśli backend zwróci info
        alert(
          "Błąd podczas usuwania ogłoszenia. " +
            (errorText ? `Serwer: ${errorText}` : "")
        );
      }
    } catch (error) {
      console.error("Delete exception:", error);
      alert("Wystąpił błąd podczas usuwania");
    } finally {
      // release in-progress flag
      setDeleteInProgressMap((m) => ({ ...m, [adId]: false }));
      setAdDropdownOpen(null);
    }
  };

  const handleChangeStatus = async (adId: number, newStatus: string) => {
    console.log(
      "handleChangeStatus called with ID:",
      adId,
      "Status:",
      newStatus
    );

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:8080/api/advertisements/${adId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        setAds(
          ads.map((ad) =>
            ad.id === adId
              ? {
                  ...ad,
                  status: newStatus.toLowerCase() as
                    | "active"
                    | "sold"
                    | "paused",
                }
              : ad
          )
        );
        const statusText =
          newStatus === "SOLD"
            ? "sprzedane"
            : newStatus === "PAUSED"
            ? "wstrzymane"
            : "aktywne";
        alert(`Ogłoszenie zostało oznaczone jako ${statusText}`);
      } else {
        const errorText = await response.text();
        console.error("Status change error:", errorText);
        alert("Błąd podczas zmiany statusu ogłoszenia");
      }
    } catch (error) {
      console.error("Status change exception:", error);
      alert("Wystąpił błąd podczas zmiany statusu");
    } finally {
      setAdDropdownOpen(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      // Zamknij dropdown ogłoszeń tylko jeśli kliknięto poza nim
      const adDropdownElements =
        document.querySelectorAll("[data-ad-dropdown]");
      let clickedOutsideAdDropdown = true;

      adDropdownElements.forEach((element) => {
        if (element.contains(event.target as Node)) {
          clickedOutsideAdDropdown = false;
        }
      });

      if (clickedOutsideAdDropdown) {
        console.log("Closing adDropdown due to outside click");
        setAdDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Pobieranie ogłoszeń użytkownika
  useEffect(() => {
    const fetchUserAds = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:8080/api/advertisements/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched user ads data:", data);

          // Mapowanie danych z backendu na format frontend
          const mappedAds: Ad[] = data.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            price: ad.price,
            category: ad.categoryName || "Smartfony",
            date: new Date(ad.createdAt).toLocaleDateString(),
            status: (ad.status?.toLowerCase() === "active"
              ? "active"
              : ad.status?.toLowerCase() === "sold"
              ? "sold"
              : ad.status?.toLowerCase() === "pending"
              ? "pending"
              : ad.status?.toLowerCase() === "rejected"
              ? "rejected"
              : "paused") as
              | "pending"
              | "active"
              | "sold"
              | "paused"
              | "rejected",
            views: ad.viewCount || 0,
            images:
              ad.imageUrls && ad.imageUrls.length > 0
                ? ad.imageUrls
                : ["/api/placeholder/400/300"],
          }));
          console.log("Mapped ads:", mappedAds);
          setAds(mappedAds);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          console.error(
            "Błąd podczas pobierania ogłoszeń użytkownika:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszeń użytkownika:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAds();
    fetchFavoriteCount();
  }, [navigate]);

  // Pobieranie statystyk ogłoszeń użytkownika
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:8080/api/advertisements/user/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania statystyk:", error);
      }
    };

    fetchStats();
  }, [ads]); // Odświeżaj statystyki gdy zmienią się ogłoszenia

  const filtered = ads.filter((ad) => ad.status === activeTab);
  console.log("Filtered ads for tab", activeTab, ":", filtered);

  const handleMessengerClick = () => {
    navigate("/user/message");
  };

  const handleNotificationsClick = () => {
    navigate("/user/notifications");
  };

  const handleWatchedAdsClick = () => {
    navigate("/user/watchedads");
  };

  // Inicjuj edycję bez ustawiania statusu na PENDING od razu.
  // Status powinien być ustawiony na PENDING TYLKO gdy rzeczywiście
  // wystąpią istotne zmiany (robimy to po stronie backendu przy PUT).
  const handleEditInitiate = async (adId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Nie PATCHujemy statusu tutaj — przechodzimy bezpośrednio do formularza edycji.
      setAdDropdownOpen(null);
      navigate(`/user/edit-ad/${adId}`);
    } catch (error) {
      console.error("Błąd podczas inicjacji edycji:", error);
      setAdDropdownOpen(null);
      navigate(`/user/edit-ad/${adId}`);
    }
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/smartfony?search=${searchQuery.trim()}`);
            }}
            className="flex-1 max-w-2xl"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj smartfonów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            {/* Ikona czatu */}
            <button
              onClick={handleMessengerClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Ikona powiadomień */}
            <button
              onClick={handleNotificationsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>

            {/* Ikona ulubionych */}
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

            {/* Przycisk dodaj ogłoszenie */}
            <button
              onClick={() => navigate("/user/addadvertisement")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj ogłoszenie
            </button>

            {/* Dropdown Twoje konto */}
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
                        <User className="w-4 h-4 text-blue-400" />
                        Panel użytkownika
                      </button>
                    )}
                    <div className="border-t border-purple-500 my-1"></div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/";
                      }}
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
          {/* Tytuł strony */}
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            Twoje Ogłoszenia
          </h1>

          {/* Zakładki */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap gap-3 justify-center">
            {tabLabels.map((tab) => {
              const getCount = () => {
                switch (tab.key) {
                  case "pending":
                    return stats.pending;
                  case "active":
                    return stats.active;
                  case "rejected":
                    return stats.rejected;
                  case "sold":
                  case "paused":
                    return ads.filter((ad) => ad.status === tab.key).length;
                  default:
                    return 0;
                }
              };

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {tab.label} ({getCount()})
                </button>
              );
            })}
          </div>

          {/* Przycisk dodaj nowe ogłoszenie */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate("/user/addadvertisement")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj nowe ogłoszenie
            </button>
          </div>

          {/* Lista ogłoszeń */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-white text-lg">
                  Ładowanie Twoich ogłoszeń...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-white text-lg">
                  Brak ogłoszeń w tej kategorii
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Dodaj swoje pierwsze ogłoszenie
                </p>
              </div>
            ) : (
              filtered.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-gray-800 border border-purple-500 rounded-lg p-6 hover:border-purple-400 transition-all"
                >
                  <div className="flex gap-4">
                    {/* Zdjęcie */}
                    <div className="flex-shrink-0">
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-32 h-32 object-cover rounded-lg bg-gray-700 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/smartfon/${ad.id}`);
                        }}
                      />
                    </div>

                    {/* Informacje o ogłoszeniu */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3
                          className="text-xl font-bold text-white cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/smartfon/${ad.id}`);
                          }}
                        >
                          {ad.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            ad.status === "active"
                              ? "bg-green-500 text-white"
                              : ad.status === "sold"
                              ? "bg-red-500 text-white"
                              : ad.status === "pending"
                              ? "bg-blue-500 text-white"
                              : ad.status === "rejected"
                              ? "bg-gray-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {ad.status === "active"
                            ? "Aktywne"
                            : ad.status === "sold"
                            ? "Sprzedane"
                            : ad.status === "pending"
                            ? "Oczekujące"
                            : ad.status === "rejected"
                            ? "Odrzucone"
                            : "Wstrzymane"}
                        </span>
                      </div>

                      <p className="text-2xl font-bold text-purple-400 mb-3">
                        {ad.price.toLocaleString()} zł
                      </p>

                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-300 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-400" />
                          <span>{ad.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>{ad.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-purple-400" />
                          <span>{ad.views} wyświetleń</span>
                        </div>
                      </div>

                      {/* Przycisk edytuj */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-gray-400">ID: {ad.id}</div>

                        {/* Dropdown Menu */}
                        <div className="relative" data-ad-dropdown>
                          {/* Hide three-dots trigger for regular users when ad is sold; staff/admin still see it */}
                          {!(ad.status === "sold" && isUser) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAdDropdownOpen(
                                  adDropdownOpen === ad.id ? null : ad.id
                                );
                              }}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-300" />
                            </button>
                          )}

                          {adDropdownOpen === ad.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
                              <div className="py-1">
                                {/* Edytuj - ukryj dla ogłoszeń 'rejected' i 'sold' */}
                                {ad.status !== "rejected" &&
                                  ad.status !== "sold" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditInitiate(ad.id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                                    >
                                      <Edit3 className="w-4 h-4 text-blue-400" />
                                      Edytuj
                                    </button>
                                  )}

                                {/* Wstrzymaj/Aktywuj */}
                                {ad.status === "active" ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeStatus(ad.id, "PAUSED");
                                      setAdDropdownOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                                  >
                                    <Pause className="w-4 h-4 text-yellow-400" />
                                    Wstrzymaj
                                  </button>
                                ) : ad.status === "paused" ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleChangeStatus(ad.id, "ACTIVE");
                                      setAdDropdownOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                                  >
                                    <Play className="w-4 h-4 text-green-400" />
                                    Aktywuj
                                  </button>
                                ) : ad.status === "pending" ? (
                                  <div className="px-4 py-2 text-sm text-gray-400 italic">
                                    Oczekuje na moderację
                                  </div>
                                ) : ad.status === "rejected" ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditInitiate(ad.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                                  >
                                    <Edit3 className="w-4 h-4 text-blue-400" />
                                    Popraw i wyślij ponownie
                                  </button>
                                ) : null}

                                {/* Sprzedane */}
                                {ad.status !== "sold" &&
                                  ad.status !== "pending" &&
                                  ad.status !== "rejected" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleChangeStatus(ad.id, "SOLD");
                                        setAdDropdownOpen(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 flex items-center gap-2"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                      Oznacz jako sprzedane
                                    </button>
                                  )}

                                {/* Usuń - widoczny tylko dla admin/staff lub gdy ogłoszenie jest PENDING/ACTIVE */}
                                {(isAdmin ||
                                  isStaff ||
                                  ad.status === "pending" ||
                                  ad.status === "active") && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // call deletion which handles locking via deleteInProgressMap
                                      handleDeleteAd(ad.id);
                                    }}
                                    disabled={!!deleteInProgressMap[ad.id]}
                                    className={`w-full text-left px-4 py-2 text-sm ${
                                      deleteInProgressMap[ad.id]
                                        ? "text-gray-400"
                                        : "text-red-400 hover:bg-gray-600"
                                    } flex items-center gap-2`}
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                    {deleteInProgressMap[ad.id]
                                      ? "Usuwanie..."
                                      : "Usuń"}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Temporary: allow USER to delete sold ads from the 'Sprzedane' tab */}
                        {ad.status === "sold" &&
                          isUser &&
                          activeTab === "sold" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAd(ad.id);
                              }}
                              disabled={!!deleteInProgressMap[ad.id]}
                              className={`ml-3 px-3 py-1 text-sm rounded-lg flex items-center gap-2 ${
                                {
                                  true: "text-gray-400",
                                }[String(!!deleteInProgressMap[ad.id])] ||
                                "text-red-400 hover:bg-gray-600"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              {deleteInProgressMap[ad.id]
                                ? "Usuwanie..."
                                : "Usuń"}
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Czarna stopka */}
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <a
              href="/jak-dziala-moblix"
              className="hover:text-purple-400 transition-colors"
            >
              Jak działa MobliX
            </a>
            <a
              href="/polityka-cookies"
              className="hover:text-purple-400 transition-colors"
            >
              Polityka cookies
            </a>
            <a
              href="/regulamin"
              className="hover:text-purple-400 transition-colors"
            >
              Regulamin
            </a>
            <a
              href="/zasady-bezpieczenstwa"
              className="hover:text-purple-400 transition-colors"
            >
              Zasady bezpieczeństwa
            </a>
          </div>
          <div className="text-center mt-4 text-gray-400 text-xs">
            © 2024 MobliX. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default YourAds;
