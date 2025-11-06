import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
  Star,
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
  Tag,
  MoreVertical,
  CheckCircle,
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
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    rejected: number;
  }>({ total: 0, active: 0, pending: 0, rejected: 0 });

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
    console.log("handleDeleteAd called with ID:", adId);

    if (!confirm("Czy na pewno chcesz usunąć to ogłoszenie?")) return;

    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token ? "exists" : "missing");

      const response = await fetch(
        `http://localhost:8080/api/advertisements/${adId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete response status:", response.status);

      if (response.ok) {
        setAds(ads.filter((ad) => ad.id !== adId));
        alert("Ogłoszenie zostało usunięte");
      } else {
        const errorText = await response.text();
        console.error("Delete error:", errorText);
        alert("Błąd podczas usuwania ogłoszenia");
      }
    } catch (error) {
      console.error("Delete exception:", error);
      alert("Wystąpił błąd podczas usuwania");
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
      console.log("Token:", token ? "exists" : "missing");

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

      console.log("Status change response:", response.status);

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
                    <LogOut className="w-4 h-4 text-red-500" />
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
            className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-8 min-h-[300px] max-h-[80vh] overflow-y-auto border-t-4 border-blue-500"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#8B5CF6 #F3F4F6",
            }}
          >
            {/* Header with gradient background */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg -z-10"></div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-6">
                Twoje Ogłoszenia
              </h1>
            </div>

            {/* Tabs with modern design */}
            <div className="flex flex-wrap justify-center gap-2 bg-gray-50 p-2 rounded-xl">
              {tabLabels.map((tab) => {
                // Mapowanie klucza zakładki na klucz statystyk
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
                      // Backend nie ma jeszcze tych statusów w statystykach
                      return ads.filter((ad) => ad.status === tab.key).length;
                    default:
                      return 0;
                  }
                };

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === tab.key
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                        : "text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-md"
                    }`}
                  >
                    {tab.label} ({getCount()})
                  </button>
                );
              })}
            </div>

            {/* Add new ad button with icon */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/user/addadvertisement")}
                className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 font-semibold"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Dodaj nowe ogłoszenie
              </button>
            </div>

            {/* Ads List with modern cards */}
            <div className="grid gap-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600 text-lg">
                    Ładowanie Twoich ogłoszeń...
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
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
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300 group cursor-pointer"
                    onClick={() => navigate(`/smartfon/${ad.id}`)}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={ad.images[0]}
                            alt={ad.title}
                            className="w-full lg:w-40 h-40 object-cover bg-gray-200 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                ad.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : ad.status === "sold"
                                  ? "bg-red-100 text-red-700"
                                  : ad.status === "pending"
                                  ? "bg-blue-100 text-blue-700"
                                  : ad.status === "rejected"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {ad.status === "active"
                                ? "Aktywne"
                                : ad.status === "sold"
                                ? "Sprzedane"
                                : ad.status === "pending"
                                ? "Oczekuje"
                                : ad.status === "rejected"
                                ? "Odrzucone"
                                : "Wstrzymane"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {ad.title}
                          </h3>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {ad.price.toLocaleString()} zł
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Tag className="w-4 h-4 text-blue-500" />
                            <span>{ad.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span>{ad.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Eye className="w-4 h-4 text-purple-500" />
                            <span>{ad.views} wyświetleń</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>ID: {ad.id}</span>
                          </div>

                          {/* Dropdown Menu z kropkami */}
                          <div className="relative" data-ad-dropdown>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("=== DROPDOWN CLICK DEBUG ===");
                                console.log("Ad ID:", ad.id);
                                console.log(
                                  "Current adDropdownOpen:",
                                  adDropdownOpen
                                );
                                console.log(
                                  "Comparison adDropdownOpen === ad.id:",
                                  adDropdownOpen === ad.id
                                );

                                const newValue =
                                  adDropdownOpen === ad.id ? null : ad.id;
                                console.log(
                                  "Setting adDropdownOpen to:",
                                  newValue
                                );

                                setAdDropdownOpen(newValue);

                                console.log("=== END DROPDOWN CLICK DEBUG ===");
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>

                            {adDropdownOpen === ad.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 pointer-events-auto">
                                <div className="py-1">
                                  {/* Edytuj */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Edit button clicked for ad ID:",
                                        ad.id
                                      );
                                      navigate(`/user/edit-ad/${ad.id}`);
                                      setAdDropdownOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-black bg-white hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit3 className="w-4 h-4 text-blue-500" />
                                    Edytuj
                                  </button>

                                  {/* Wstrzymaj/Aktywuj */}
                                  {ad.status === "active" ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(
                                          "Pause button clicked for ad ID:",
                                          ad.id
                                        );
                                        handleChangeStatus(ad.id, "PAUSED");
                                        setAdDropdownOpen(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-black bg-white hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Pause className="w-4 h-4 text-yellow-500" />
                                      Wstrzymaj
                                    </button>
                                  ) : ad.status === "paused" ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(
                                          "Activate button clicked for ad ID:",
                                          ad.id
                                        );
                                        handleChangeStatus(ad.id, "ACTIVE");
                                        setAdDropdownOpen(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-black bg-white hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Play className="w-4 h-4 text-green-500" />
                                      Aktywuj
                                    </button>
                                  ) : ad.status === "pending" ? (
                                    <div className="px-4 py-2 text-sm text-gray-500 italic">
                                      Ogłoszenie oczekuje na moderację
                                    </div>
                                  ) : ad.status === "rejected" ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // TODO: Implementacja funkcji poprawy ogłoszenia
                                        console.log("Edit rejected ad:", ad.id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-black bg-white hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit3 className="w-4 h-4 text-blue-500" />
                                      Popraw i wyślij ponownie
                                    </button>
                                  ) : null}

                                  {/* Sprzedane (tylko dla active i paused) */}
                                  {ad.status !== "sold" &&
                                    ad.status !== "pending" &&
                                    ad.status !== "rejected" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Sold button clicked for ad ID:",
                                            ad.id
                                          );
                                          handleChangeStatus(ad.id, "SOLD");
                                          setAdDropdownOpen(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-black bg-white hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Oznacz jako sprzedane
                                      </button>
                                    )}

                                  {/* Usuń */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Delete button clicked for ad ID:",
                                        ad.id
                                      );
                                      handleDeleteAd(ad.id);
                                      setAdDropdownOpen(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 bg-white hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                    Usuń
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
    </div>
  );
};

export default YourAds;
