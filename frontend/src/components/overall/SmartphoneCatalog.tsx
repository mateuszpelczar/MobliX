import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  User,
  ChevronDown,
  LogOut,
  ShoppingBag,
  MessageSquare,
  Shield,
  Users,
  Search,
  MapPin,
  Calendar,
  Smartphone,
  Heart,
  Eye,
  LogIn,
  Bell,
  Plus,
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
  condition: string;
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
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

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
            condition: ad.condition || "NEW",
            images:
              ad.imageUrls && ad.imageUrls.length > 0
                ? ad.imageUrls
                : ["https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia"],
            seller: ad.userName || "Użytkownik",
            dateAdded: ad.createdAt || ad.dateAdded,
            views: ad.viewCount ?? 0,
            likes: 0,
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

  // Fetch favorite count
  useEffect(() => {
    fetchFavoriteCount();
    fetchUserFavorites();
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

  const fetchUserFavorites = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get<any[]>(
        "http://localhost:8080/api/favorites",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data) {
        const ids = response.data
          .map((ad) => ad.id)
          .filter((id) => typeof id === "number");
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Error fetching user favorites:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, adId: number) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (favoriteIds.includes(adId)) {
        await axios.delete(`http://localhost:8080/api/favorites/${adId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteIds((prev) => prev.filter((id) => id !== adId));
        setFavoriteCount((c) => Math.max(0, c - 1));
      } else {
        await axios.post(
          `http://localhost:8080/api/favorites/${adId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavoriteIds((prev) => [...prev, adId]);
        setFavoriteCount((c) => c + 1);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

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
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const itemsPerPage = 8;

  // Generate or retrieve session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("searchSessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      sessionStorage.setItem("searchSessionId", sessionId);
    }
    return sessionId;
  };

  // Log search to backend
  const logSearch = async (resultsCount: number, searchSource: string) => {
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

      await axios.post("http://localhost:8080/api/search-logs", {
        searchQuery: searchTerm || null,
        brand: selectedBrand !== "all" ? selectedBrand : null,
        model: null, // Model nie jest dostępny w filtrach
        minPrice: priceRange.min ? parseFloat(priceRange.min) : null,
        maxPrice: priceRange.max ? parseFloat(priceRange.max) : null,
        userId: userId,
        sessionId: getSessionId(),
        resultsCount: resultsCount,
        searchSource: searchSource,
      });
    } catch (error) {
      console.error("Error logging search:", error);
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
    if (currentPage !== 1) params.set("page", currentPage.toString());

    setSearchParams(params);
  }, [
    searchTerm,
    selectedBrand,
    selectedCondition,
    selectedLocation,
    priceRange,
    sortBy,
    currentPage,
    setSearchParams,
  ]);

  // Log search when filters change (debounced)
  useEffect(() => {
    // Only log if there's actual search activity
    if (
      searchTerm ||
      selectedBrand !== "all" ||
      priceRange.min ||
      priceRange.max
    ) {
      const timer = setTimeout(() => {
        // Calculate filtered results count
        const resultsCount = smartphones.filter((phone) => {
          const matchesSearch =
            phone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.model.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesBrand =
            selectedBrand === "all" || phone.brand === selectedBrand;
          const matchesCondition =
            selectedCondition === "all" ||
            phone.condition === selectedCondition;
          const matchesLocation =
            selectedLocation === "all" ||
            phone.location
              .toLowerCase()
              .includes(selectedLocation.toLowerCase());
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
        }).length;

        // Determine search source
        let searchSource = "catalog_search";
        if (searchTerm) {
          searchSource = "catalog_search";
        } else if (selectedBrand !== "all") {
          searchSource = "catalog_filter";
        }

        logSearch(resultsCount, searchSource);
      }, 1500); // Debounce 1.5s

      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedBrand, priceRange, smartphones]);

  const token = localStorage.getItem("token");
  let userRole = "";
  let isAdmin = false;
  let isStaff = false;
  let isUser = false;

  if (token) {
    try {
      const decodedToken = jwtDecode<JwtPayLoad>(token);
      userRole = decodedToken.role;
      isAdmin = userRole === "ADMIN";
      isStaff = userRole === "STAFF" || isAdmin;
      isUser = userRole === "USER" || isUser;
    } catch (error) {
      localStorage.removeItem("token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  // Filter smartphones based on search criteria
  const filteredSmartphones = smartphones
    .filter((phone) => {
      const matchesSearch =
        phone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.model.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredSmartphones.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSmartphones = filteredSmartphones.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedBrand,
    selectedCondition,
    selectedLocation,
    priceRange,
    sortBy,
  ]);

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
              e.preventDefault(); /* Logika wyszukiwania już obsługiwana przez filtry */
            }}
            className="flex-1 max-w-2xl"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj smartfonów..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

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

            {/* Ikona ulubionych */}
            <button
              onClick={() => navigate("/user/watchedads")}
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
              <span className="hidden lg:inline">Dodaj ogłoszenie</span>
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

      {/* Main Content - Ciemny gradient tło */}
      <div className="flex-grow w-full">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Tytuł strony */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Katalog smartfonów
            </h1>
            <p className="text-base text-gray-300">
              Znajdź swój idealny smartfon spośród setek ogłoszeń
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filtry po lewej stronie - ciemny sidebar */}
            <div className="lg:w-1/4 lg:min-w-[280px] lg:self-start lg:sticky lg:top-4">
              <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 min-h-[800px]">
                {/* Tytuł sekcji filtrów */}
                <h2 className="text-lg font-bold text-white mb-6 pb-2 border-b border-gray-700">
                  Filtry
                </h2>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Szukaj smartfonów..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Filters */}
                <div className="space-y-6">
                  {/* Brand Filter */}
                  <div className="mt-8">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Marka
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stan
                    </label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">Wszystkie stany</option>
                      <option value="NEW">Nowy</option>
                      <option value="LIKE_NEW">Jak nowy</option>
                      <option value="VERY_GOOD">Bardzo dobry</option>
                      <option value="GOOD">Dobry</option>
                      <option value="ACCEPTABLE">Zadowalający</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lokalizacja
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sortowanie
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="newest">Najnowsze</option>
                      <option value="oldest">Najstarsze</option>
                      <option value="price-asc">Cena: od najniższej</option>
                      <option value="price-desc">Cena: od najwyższej</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
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
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="Cena do (PLN)"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Główna treść po prawej stronie - ciemne karty */}
            <div className="lg:w-3/4 flex-1">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-gray-300">Ładowanie smartfonów...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12">
                  <div className="text-red-400 text-lg">{error}</div>
                </div>
              )}

              {/* Smartphones Grid - Ciemne karty */}
              {!loading && !error && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredSmartphones.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg">
                          Nie znaleziono smartfonów
                        </p>
                        <p className="text-gray-500">
                          Spróbuj zmienić filtry wyszukiwania
                        </p>
                      </div>
                    ) : (
                      paginatedSmartphones.map((phone) => (
                        <div
                          key={phone.id}
                          className="bg-gray-800 border-2 border-purple-500 rounded-2xl p-3 hover:shadow-xl hover:shadow-purple-500/50 hover:border-purple-400 transition-all cursor-pointer"
                          onClick={() => navigate(`/smartfon/${phone.id}`)}
                        >
                          <div className="aspect-square mb-2 overflow-hidden rounded-xl bg-gray-900">
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
                            <h3 className="font-medium text-white text-sm line-clamp-2">
                              {phone.title}
                            </h3>

                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg text-purple-400">
                                {phone.price.toLocaleString()} zł
                              </span>
                              {phone.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  {phone.originalPrice.toLocaleString()} zł
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-white-400 text-xs">
                              <MapPin className="w-3 h-3" />
                              <span>{phone.location}</span>
                            </div>

                            <div className="flex items-center gap-2 text-white-500 text-xs">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(phone.dateAdded).toLocaleDateString(
                                  "pl-PL"
                                )}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-white-500 text-xs">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{phone.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => toggleFavorite(e, phone.id)}
                                  className="p-0"
                                  title={
                                    favoriteIds.includes(phone.id)
                                      ? "Usuń z ulubionych"
                                      : "Dodaj do ulubionych"
                                  }
                                >
                                  <Heart
                                    className={`w-3 h-3 ${
                                      favoriteIds.includes(phone.id)
                                        ? "text-red-500"
                                        : "text-gray-400"
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            {/* Podstawowe specyfikacje w karcie */}
                            <div className="space-y-1 pt-2 border-t border-gray-700">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Pamięć:</span>
                                <span className="font-medium text-gray-200">
                                  {phone.specifications.storage}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">RAM:</span>
                                <span className="font-medium text-gray-200">
                                  {phone.specifications.ram}
                                </span>
                              </div>
                              {phone.specifications.color && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-400">Kolor:</span>
                                  <span className="font-medium text-gray-200">
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

                  {/* Pagination */}
                  {filteredSmartphones.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === 1
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-800 text-white hover:bg-purple-600 border border-purple-500"
                        }`}
                      >
                        Poprzednia
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-purple-600 text-white border-2 border-purple-400"
                                : "bg-gray-800 text-white hover:bg-purple-600 border border-purple-500"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === totalPages
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gray-800 text-white hover:bg-purple-600 border border-purple-500"
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
        </div>
      </div>

      {/* Czarna stopka jak w MainPanel */}
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
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2024 MobliX. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SmartphoneCatalog;
