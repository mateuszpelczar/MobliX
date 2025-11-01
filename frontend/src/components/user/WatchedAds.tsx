import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
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
  Eye,
  Heart,
  Trash2,
  MapPin,
  AlertCircle,
  Loader,
} from "lucide-react";

type FavoriteAd = {
  id: number;
  title: string;
  price: number;
  location: string;
  imageUrls: string[];
  condition: string;
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
        setFavoriteAds(response.data);
        setFavoriteCount(response.data.length);
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

  // Usuń z ulubionych
  const handleRemoveFavorite = async (adId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`http://localhost:8080/api/favorites/${adId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Odśwież listę
      setFavoriteAds((prev) => prev.filter((ad) => ad.id !== adId));
      setFavoriteCount((prev) => prev - 1);
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

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div
          className="container mx-auto px-4 relative pb-12 max-w-5xl"
          style={{ paddingTop: "550px" }}
        >
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8 w-full flex flex-col gap-6 min-h-[300px] border-t-4 border-purple-500">
            {/* Header with gradient background and icon */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg -z-10"></div>
              <div className="flex items-center justify-center gap-2 py-4">
                <Heart className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Ulubione Ogłoszenia
                </h2>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-gray-700 font-medium">
                  {favoriteCount}{" "}
                  {favoriteCount === 1
                    ? "ulubione ogłoszenie"
                    : "ulubionych ogłoszeń"}
                </span>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader className="w-12 h-12 text-purple-600 animate-spin" />
                <p className="text-gray-600 mt-4">
                  Ładowanie ulubionych ogłoszeń...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-600 mt-4">{error}</p>
              </div>
            ) : favoriteAds.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  Nie masz jeszcze żadnych ulubionych ogłoszeń
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Dodaj ogłoszenia do ulubionych klikając ikonę serduszka
                </p>
                <button
                  onClick={() => navigate("/smartfony")}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <Eye className="w-4 h-4 inline mr-2" />
                  Przeglądaj ogłoszenia
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {favoriteAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:border-purple-300 group"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
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
                                : "/api/placeholder/400/300"
                            }
                            alt={ad.title}
                            className="w-full lg:w-32 h-32 object-cover bg-gray-200 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow space-y-3">
                        <div>
                          <h3
                            className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors cursor-pointer"
                            onClick={() => handleViewAd(ad.id)}
                          >
                            {ad.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              <span>{ad.location || "Brak lokalizacji"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                {ad.condition || "Nie podano"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="text-2xl font-bold text-purple-600">
                            {ad.price
                              ? `${ad.price.toLocaleString()} zł`
                              : "Cena do ustalenia"}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewAd(ad.id)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              Zobacz
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(ad.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2 text-sm"
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
            )}
          </div>
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

export default WatchedAds;
