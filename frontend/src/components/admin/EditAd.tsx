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
  Edit3,
  Trash2,
  Search,
  Filter,
  Smartphone,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Heart,
  Tag,
  Image,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Settings,
  BarChart3,
} from "lucide-react";

type AdItem = {
  id: number;
  title: string;
  owner: "me" | "user";
  brand: string;
  model: string;
  price: number;
  location: string;
  date: string;
  status: "active" | "pending" | "rejected";
  views: number;
  likes: number;
  category: string;
  condition: string;
  images: number;
  ownerName: string;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data with more detailed information
  const [filter, setFilter] = useState<"me" | "user" | "all">("all");
  const [ads] = useState<AdItem[]>([
    {
      id: 1,
      title: "iPhone 15 Pro Max 256GB Titanium Blue",
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      price: 5299,
      location: "Warszawa, Śródmieście",
      date: "2024-09-05",
      status: "active",
      views: 1247,
      likes: 89,
      category: "Smartfony",
      condition: "Nowy",
      images: 8,
      owner: "user",
      ownerName: "Jan Kowalski",
    },
    {
      id: 2,
      title: "Samsung Galaxy S24 Ultra 512GB Black",
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      price: 4799,
      location: "Kraków, Nowa Huta",
      date: "2024-09-03",
      status: "pending",
      views: 892,
      likes: 67,
      category: "Smartfony",
      condition: "Bardzo dobry",
      images: 6,
      owner: "me",
      ownerName: "Administrator",
    },
    {
      id: 3,
      title: "Google Pixel 8 Pro 128GB Obsidian",
      brand: "Google",
      model: "Pixel 8 Pro",
      price: 3299,
      location: "Gdańsk, Wrzeszcz",
      date: "2024-09-01",
      status: "active",
      views: 634,
      likes: 45,
      category: "Smartfony",
      condition: "Dobry",
      images: 5,
      owner: "user",
      ownerName: "Anna Nowak",
    },
    {
      id: 4,
      title: "Xiaomi 14 Ultra 512GB Black",
      brand: "Xiaomi",
      model: "14 Ultra",
      price: 4199,
      location: "Wrocław, Krzyki",
      date: "2024-08-28",
      status: "rejected",
      views: 234,
      likes: 12,
      category: "Smartfony",
      condition: "Uszkodzony",
      images: 3,
      owner: "user",
      ownerName: "Piotr Wiśniewski",
    },
    {
      id: 5,
      title: "OnePlus 12 256GB Green",
      brand: "OnePlus",
      model: "12",
      price: 3599,
      location: "Poznań, Stare Miasto",
      date: "2024-09-07",
      status: "active",
      views: 567,
      likes: 34,
      category: "Smartfony",
      condition: "Bardzo dobry",
      images: 7,
      owner: "me",
      ownerName: "Administrator",
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Advanced filtering function
  const filteredAds = ads.filter((ad) => {
    const matchesOwner = filter === "all" || ad.owner === filter;
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesOwner && matchesStatus && matchesSearch;
  });

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Aktywne",
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Oczekuje",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Odrzucone",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-gray-600",
          bg: "bg-gray-100",
          text: "Nieznane",
        };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.role;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF";
  const isUser = userRole === "USER";

  const handleEdit = (id: number) => {
    alert(`Edytuj ogłoszenie ID: ${id}`);
  };
  const handleDelete = (id: number) => {
    const confirmed = confirm("Na pewno usunąć ogłoszenie?");
    if (confirmed) alert(`Usunięto ogłoszenie ID: ${id}`);
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
      <div className="panel-content-with-search flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12">
          <div
            className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-6xl mx-auto min-h-[500px] max-h-[80vh] flex flex-col gap-6 sm:gap-8 overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#a855f7 #f3f4f6",
            }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="w-8 h-8" />
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Panel Edycji Ogłoszeń
                </h2>
              </div>
              <p className="text-purple-100 text-sm sm:text-base">
                Zarządzaj ogłoszeniami użytkowników - edytuj, moderuj i
                kontroluj zawartość platformy
              </p>
            </div>

            {/* Advanced Search and Filter Section - Fixed at top */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex-shrink-0">
              <div className="flex flex-col xl:flex-row gap-4">
                {/* Search Bar - Full width on mobile, flex-1 on desktop */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Szukaj po tytule, marce, lokalizacji..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Owner Filter - Flex wrap for better mobile support */}
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "all"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Wszystkie
                    </div>
                  </button>
                  <button
                    onClick={() => setFilter("me")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "me"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Moje
                    </div>
                  </button>
                  <button
                    onClick={() => setFilter("user")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === "user"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Użytkowników
                    </div>
                  </button>
                </div>

                {/* Status Filter - Wrap for mobile, fixed width for desktop */}
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      statusFilter === "all"
                        ? "bg-gray-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Wszystkie
                  </button>
                  <button
                    onClick={() => setStatusFilter("active")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      statusFilter === "active"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Aktywne
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      statusFilter === "pending"
                        ? "bg-yellow-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Oczekujące
                  </button>
                </div>
              </div>

              {/* Results Counter */}
              <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>
                  Znaleziono {filteredAds.length} z {ads.length} ogłoszeń
                </span>
              </div>
            </div>

            {/* Modern Cards Layout - Scrollable Area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                {filteredAds.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <AlertTriangle className="w-16 h-16 text-gray-400" />
                      <p className="text-gray-500 text-lg">
                        Nie znaleziono ogłoszeń spełniających kryteria
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setFilter("all");
                          setStatusFilter("all");
                        }}
                        className="text-purple-600 hover:text-purple-800 underline"
                      >
                        Wyczyść filtry
                      </button>
                    </div>
                  </div>
                ) : (
                  filteredAds.map((ad) => {
                    const statusConfig = getStatusConfig(ad.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={ad.id}
                        className={`bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          selectedId === ad.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                        onClick={() => setSelectedId(ad.id)}
                      >
                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-5 h-5 text-purple-600" />
                              <span className="font-medium text-gray-900">
                                {ad.brand}
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.text}
                            </div>
                          </div>
                          <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                            {ad.title}
                          </h3>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600 font-bold">
                              <DollarSign className="w-4 h-4" />
                              {ad.price.toLocaleString()} zł
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                              <Image className="w-4 h-4" />
                              {ad.images} zdjęć
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin className="w-4 h-4" />
                            {ad.location}
                          </div>

                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(ad.date).toLocaleDateString("pl-PL")}
                          </div>

                          <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <User className="w-4 h-4" />
                            {ad.ownerName} {ad.owner === "me" && "(Admin)"}
                          </div>

                          {/* Statistics */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-blue-600 text-sm">
                              <Eye className="w-4 h-4" />
                              {ad.views}
                            </div>
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                              <Heart className="w-4 h-4" />
                              {ad.likes}
                            </div>
                            <div className="flex items-center gap-2 text-orange-600 text-sm">
                              <Tag className="w-4 h-4" />
                              {ad.condition}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 pt-0 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(ad.id);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edytuj
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(ad.id);
                            }}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xxs xs:text-xs sm:text-sm px-1 sm:px-2">
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
