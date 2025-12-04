import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  LogIn,
  Bell,
  Heart,
  Search,
  Plus,
} from "lucide-react";
import SearchBar from "./SearchBar";
import "../styles/MobileResponsive.css";

interface SmartphoneData {
  id: number;
  title: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  location: string;
  condition: "nowy" | "używany" | "uszkodzony";
  images: string[];
  seller: string;
  dateAdded: string;
  views: number;
  likes: number;
  description: string;
  specifications: {
    storage: string;
    ram: string;
    color: string;
    batteryCapacity: string;
    screenSize: string;
    cameraMP: string;
  };
}

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const MainPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [featuredSmartphones, setFeaturedSmartphones] = useState<
    SmartphoneData[]
  >([]);
  const [latestSmartphones, setLatestSmartphones] = useState<SmartphoneData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Pobieranie najnowszych ogłoszeń z API
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/advertisements/latest"
        );
        if (response.ok) {
          const data = await response.json();

          console.log("Pobrane ogłoszenia:", data); // Debug log

          // Mapowanie danych z backendu na format frontend
          const mappedData: SmartphoneData[] = data.map((ad: any) => {
            console.log(`Ogłoszenie ${ad.id} - viewCount:`, ad.viewCount); // Debug log
            return {
              id: ad.id,
              title: ad.title,
              brand: ad.specification?.brand || "",
              model: ad.specification?.model || "",
              price: ad.price,
              location: ad.location || "Brak lokalizacji",
              condition: ad.condition || "nowy",
              images:
                ad.imageUrls && ad.imageUrls.length > 0
                  ? ad.imageUrls
                  : [
                      "https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia",
                    ],
              seller: ad.userName || "Użytkownik",
              dateAdded: ad.createdAt || ad.dateAdded,
              views: ad.viewCount || 0,
              likes: 0,
              description: ad.description,
              specifications: {
                storage: ad.specification?.storage || "",
                ram: ad.specification?.ram || "",
                color: ad.specification?.color || "",
                batteryCapacity: ad.specification?.batteryCapacity || "",
                screenSize: ad.specification?.displaySize || "",
                cameraMP: ad.specification?.rearCameras || "",
              },
            };
          });

          console.log(
            "Zmapowane dane:",
            mappedData.map((ad) => ({
              id: ad.id,
              title: ad.title,
              views: ad.views,
            }))
          );

          // Sortuj według wyświetleń dla wyróżnionych (max 4)
          const sortedByViews = [...mappedData]
            .sort((a, b) => {
              console.log(
                `Porównanie: ${a.title} (${a.views}) vs ${b.title} (${b.views})`
              );
              return b.views - a.views;
            })
            .slice(0, 4);

          console.log(
            "Wyróżnione oferty:",
            sortedByViews.map((ad) => ({
              id: ad.id,
              title: ad.title,
              views: ad.views,
            }))
          );
          setFeaturedSmartphones(sortedByViews);

          // Filtruj ogłoszenia dodane w ciągu ostatnich 24 godzin
          const now = new Date();
          const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

          const recentAds = mappedData.filter((ad) => {
            const adDate = new Date(ad.dateAdded);
            return adDate >= last24Hours;
          });

          // Sortuj po dacie (najnowsze pierwsze) i weź max 4
          const sortedRecent = recentAds
            .sort(
              (a, b) =>
                new Date(b.dateAdded).getTime() -
                new Date(a.dateAdded).getTime()
            )
            .slice(0, 4);

          setLatestSmartphones(sortedRecent);
        } else {
          console.error(
            "Błąd podczas pobierania ogłoszeń:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszeń:", error);
      } finally {
        setLoading(false);
      }
    };

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  const handleMessengerClick = () => {
    if (isAuthenticated) {
      navigate("/user/message");
    } else {
      navigate("/login");
    }
  };

  const handleNotificationsClick = () => {
    if (isAuthenticated) {
      navigate("/user/notifications");
    } else {
      navigate("/login");
    }
  };

  const handleWatchedAdsClick = () => {
    if (isAuthenticated) {
      navigate("/user/watchedads");
    } else {
      navigate("/login");
    }
  };

  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;
  let isAuthenticated = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";

      if (decoded.exp && Date.now() / 1000 < decoded.exp) {
        isAuthenticated = true;
      }
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  const handleAddAdClick = () => {
    if (isAuthenticated) {
      navigate("/user/addadvertisement");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Czarny pasek nawigacji */}
      <nav className="bg-black text-white px-4 py-2 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div
            className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors"
            onClick={() => navigate("/main")}
          >
            MobliX
          </div>

          {/* Wyszukiwarka */}
          <SearchBar
            onSearch={(query) => {
              if (query) {
                // Log search from navbar
                try {
                  const token = localStorage.getItem("token");
                  let userId = null;

                  if (token) {
                    try {
                      const decoded = jwtDecode<JwtPayLoad>(token);
                      userId = decoded.sub ? parseInt(decoded.sub) : null;
                    } catch (error) {
                      console.error("Error decoding token:", error);
                    }
                  }

                  axios
                    .post("http://localhost:8080/api/search-logs", {
                      searchQuery: query,
                      brand: null,
                      model: null,
                      minPrice: null,
                      maxPrice: null,
                      userId: userId,
                      sessionId: null,
                      resultsCount: null,
                      searchSource: "navbar",
                    })
                    .catch((error) => {
                      console.error("Error logging search:", error);
                    });
                } catch (error) {
                  console.error("Error logging search:", error);
                }

                navigate(`/smartfony?search=${query}`);
              } else {
                navigate("/smartfony");
              }
            }}
          />

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
              onClick={handleAddAdClick}
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
                <div className="absolute right-0 mt-2 w-56 bg-purple-600 rounded-lg shadow-xl py-2 z-50">
                  {token ? (
                    <>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/your-ads");
                        }}
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        Ogłoszenia
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/message");
                        }}
                      >
                        <MessageSquare className="w-4 h-4 text-green-400" />
                        Chat
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/personaldetails");
                        }}
                      >
                        <User className="w-4 h-4 text-purple-300" />
                        Profil
                      </button>
                      {isAdmin && (
                        <button
                          onClick={handleGoToAdminPanel}
                          className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                        >
                          <Shield className="w-4 h-4 text-red-400" />
                          Panel administratora
                        </button>
                      )}
                      {(isAdmin || isStaff) && (
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
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
                          className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
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
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <button
                      className="w-full text-left px-4 py-2 bg-black hover:bg-black flex items-center gap-3 text-white rounded-lg"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn className="w-4 h-4 text-white" />
                      Zaloguj się
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Główna zawartość */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero sekcja z napisem */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              NOWA RZECZYWISTOŚĆ CZEKA.
              <br />
              ZNAJDŹ SWÓJ SMARTFON.
            </h1>
            <p className="text-gray-300 text-lg">
              Sprawdzone oferty • Najlepsze ceny • Bezpieczne transakcje
            </p>
          </div>

          {/* Wyróżnione oferty */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">
              WYRÓŻNIONE OFERTY
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                <p className="mt-4 text-gray-300">Ładowanie ogłoszeń...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredSmartphones.map((phone) => (
                  <div
                    key={phone.id}
                    className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all transform hover:scale-105"
                    onClick={() => navigate(`/smartfon/${phone.id}`)}
                  >
                    <div className="relative mb-4">
                      <img
                        src={phone.images[0]}
                        alt={phone.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {phone.views} wyświetleń
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2 truncate">
                      {phone.title}
                    </h3>
                    <p className="text-purple-400 text-2xl font-bold mb-2">
                      {phone.price.toLocaleString()} zł
                    </p>
                    <p className="text-gray-400 text-sm">
                      {phone.location.split(",")[0]}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ostatnio dodane - tylko jeśli są ogłoszenia z ostatnich 24h */}
          {latestSmartphones.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">
                OSTATNIO DODANE
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
                  <p className="mt-4 text-gray-300">Ładowanie ogłoszeń...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {latestSmartphones.map((phone) => (
                    <div
                      key={phone.id}
                      className="bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all transform hover:scale-105"
                      onClick={() => navigate(`/smartfon/${phone.id}`)}
                    >
                      <div className="relative mb-4">
                        <img
                          src={phone.images[0]}
                          alt={phone.title}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          NOWE
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-2 truncate">
                        {phone.title}
                      </h3>
                      <p className="text-purple-400 text-2xl font-bold mb-2">
                        {phone.price.toLocaleString()} zł
                      </p>
                      <p className="text-gray-400 text-sm">
                        {phone.location.split(",")[0]}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Dodano:{" "}
                        {new Date(phone.dateAdded).toLocaleDateString("pl-PL")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

export default MainPanel;
