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
  description: string;
  color: string;
  osType: "Android" | "iOS";
  osVersion: string;
  storage: string;
  ram: string;
  rearCameras: string;
  frontCamera: string;
  batteryCapacity: string;
  displaySize: string;
  displayTech: string;
  wifi: string;
  bluetooth: string;
  ipRating: string;
  fastCharging: string;
  wirelessCharging: string;
  imageUrls: string[];
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: 0,
    location: "",
    status: "active" as "active" | "pending" | "rejected",
    condition: "",
    category: "",
    description: "",
    brand: "",
    model: "",
    color: "",
    osType: "Android" as "Android" | "iOS",
    osVersion: "",
    storage: "",
    ram: "",
    rearCameras: "",
    frontCamera: "",
    batteryCapacity: "",
    displaySize: "",
    displayTech: "",
    wifi: "",
    bluetooth: "",
    ipRating: "",
    fastCharging: "",
    wirelessCharging: "",
    imageUrls: [] as string[],
  });

  // Mock data with more detailed information
  const [filter, setFilter] = useState<"me" | "user" | "all">("all");

  const createMockAd = (baseAd: Partial<AdItem>): AdItem =>
    ({
      description: "Szczegółowy opis urządzenia...",
      color: "Czarny",
      osType: "Android",
      osVersion: "14.0",
      storage: "128GB",
      ram: "8GB",
      rearCameras: "50MP",
      frontCamera: "12MP",
      batteryCapacity: "4000mAh",
      displaySize: '6.2"',
      displayTech: "AMOLED",
      wifi: "Wi-Fi 6",
      bluetooth: "5.0",
      ipRating: "IP68",
      fastCharging: "25W",
      wirelessCharging: "15W",
      imageUrls: ["/api/placeholder/400/300"],
      ...baseAd,
    } as AdItem);

  const [ads, setAds] = useState<AdItem[]>([
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
      description:
        "Sprzedam iPhone 15 Pro Max w doskonałym stanie. Telefon był używany z etui i folią ochronną od pierwszego dnia. Kompletny zestaw z ładowarką.",
      color: "Titanium Blue",
      osType: "iOS",
      osVersion: "17.6",
      storage: "256GB",
      ram: "8GB",
      rearCameras: "48MP + 12MP + 12MP",
      frontCamera: "12MP",
      batteryCapacity: "4441mAh",
      displaySize: '6.7"',
      displayTech: "Super Retina XDR OLED",
      wifi: "Wi-Fi 6E",
      bluetooth: "5.3",
      ipRating: "IP68",
      fastCharging: "27W",
      wirelessCharging: "15W MagSafe",
      imageUrls: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
    },
    createMockAd({
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
      description:
        "Samsung Galaxy S24 Ultra w bardzo dobrym stanie. Używany przez 6 miesięcy, zawsze z etui i folią.",
      color: "Czarny",
      storage: "512GB",
      ram: "12GB",
      rearCameras: "200MP + 50MP + 10MP + 12MP",
      batteryCapacity: "5000mAh",
      displaySize: '6.8"',
      displayTech: "Dynamic AMOLED 2X",
    }),
    createMockAd({
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
      description:
        "Google Pixel 8 Pro z najlepszymi zdjęciami w klasie. Używany rok, drobne ślady użytkowania.",
      color: "Obsidian",
      storage: "128GB",
      ram: "12GB",
    }),
    createMockAd({
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
      description:
        "Xiaomi 14 Ultra z pękniętym ekranem. Reszta działa bez problemów. Do naprawy lub na części.",
      color: "Czarny",
      storage: "512GB",
    }),
    createMockAd({
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
      description:
        "OnePlus 12 w zielonym kolorze. Bardzo szybki telefon z super szybkim ładowaniem.",
      color: "Zielony",
      storage: "256GB",
      fastCharging: "100W",
    }),
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

  // Check permissions for editing ads
  const canEditAd = (ad: AdItem) => {
    if (isAdmin) return true; // Admin can edit everything
    if (isStaff && ad.owner === "user") return true; // Staff can edit user ads
    if (ad.owner === "me") return true; // Can edit own ads
    return false;
  };

  const handleEdit = (id: number) => {
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    if (!canEditAd(ad)) {
      alert("Nie masz uprawnień do edycji tego ogłoszenia");
      return;
    }

    setEditingAd(ad);
    setEditForm({
      title: ad.title,
      price: ad.price,
      location: ad.location,
      status: ad.status,
      condition: ad.condition,
      category: ad.category,
      description: ad.description,
      brand: ad.brand,
      model: ad.model,
      color: ad.color,
      osType: ad.osType,
      osVersion: ad.osVersion,
      storage: ad.storage,
      ram: ad.ram,
      rearCameras: ad.rearCameras,
      frontCamera: ad.frontCamera,
      batteryCapacity: ad.batteryCapacity,
      displaySize: ad.displaySize,
      displayTech: ad.displayTech,
      wifi: ad.wifi,
      bluetooth: ad.bluetooth,
      ipRating: ad.ipRating,
      fastCharging: ad.fastCharging,
      wirelessCharging: ad.wirelessCharging,
      imageUrls: ad.imageUrls,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingAd) return;

    const updatedAds = ads.map((ad) =>
      ad.id === editingAd.id
        ? {
            ...ad,
            title: editForm.title,
            price: editForm.price,
            location: editForm.location,
            status: editForm.status,
            condition: editForm.condition,
            category: editForm.category,
            description: editForm.description,
            brand: editForm.brand,
            model: editForm.model,
            color: editForm.color,
            osType: editForm.osType,
            osVersion: editForm.osVersion,
            storage: editForm.storage,
            ram: editForm.ram,
            rearCameras: editForm.rearCameras,
            frontCamera: editForm.frontCamera,
            batteryCapacity: editForm.batteryCapacity,
            displaySize: editForm.displaySize,
            displayTech: editForm.displayTech,
            wifi: editForm.wifi,
            bluetooth: editForm.bluetooth,
            ipRating: editForm.ipRating,
            fastCharging: editForm.fastCharging,
            wirelessCharging: editForm.wirelessCharging,
            imageUrls: editForm.imageUrls,
          }
        : ad
    );

    setAds(updatedAds);
    setIsEditModalOpen(false);
    setEditingAd(null);
    alert("Ogłoszenie zostało zaktualizowane!");
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingAd(null);
  };

  const handleDelete = (id: number) => {
    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    if (!canEditAd(ad)) {
      alert("Nie masz uprawnień do usunięcia tego ogłoszenia");
      return;
    }

    const confirmed = confirm("Na pewno usunąć ogłoszenie?");
    if (confirmed) {
      const updatedAds = ads.filter((a) => a.id !== id);
      setAds(updatedAds);
      alert(`Usunięto ogłoszenie "${ad.title}"`);
    }
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
                        onClick={() => {
                          setSelectedId(ad.id);
                          navigate(`/smartfon/${ad.id}`);
                        }}
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
                        {canEditAd(ad) && (
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
                        )}

                        {/* No permissions message */}
                        {!canEditAd(ad) && (
                          <div className="p-4 pt-0">
                            <div className="text-center text-gray-500 text-sm py-2">
                              <Shield className="w-4 h-4 mx-auto mb-1" />
                              Brak uprawnień do edycji
                            </div>
                          </div>
                        )}
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

      {/* Edit Modal */}
      {isEditModalOpen && editingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Edit3 className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Edytuj Ogłoszenie</h2>
                </div>
                <button
                  onClick={handleCancelEdit}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-purple-100 mt-2 text-sm">
                ID: {editingAd.id} | Właściciel: {editingAd.ownerName}
              </p>
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Podstawowe informacje
                </h3>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tytuł ogłoszenia
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tytuł ogłoszenia..."
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Szczegółowy opis urządzenia..."
                  />
                </div>

                {/* Price and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena (PLN)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            price: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lokalizacja
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Miasto, dzielnica..."
                      />
                    </div>
                  </div>
                </div>

                {/* Status, Condition, and Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as
                            | "active"
                            | "pending"
                            | "rejected",
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">Aktywne</option>
                      <option value="pending">Oczekujące</option>
                      <option value="rejected">Odrzucone</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stan
                    </label>
                    <input
                      type="text"
                      value={editForm.condition}
                      onChange={(e) =>
                        setEditForm({ ...editForm, condition: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nowy, Bardzo dobry, Dobry..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoria
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Kategoria..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Device Information Section */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Informacje o urządzeniu
                </h3>

                {/* Brand, Model, Color */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marka
                    </label>
                    <input
                      type="text"
                      value={editForm.brand}
                      onChange={(e) =>
                        setEditForm({ ...editForm, brand: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Apple, Samsung, Huawei..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      value={editForm.model}
                      onChange={(e) =>
                        setEditForm({ ...editForm, model: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="iPhone 13, Galaxy S21..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kolor
                    </label>
                    <input
                      type="text"
                      value={editForm.color}
                      onChange={(e) =>
                        setEditForm({ ...editForm, color: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Biały, Czarny, Niebieski..."
                    />
                  </div>
                </div>

                {/* OS Type and Version */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System operacyjny
                    </label>
                    <input
                      type="text"
                      value={editForm.osType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          osType: e.target.value as "Android" | "iOS",
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="iOS, Android, HarmonyOS..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wersja systemu
                    </label>
                    <input
                      type="text"
                      value={editForm.osVersion}
                      onChange={(e) =>
                        setEditForm({ ...editForm, osVersion: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="15.0, Android 12..."
                    />
                  </div>
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Specyfikacja techniczna
                </h3>

                {/* Storage and RAM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pamięć wewnętrzna (GB)
                    </label>
                    <input
                      type="number"
                      value={editForm.storage}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          storage: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="64, 128, 256, 512..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pamięć RAM (GB)
                    </label>
                    <input
                      type="number"
                      value={editForm.ram}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          ram: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="4, 6, 8, 12..."
                    />
                  </div>
                </div>

                {/* Cameras */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aparaty tylne (MP)
                    </label>
                    <input
                      type="text"
                      value={editForm.rearCameras}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          rearCameras: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="48 + 12 + 12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aparat przedni (MP)
                    </label>
                    <input
                      type="text"
                      value={editForm.frontCamera}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          frontCamera: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="12"
                    />
                  </div>
                </div>

                {/* Battery and Display */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bateria (mAh)
                    </label>
                    <input
                      type="number"
                      value={editForm.batteryCapacity}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          batteryCapacity: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="3000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wielkość wyświetlacza
                    </label>
                    <input
                      type="text"
                      value={editForm.displaySize}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          displaySize: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder='6.1"'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologia wyświetlacza
                    </label>
                    <input
                      type="text"
                      value={editForm.displayTech}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          displayTech: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Super Retina XDR OLED"
                    />
                  </div>
                </div>

                {/* Connectivity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wi-Fi
                    </label>
                    <input
                      type="text"
                      value={editForm.wifi}
                      onChange={(e) =>
                        setEditForm({ ...editForm, wifi: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="802.11ax Wi-Fi 6"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bluetooth
                    </label>
                    <input
                      type="text"
                      value={editForm.bluetooth}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bluetooth: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="5.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odporność IP
                    </label>
                    <input
                      type="text"
                      value={editForm.ipRating}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ipRating: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="IP68"
                    />
                  </div>
                </div>
              </div>

              {/* Charging Section */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Ładowanie
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Szybkie ładowanie
                    </label>
                    <input
                      type="text"
                      value={editForm.fastCharging}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fastCharging: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="20W"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ładowanie bezprzewodowe
                    </label>
                    <input
                      type="text"
                      value={editForm.wirelessCharging}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          wirelessCharging: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="15W MagSafe"
                    />
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  Zdjęcia (URL-e rozdzielone przecinkami)
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL-e zdjęć
                  </label>
                  <textarea
                    value={editForm.imageUrls.join(", ")}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        imageUrls: e.target.value
                          .split(",")
                          .map((url) => url.trim())
                          .filter((url) => url.length > 0),
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex-1"
                >
                  <CheckCircle className="w-5 h-5" />
                  Zapisz zmiany
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex-1"
                >
                  <XCircle className="w-5 h-5" />
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditAd;
