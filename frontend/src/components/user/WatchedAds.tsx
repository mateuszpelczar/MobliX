import React, { useState, useRef } from "react";
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
  Eye,
  Heart,
  Clock,
  Calendar,
  Tag,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Bookmark,
} from "lucide-react";

type WatchedAd = {
  id: number;
  title: string;
  price: number;
  category: string;
  location: string;
  dateAdded: string;
  views: number;
  isFavorite: boolean;
  imageUrl: string;
  seller: string;
};

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data - watched ads
  const [watchedAds] = useState<WatchedAd[]>([
    {
      id: 1,
      title: "iPhone 14 Pro 128GB Space Black",
      price: 4200,
      category: "Telefony",
      location: "Warszawa",
      dateAdded: "2025-08-28",
      views: 156,
      isFavorite: true,
      imageUrl: "/api/placeholder/400/300",
      seller: "TechStore_PL",
    },
    {
      id: 2,
      title: 'MacBook Air M2 13" 256GB',
      price: 5800,
      category: "Komputery",
      location: "Kraków",
      dateAdded: "2025-08-25",
      views: 89,
      isFavorite: true,
      imageUrl: "/api/placeholder/400/300",
      seller: "AppleCenter",
    },
    {
      id: 3,
      title: "Samsung Galaxy S23 Ultra 512GB",
      price: 3900,
      category: "Telefony",
      location: "Gdańsk",
      dateAdded: "2025-08-22",
      views: 203,
      isFavorite: false,
      imageUrl: "/api/placeholder/400/300",
      seller: "SamsungOfficial",
    },
    {
      id: 4,
      title: "Nintendo Switch OLED + gry",
      price: 1450,
      category: "Konsole",
      location: "Wrocław",
      dateAdded: "2025-08-20",
      views: 67,
      isFavorite: true,
      imageUrl: "/api/placeholder/400/300",
      seller: "GameHub",
    },
  ]);

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

  const handleRemoveFromWatched = (id: number) => {
    console.log(`Usuń z obserwowanych: ${id}`);
  };

  const handleToggleFavorite = (id: number) => {
    console.log(`Przełącz ulubione: ${id}`);
  };

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
                <Eye className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Obserwowane Ogłoszenia
                </h2>
              </div>
            </div>

            {/* Stats and filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700 font-medium text-sm">
                    {watchedAds.length} obserwowanych
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-gray-700 font-medium text-sm">
                    {watchedAds.filter((ad) => ad.isFavorite).length} ulubionych
                  </span>
                </div>
              </div>
              {/* <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                  <option>Wszystkie kategorie</option>
                  <option>Telefony</option>
                  <option>Komputery</option>
                  <option>Konsole</option>
                </select>
              </div> */}
            </div>

            {/* Watched ads grid */}
            {watchedAds.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  Nie obserwujesz jeszcze żadnych ogłoszeń
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Zacznij obserwować interesujące Cię oferty
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <Search className="w-4 h-4 inline mr-2" />
                  Przeglądaj ogłoszenia
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {watchedAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all duration-300 hover:border-purple-300 group"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-full lg:w-32 h-32 object-cover bg-gray-200 group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => handleToggleFavorite(ad.id)}
                            className={`absolute top-2 right-2 p-1 rounded-full transition-all duration-200 ${
                              ad.isFavorite
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                          >
                            <Heart
                              className={`w-3 h-3 ${
                                ad.isFavorite ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                            {ad.title}
                          </h3>
                          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {ad.price.toLocaleString()} zł
                          </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Tag className="w-4 h-4 text-purple-500" />
                            <span>{ad.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{ad.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span>{ad.dateAdded}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Eye className="w-4 h-4 text-orange-500" />
                            <span>{ad.views} wyświetleń</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{ad.seller}</span>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => navigate(`/ad/${ad.id}`)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                              Zobacz
                            </button>
                            <button
                              onClick={() => handleRemoveFromWatched(ad.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md"
                            >
                              <Bookmark className="w-4 h-4" />
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

export default EditAd;
