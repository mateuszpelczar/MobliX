import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import SearchBar from "../overall/SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Eye,
  Heart,
  Trash2,
  MapPin,
  AlertCircle,
  Loader,
  Search,
  Bell,
  Plus,
  LogIn,
} from "lucide-react";

type FavoriteAd = {
  id: number;
  title: string;
  price: number;
  location: string;
  imageUrls: string[];
  condition: string;
  addedAt?: string;
};

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const WatchedAds: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [favoriteAds, setFavoriteAds] = useState<FavoriteAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 3;

  // Pobierz ulubione ogłoszenia
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<FavoriteAd[]>(
          "http://localhost:8080/api/favorites",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Sortuj od najnowszych (zakładając że backend zwraca addedAt lub sortujemy po id)
        const sortedAds = response.data.sort((a, b) => {
          // Jeśli mamy addedAt, sortuj po dacie
          if (a.addedAt && b.addedAt) {
            return (
              new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
            );
          }
          // W przeciwnym razie sortuj po id (większe id = nowsze)
          return b.id - a.id;
        });

        setFavoriteAds(sortedAds);
        setFavoriteCount(sortedAds.length);
        setError(null);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("Nie udało się pobrać ulubionych ogłoszeń");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  // Funkcja tłumacząca stan telefonu na polski
  const translateCondition = (condition: string): string => {
    const translations: { [key: string]: string } = {
      NEW: "Nowy",
      LIKE_NEW: "Jak nowy",
      VERY_GOOD: "Bardzo dobry",
      GOOD: "Dobry",
      ACCEPTABLE: "Zadowalający",
    };
    return translations[condition] || condition;
  };

  // Usuń z ulubionych
  const handleRemoveFavorite = async (adId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`http://localhost:8080/api/favorites/${adId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Odśwież listę
      const updatedAds = favoriteAds.filter((ad) => ad.id !== adId);
      setFavoriteAds(updatedAds);
      setFavoriteCount((prev) => prev - 1);

      // Jeśli usunęliśmy ostatnie ogłoszenie na stronie i nie jest to pierwsza strona
      const totalPages = Math.ceil(updatedAds.length / adsPerPage);
      if (currentPage > totalPages && currentPage > 1) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Nie udało się usunąć ogłoszenia z ulubionych");
    }
  };

  // Przejdź do szczegółów ogłoszenia
  const handleViewAd = (adId: number) => {
    navigate(`/smartfon/${adId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    setIsDropdownOpen(false);
    navigate("/admin");
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll do góry przy zmianie strony
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

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

          {/* Wyszukiwarka z AI */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            {/* Ikona czatu */}
            <button
              onClick={() => navigate("/user/message")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Ikona powiadomień */}
            <button
              onClick={() => navigate("/user/notifications")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>

            {/* Ikona ulubionych - aktywna */}
            <button
              onClick={() => navigate("/user/watchedads")}
              className="p-2 bg-purple-600 rounded-lg transition-colors relative"
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
              <span className="hidden lg:inline">Dodaj ogłoszenie</span>
            </button>

            {/* Dropdown Twoje konto */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Twoje konto</span>
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
                      className="w-full text-left px-4 py-2 bg-purple-600 hover:bg-black flex items-center gap-3 text-white rounded-lg"
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
        <div className="max-w-6xl mx-auto">
          {/* Header sekcji */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-red-600 rounded-full">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Ulubione Ogłoszenia
            </h1>
            <p className="text-gray-300 text-lg">
              Twoja lista obserwowanych smartfonów
            </p>
          </div>

          {/* Panel statystyk */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-6 h-6 text-red-400" />
              <span className="text-white font-bold text-xl">
                {favoriteCount}{" "}
                {favoriteCount === 1
                  ? "ulubione ogłoszenie"
                  : favoriteCount >= 2 && favoriteCount <= 4
                  ? "ulubione ogłoszenia"
                  : "ulubionych ogłoszeń"}
              </span>
            </div>
          </div>

          {/* Lista ogłoszeń */}
          {loading ? (
            <div className="text-center py-20">
              <Loader className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
              <p className="text-gray-300 text-lg">
                Ładowanie ulubionych ogłoszeń...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-400 font-medium text-lg">{error}</p>
            </div>
          ) : favoriteAds.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-600/20 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Brak ulubionych ogłoszeń
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                Dodaj ogłoszenia do ulubionych klikając ikonę serduszka
              </p>
              <button
                onClick={() => navigate("/smartfony")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
              >
                Przeglądaj ogłoszenia
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {favoriteAds
                  .slice(
                    (currentPage - 1) * adsPerPage,
                    currentPage * adsPerPage
                  )
                  .map((ad) => (
                    <div
                      key={ad.id}
                      className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <div
                            className="relative overflow-hidden rounded-xl cursor-pointer"
                            onClick={() => handleViewAd(ad.id)}
                          >
                            <img
                              src={
                                ad.imageUrls && ad.imageUrls.length > 0
                                  ? ad.imageUrls[0]
                                  : "https://dummyimage.com/400x300/ccc/fff&text=Brak+zdjęcia"
                              }
                              alt={ad.title}
                              className="w-full lg:w-48 h-48 object-cover bg-gray-700 group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-red-500 rounded-full p-2">
                              <Heart className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow space-y-4">
                          <div>
                            <h3
                              className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors cursor-pointer"
                              onClick={() => handleViewAd(ad.id)}
                            >
                              {ad.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span className="text-gray-300">
                                  {ad.location || "Brak lokalizacji"}
                                </span>
                              </div>
                              <div className="px-3 py-1.5 bg-purple-600/30 text-purple-300 rounded-lg text-xs font-medium border border-purple-500/30">
                                {translateCondition(ad.condition) ||
                                  "Nie podano"}
                              </div>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-gray-700/50">
                            <div className="text-3xl font-bold text-purple-400">
                              {ad.price
                                ? `${ad.price.toLocaleString()} zł`
                                : "Cena do ustalenia"}
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleViewAd(ad.id)}
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-purple-500/50"
                              >
                                <Eye className="w-4 h-4" />
                                Zobacz
                              </button>
                              <button
                                onClick={() => handleRemoveFavorite(ad.id)}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-red-500/50"
                              >
                                <Trash2 className="w-4 h-4" />
                                Usuń
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Paginacja */}
              {favoriteAds.length > adsPerPage && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    Poprzednia
                  </button>

                  <div className="flex gap-2">
                    {Array.from(
                      { length: Math.ceil(favoriteAds.length / adsPerPage) },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === page
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 hover:bg-gray-600 text-white"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(favoriteAds.length / adsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(favoriteAds.length / adsPerPage)
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === Math.ceil(favoriteAds.length / adsPerPage)
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    Następna
                  </button>
                </div>
              )}
            </>
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
          <div className="text-center text-gray-400 text-xs mt-4">
            © 2024 MobliX. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WatchedAds;
