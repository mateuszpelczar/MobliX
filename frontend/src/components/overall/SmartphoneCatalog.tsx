import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  User,
  ChevronDown,
  LogOut,
  ShoppingBag,
  MessageSquare,
  Star,
  Shield,
  Users,
  Search,
  MapPin,
  Calendar,
  Smartphone,
  Heart,
  Eye,
  LogIn,
} from "lucide-react";
import "../../styles/MobileResponsive.css";
import { voivodeships } from "../../data/locations";

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
    osType: string;
    osVersion: string;
    frontCamera: string;
    displayTech: string;
    wifi: string;
    bluetooth: string;
    ipRating: string;
    fastCharging: string;
    wirelessCharging: string;
    processor: string;
    gpu: string;
    screenResolution: string;
    refreshRate: string;
  };
}

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const SmartphoneCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lista marek z AddAdvertisement.tsx
  const availableBrands = [
    "Apple",
    "Samsung",
    "Xiaomi",
    "Huawei",
    "OnePlus",
    "Google",
    "Nothing",
    "Realme",
    "Oppo",
    "Vivo",
    "Motorola",
    "Sony",
    "Inne",
  ];

  // Stan dla smartfonów
  const [smartphones, setSmartphones] = useState<SmartphoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie smartfonów z API
  useEffect(() => {
    const fetchSmartphones = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/advertisements"
        );
        if (response.ok) {
          const data = await response.json();
          // Mapowanie danych z backendu na format frontend
          const mappedData: SmartphoneData[] = data.map((ad: any) => ({
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
                : ["https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia"],
            seller: ad.userName || "Użytkownik",
            dateAdded: ad.createdAt || ad.dateAdded,
            views: 0, // Backend nie ma jeszcze tego pola
            likes: 0, // Backend nie ma jeszcze tego pola
            description: ad.description,
            specifications: {
              storage: ad.specification?.storage || "",
              ram: ad.specification?.ram || "",
              color: ad.specification?.color || "",
              batteryCapacity: ad.specification?.batteryCapacity || "",
              screenSize: ad.specification?.displaySize || "",
              cameraMP: ad.specification?.rearCameras || "",
              osType: ad.specification?.osType || "",
              osVersion: ad.specification?.osVersion || "",
              frontCamera: ad.specification?.frontCamera || "",
              displayTech: ad.specification?.displayTech || "",
              wifi: ad.specification?.wifi || "",
              bluetooth: ad.specification?.bluetooth || "",
              ipRating: ad.specification?.ipRating || "",
              fastCharging: ad.specification?.fastCharging || "",
              wirelessCharging: ad.specification?.wirelessCharging || "",
              processor: ad.specification?.processor || "",
              gpu: ad.specification?.gpu || "",
              screenResolution: ad.specification?.screenResolution || "",
              refreshRate: ad.specification?.refreshRate || "",
            },
          }));
          setSmartphones(mappedData);
        } else {
          setError("Błąd podczas pobierania ogłoszeń");
        }
      } catch (err) {
        console.error("Błąd:", err);
        setError("Błąd połączenia z serwerem");
      } finally {
        setLoading(false);
      }
    };

    fetchSmartphones();
  }, []);

  // Filter states
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || "all"
  );
  const [selectedCondition, setSelectedCondition] = useState(
    searchParams.get("condition") || "all"
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get("location") || "all"
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // Close dropdown when clicking outside
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

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedBrand !== "all") params.set("brand", selectedBrand);
    if (selectedCondition !== "all") params.set("condition", selectedCondition);
    if (selectedLocation !== "all") params.set("location", selectedLocation);
    if (priceRange.min) params.set("minPrice", priceRange.min);
    if (priceRange.max) params.set("maxPrice", priceRange.max);
    if (sortBy !== "newest") params.set("sort", sortBy);

    setSearchParams(params);
  }, [
    searchTerm,
    selectedBrand,
    selectedCondition,
    selectedLocation,
    priceRange,
    sortBy,
    setSearchParams,
  ]);

  const token = localStorage.getItem("token");
  let isAuthenticated = false;
  let userRole = "";
  let isAdmin = false;
  let isStaff = false;

  if (token) {
    try {
      const decodedToken = jwtDecode<JwtPayLoad>(token);
      isAuthenticated = true;
      userRole = decodedToken.role;
      isAdmin = userRole === "ADMIN";
      isStaff = userRole === "STAFF" || isAdmin;
    } catch (error) {
      localStorage.removeItem("token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Filter smartphones based on search criteria
  const filteredSmartphones = smartphones
    .filter((phone) => {
      const matchesSearch = phone.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesBrand =
        selectedBrand === "all" || phone.brand === selectedBrand;
      const matchesCondition =
        selectedCondition === "all" || phone.condition === selectedCondition;
      const matchesLocation =
        selectedLocation === "all" ||
        phone.location.toLowerCase().includes(selectedLocation.toLowerCase());
      const matchesMinPrice =
        !priceRange.min || phone.price >= parseInt(priceRange.min);
      const matchesMaxPrice =
        !priceRange.max || phone.price <= parseInt(priceRange.max);

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCondition &&
        matchesLocation &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "oldest":
          return (
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          );
        case "newest":
        default:
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
      }
    });

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        {/* Logo in top left */}
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/main")}
          style={{ userSelect: "none" }}
        >
          MobliX
        </div>

        {/* Account dropdown in top right corner */}
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button text-sm sm:text-base whitespace-nowrap px-2 sm:px-4"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              Twoje konto
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ml-1 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
                <div className="py-1">
                  {isAuthenticated ? (
                    <>
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
                        Chat
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
                      {isStaff && (
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
                      {(isAdmin || isStaff || isAuthenticated) && (
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
                        onClick={handleLogout}
                        className="dropdown-logout flex items-center gap-3 px-4 py-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <button
                      className="dropdown-logout w-full text-left flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn className="w-4 h-4 text-green-600" />
                      Zaloguj się
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Fioletowe tło */}
      <div className="panel-content flex-grow w-full overflow-y-auto bg-purple-600">
        <div className="container mx-auto px-4 relative pt-32 pb-12 max-w-7xl">
          {/* Jeden biały kontener na fioletowym tle */}
          <div className="bg-white rounded-lg shadow-lg p-6 min-h-[80vh] mt-80">
            {/* Tytuł strony po lewej stronie - standardowy rozmiar */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Katalog smartfonów
              </h1>
              <p className="text-base text-gray-600">
                Znajdź swój idealny smartfon spośród setek ogłoszeń
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filtry po lewej stronie - przesunięte w dół */}
              <div className="lg:w-1/4 lg:min-w-[280px]">
                {/* Tytuł sekcji filtrów */}
                <h2 className="text-lg font-bold text-gray-900 mb-4">Filtry</h2>

                {/* Search Bar */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Szukaj smartfonów..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-4">
                  {/* Brand Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marka
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Wszystkie marki</option>
                      {availableBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stan
                    </label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Wszystkie stany</option>
                      <option value="nowy">Nowy</option>
                      <option value="używany">Używany</option>
                      <option value="uszkodzony">Uszkodzony</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokalizacja
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Wszystkie lokalizacje</option>
                      {voivodeships.map((voivodeship) => (
                        <option key={voivodeship.name} value={voivodeship.name}>
                          {voivodeship.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sortowanie
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="newest">Najnowsze</option>
                      <option value="oldest">Najstarsze</option>
                      <option value="price-asc">Cena: od najniższej</option>
                      <option value="price-desc">Cena: od najwyższej</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zakres cen (PLN)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Cena od (PLN)"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Cena do (PLN)"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Główna treść po prawej stronie */}
              <div className="lg:w-3/4 flex-1">
                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Ładowanie smartfonów...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-center py-12">
                    <div className="text-red-600 text-lg">{error}</div>
                  </div>
                )}

                {/* Smartphones Grid */}
                {!loading && !error && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSmartphones.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                          Nie znaleziono smartfonów
                        </p>
                        <p className="text-gray-500">
                          Spróbuj zmienić filtry wyszukiwania
                        </p>
                      </div>
                    ) : (
                      filteredSmartphones.map((phone) => (
                        <div
                          key={phone.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
                          onClick={() => navigate(`/smartfon/${phone.id}`)}
                        >
                          <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={phone.images[0]}
                              alt={phone.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://dummyimage.com/400x400/ccc/fff&text=Brak+zdjęcia";
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                              {phone.title}
                            </h3>

                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg text-purple-600">
                                {phone.price.toLocaleString()} zł
                              </span>
                              {phone.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {phone.originalPrice.toLocaleString()} zł
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                              <MapPin className="w-3 h-3" />
                              <span>{phone.location}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(phone.dateAdded).toLocaleDateString(
                                  "pl-PL"
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-gray-500 text-xs">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{phone.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                <span>{phone.likes}</span>
                              </div>
                            </div>

                            {/* Podstawowe specyfikacje w karcie */}
                            <div className="space-y-1 pt-2 border-t border-gray-100">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Pamięć:</span>
                                <span className="font-medium text-gray-900">
                                  {phone.specifications.storage}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">RAM:</span>
                                <span className="font-medium text-gray-900">
                                  {phone.specifications.ram}
                                </span>
                              </div>
                              {phone.specifications.color && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500">Kolor:</span>
                                  <span className="font-medium text-gray-900">
                                    {phone.specifications.color}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
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

export default SmartphoneCatalog;
