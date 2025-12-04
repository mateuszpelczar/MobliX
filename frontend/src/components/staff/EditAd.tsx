import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import SearchBar from "../SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Edit3,
  Trash2,
  Search,
  Smartphone,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  X,
  Save,
  Upload,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Image as ImageIcon,
  Bell,
  Heart,
  Plus,
} from "lucide-react";
import { voivodeships } from "../../data/locations";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface Advertisement {
  id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: "ACTIVE" | "PENDING" | "REJECTED" | "SOLD";
  createdAt: string;
  updatedAt: string;
  warranty?: string;
  includesCharger: boolean;
  userName: string;
  categoryName: string;
  locationName?: string;
  region?: string;
  voivodeship?: string;
  city?: string;
  location: string;
  specification?: {
    brand?: string;
    model?: string;
    color?: string;
    osType?: string;
    osVersion?: string;
    storage?: string;
    ram?: string;
    rearCameras?: string;
    frontCamera?: string;
    batteryCapacity?: string;
    displaySize?: string;
    displayTech?: string;
    wifi?: string;
    bluetooth?: string;
    ipRating?: string;
    fastCharging?: string;
    wirelessCharging?: string;
    processor?: string;
    gpu?: string;
    screenResolution?: string;
    refreshRate?: string;
  };
  imageUrls: string[];
}

// Helper function to normalize image URLs
const normalizeImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    if (
      imageUrl.includes("/images/") &&
      !imageUrl.includes("/uploads/images/")
    ) {
      return imageUrl.replace("/images/", "/uploads/images/");
    }
    return imageUrl;
  }
  return `http://localhost:8080${imageUrl}`;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const adsPerPage = 4;

  // API State
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adToDelete, setAdToDelete] = useState<number | null>(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Unified edit form state (basic + location + images + specification + additional)
  const [editForm, setEditForm] = useState<any>({
    title: "",
    description: "",
    price: 0,
    condition: "",
    warranty: "",
    includesCharger: false,
    voivodeship: "",
    city: "",
    region: "",
    specification: {
      brand: "",
      model: "",
      color: "",
      osType: "",
      osVersion: "",
      storage: "",
      ram: "",
      rearCameras: "",
      frontCamera: "",
      batteryCapacity: "",
      // additional
      displaySize: "",
      displayTech: "",
      wifi: "",
      bluetooth: "",
      ipRating: "",
      fastCharging: "",
      wirelessCharging: "",
      processor: "",
      gpu: "",
      screenResolution: "",
      refreshRate: "",
    },
  });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdditionalSpecs, setShowAdditionalSpecs] = useState(false);

  // Authentication
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isStaff = false;
  let isUser = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  const fetchFavoriteCount = async () => {
    try {
      if (token) {
        const response = await axios.get<{ count: number }>(
          "http://localhost:8080/api/favorites/count",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteCount(response.data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  useEffect(() => {
    fetchFavoriteCount();
  }, []);

  // Fetch all advertisements on mount
  useEffect(() => {
    const fetchAdvertisements = async () => {
      if (!token) {
        setError("Brak tokenu autoryzacji");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<Advertisement[]>(
          "http://localhost:8080/api/advertisements/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const sortedAds = response.data.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        setAds(sortedAds);
        setLoading(false);
      } catch (err: any) {
        console.error("Błąd podczas pobierania ogłoszeń:", err);
        setError(
          err.response?.data?.message || "Nie udało się pobrać ogłoszeń"
        );
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [token]);

  // Filter ads (show ACTIVE by default for staff list)
  const filteredAds = ads.filter((ad) => {
    const matchesStatus = ad.status === "ACTIVE";
    const matchesSearch =
      searchTerm === "" ||
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.specification?.brand
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ad.specification?.model
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      ad.locationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.userName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAds.length / adsPerPage);
  const indexOfLastAd = currentPage * adsPerPage;
  const indexOfFirstAd = indexOfLastAd - adsPerPage;
  const currentAds = filteredAds.slice(indexOfFirstAd, indexOfLastAd);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: CheckCircle,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Aktywne",
        };
      case "PENDING":
        return {
          icon: Clock,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Oczekuje",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Odrzucone",
        };
      case "SOLD":
        return {
          icon: Eye,
          color: "text-gray-600",
          bg: "bg-gray-100",
          text: "Sprzedane",
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/main?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");

  const handleViewAd = (id: number) => {
    navigate(`/smartfon/${id}`);
  };

  // Open edit modal and populate full form (basic + detailed) from selected ad
  const handleEditAd = (id: number) => {
    const ad = ads.find((a) => a.id === id);
    if (ad) {
      setEditingAd(ad);
      setEditForm({
        title: ad.title ?? "",
        description: ad.description ?? "",
        price: ad.price ?? 0,
        condition: ad.condition ?? "",
        warranty: ad.warranty ?? "",
        includesCharger: !!ad.includesCharger,
        voivodeship: ad.voivodeship ?? ad.region ?? "",
        city: ad.city ?? ad.locationName ?? "",
        region: ad.region ?? ad.voivodeship ?? "",
        specification: {
          brand: ad.specification?.brand ?? "",
          model: ad.specification?.model ?? "",
          color: ad.specification?.color ?? "",
          osType: ad.specification?.osType ?? "",
          osVersion: ad.specification?.osVersion ?? "",
          storage: ad.specification?.storage ?? "",
          ram: ad.specification?.ram ?? "",
          rearCameras: ad.specification?.rearCameras ?? "",
          frontCamera: ad.specification?.frontCamera ?? "",
          batteryCapacity: ad.specification?.batteryCapacity ?? "",
          displaySize: ad.specification?.displaySize ?? "",
          displayTech: ad.specification?.displayTech ?? "",
          wifi: ad.specification?.wifi ?? "",
          bluetooth: ad.specification?.bluetooth ?? "",
          ipRating: ad.specification?.ipRating ?? "",
          fastCharging: ad.specification?.fastCharging ?? "",
          wirelessCharging: ad.specification?.wirelessCharging ?? "",
          processor: ad.specification?.processor ?? "",
          gpu: ad.specification?.gpu ?? "",
          screenResolution: ad.specification?.screenResolution ?? "",
          refreshRate: ad.specification?.refreshRate ?? "",
        },
      });
      setEditImages(ad.imageUrls || []);
      setShowEditModal(true);
      setShowAdditionalSpecs(
        !!(
          ad.specification?.displaySize ||
          ad.specification?.displayTech ||
          ad.specification?.wifi ||
          ad.specification?.bluetooth ||
          ad.specification?.ipRating ||
          ad.specification?.fastCharging ||
          ad.specification?.wirelessCharging ||
          ad.specification?.processor ||
          ad.specification?.gpu ||
          ad.specification?.screenResolution ||
          ad.specification?.refreshRate
        )
      );
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAd || !token) return;

    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        condition: editForm.condition,
        warranty: editForm.warranty,
        includesCharger: editForm.includesCharger,
        categoryId: 1,
        imageUrls: editImages,
        brand: editForm.specification.brand,
        model: editForm.specification.model,
        color: editForm.specification.color,
        osType: editForm.specification.osType,
        osVersion: editForm.specification.osVersion,
        storage: editForm.specification.storage,
        ram: editForm.specification.ram,
        rearCameras: editForm.specification.rearCameras,
        frontCamera: editForm.specification.frontCamera,
        batteryCapacity: editForm.specification.batteryCapacity,
        // additional
        displaySize: editForm.specification.displaySize,
        displayTech: editForm.specification.displayTech,
        wifi: editForm.specification.wifi,
        bluetooth: editForm.specification.bluetooth,
        ipRating: editForm.specification.ipRating,
        fastCharging: editForm.specification.fastCharging,
        wirelessCharging: editForm.specification.wirelessCharging,
        processor: editForm.specification.processor,
        gpu: editForm.specification.gpu,
        screenResolution: editForm.specification.screenResolution,
        refreshRate: editForm.specification.refreshRate,
        region: editForm.region,
        voivodeship: editForm.voivodeship,
        city: editForm.city,
      };

      await axios.put(
        `http://localhost:8080/api/advertisements/${editingAd.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh the advertisements list
      const response = await axios.get<Advertisement[]>(
        "http://localhost:8080/api/advertisements/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const sortedAds = response.data.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      setAds(sortedAds);

      setShowEditModal(false);
      setEditingAd(null);
      alert("Ogłoszenie zostało zaktualizowane!");
    } catch (err: any) {
      console.error("Błąd podczas edycji ogłoszenia:", err);
      alert(
        err.response?.data?.message || "Nie udało się zaktualizować ogłoszenia"
      );
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingAd(null);
  };

  // Image management functions
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const response = await axios.post<{ imageUrl: string }>(
          "http://localhost:8080/api/advertisements/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        uploadedUrls.push(response.data.imageUrl);
      }

      setEditImages([...editImages, ...uploadedUrls]);
    } catch (err: any) {
      console.error("Błąd podczas uploadowania zdjęć:", err);
      alert("Nie udało się przesłać zdjęć");
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleMoveImageUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...editImages];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];
    setEditImages(newImages);
  };

  const handleMoveImageDown = (index: number) => {
    if (index === editImages.length - 1) return;
    const newImages = [...editImages];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    setEditImages(newImages);
  };

  const addImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const isValidImageUrl =
      /\.(jpg|jpeg|png|gif|webp)$/i.test(newImageUrl) ||
      newImageUrl.includes("imgur.com") ||
      newImageUrl.includes("i.imgur.com");
    if (!isValidImageUrl) {
      alert("Podaj prawidłowy link do obrazu (jpg, png, gif, webp) lub Imgur");
      return;
    }
    if (editImages.length >= 6) {
      alert("Możesz dodać maksymalnie 6 zdjęć");
      return;
    }
    let processedUrl = newImageUrl;
    if (newImageUrl.includes("imgur.com/a/")) {
      alert(
        "Link do albumu Imgur nie jest obsługiwany. Użyj bezpośredniego linku do obrazu"
      );
      return;
    } else if (newImageUrl.match(/imgur\.com\/[a-zA-Z0-9]+$/)) {
      const imageId = newImageUrl.split("/").pop();
      processedUrl = `https://i.imgur.com/${imageId}.jpg`;
    }
    setEditImages((prev) => [...prev, processedUrl]);
    setNewImageUrl("");
  };

  const handleDeleteClick = (id: number) => {
    setAdToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!adToDelete || !token) return;

    try {
      await axios.delete(
        `http://localhost:8080/api/advertisements/${adToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAds(ads.filter((ad) => ad.id !== adToDelete));
      setShowDeleteModal(false);
      setAdToDelete(null);
      alert("Ogłoszenie zostało usunięte!");
    } catch (err: any) {
      console.error("Błąd podczas usuwania ogłoszenia:", err);
      alert(err.response?.data?.message || "Nie udało się usunąć ogłoszenia");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAdToDelete(null);
  };

  // Helper to render voivodeship -> cities dropdown
  const renderCityDropdown = () => (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Województwo *
      </label>
      <select
        value={editForm.voivodeship}
        onChange={(e) =>
          setEditForm({ ...editForm, voivodeship: e.target.value, city: "" })
        }
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
      >
        <option value="">Wybierz województwo</option>
        {voivodeships.map((v) => (
          <option key={v.name} value={v.name}>
            {v.name}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
        Miejscowość *
      </label>
      <select
        value={editForm.city}
        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
        disabled={!editForm.voivodeship}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
      >
        <option value="">Wybierz miejscowość</option>
        {editForm.voivodeship &&
          voivodeships
            .find((v) => v.name === editForm.voivodeship)
            ?.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
      </select>
    </>
  );

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        {/* NAV */}
        <nav className="bg-black text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div
              className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors"
              onClick={() => navigate("/main")}
            >
              MobliX
            </div>
            <SearchBar />
            <div className="flex items-center gap-3">
              <button
                onClick={handleMessengerClick}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Wiadomości"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
              <button
                onClick={handleNotificationsClick}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Powiadomienia"
              >
                <Bell className="w-6 h-6" />
              </button>
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
              <button
                onClick={() => navigate("/user/addadvertisement")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Dodaj ogłoszenie
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" /> Twoje konto{" "}
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
                          <User className="w-4 h-4 text-cyan-400" />
                          Panel użytkownika
                        </button>
                      )}
                      <div className="border-t border-purple-400 my-1"></div>
                      <button
                        onClick={handleLogout}
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

        {/* Content (ads list) */}
        <div className="flex-1 px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-4 rounded-full">
                  <Edit3 className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Edycja Ogłoszeń
                  </h1>
                  <p className="text-gray-300">
                    Zarządzaj i edytuj ogłoszenia użytkowników
                  </p>
                </div>
              </div>

              {/* Loading / error / list */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-300">Ładowanie ogłoszeń...</p>
                </div>
              )}
              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-200">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Błąd:</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {!loading && !error && (
                <>
                  <div className="mb-4 text-sm text-gray-300">
                    Znaleziono:{" "}
                    <span className="font-semibold text-white">
                      {filteredAds.length}
                    </span>{" "}
                    ogłoszeń (Strona {currentPage} z {totalPages})
                  </div>
                  <div className="space-y-4">
                    {currentAds.map((ad) => {
                      const statusConfig = getStatusConfig(ad.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div
                          key={ad.id}
                          className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border border-gray-700"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-32 h-32 flex-shrink-0">
                              {ad.imageUrls && ad.imageUrls.length > 0 ? (
                                <img
                                  src={normalizeImageUrl(ad.imageUrls[0])}
                                  alt={ad.title}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/128x128?text=Brak+zdjęcia";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                                  <Smartphone className="h-12 w-12 text-gray-500" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-white mb-1">
                                    {ad.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                                    <span className="font-semibold">
                                      {ad.specification?.brand || "N/A"}{" "}
                                      {ad.specification?.model || ""}
                                    </span>
                                    {ad.specification?.storage && (
                                      <>
                                        <span>•</span>
                                        <span>{ad.specification.storage}</span>
                                      </>
                                    )}
                                    {ad.specification?.color && (
                                      <>
                                        <span>•</span>
                                        <span>{ad.specification.color}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div
                                  className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bg}`}
                                >
                                  <StatusIcon
                                    className={`h-4 w-4 ${statusConfig.color}`}
                                  />
                                  <span
                                    className={`text-sm font-medium ${statusConfig.color}`}
                                  >
                                    {statusConfig.text}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-300 mb-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-400" />
                                  <span className="font-semibold text-white">
                                    {ad.price.toLocaleString()} zł
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-red-400" />
                                  <span>{ad.locationName || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-purple-400" />
                                  <span>{ad.userName || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-400" />
                                  <span>
                                    {new Date(
                                      ad.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleViewAd(ad.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  Wyświetl
                                </button>
                                <button
                                  onClick={() => handleEditAd(ad.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  Edytuj
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(ad.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Usuń
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {filteredAds.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-300 text-lg">
                          Nie znaleziono ogłoszeń
                        </p>
                      </div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === 1
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        Poprzednia
                      </button>
                      <div className="flex gap-2">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentPage === totalPages
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-purple-600 text-white hover:bg-purple-700"
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

        <footer className="bg-black text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <a
                href="/zasady-bezpieczenstwa"
                className="hover:text-purple-400"
              >
                Zasady bezpieczeństwa
              </a>
              <a href="/jak-dziala-moblix" className="hover:text-purple-400">
                Jak działa MobliX
              </a>
              <a href="/regulamin" className="hover:text-purple-400">
                Regulamin
              </a>
              <a href="/polityka-cookies" className="hover:text-purple-400">
                Polityka cookies
              </a>
            </div>
            <div className="text-center text-gray-400 text-sm mt-4">
              © 2024 MobliX. Wszystkie prawa zastrzeżone.
            </div>
          </div>
        </footer>
      </div>

      {/* Edit modal - full form with requested fields */}
      {showEditModal && editingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full my-8 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-white">
                Edytuj ogłoszenie #{editingAd.id}
              </h1>
              <button
                onClick={cancelEdit}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
              {/* Basic info */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Podstawowe informacje
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tytuł *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="np. iPhone 13 128GB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Opis *
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Szczegółowy opis ogłoszenia..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cena (zł) *
                    </label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          price: parseFloat(e.target.value || "0"),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stan *
                    </label>
                    <select
                      value={editForm.condition}
                      onChange={(e) =>
                        setEditForm({ ...editForm, condition: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Wybierz stan</option>
                      <option value="NEW">Nowy</option>
                      <option value="LIKE_NEW">Jak nowy</option>
                      <option value="VERY_GOOD">Bardzo dobry</option>
                      <option value="GOOD">Dobry</option>
                      <option value="ACCEPTABLE">Zadowalający</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>{renderCityDropdown()}</div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gwarancja
                    </label>
                    <input
                      type="text"
                      value={editForm.warranty}
                      onChange={(e) =>
                        setEditForm({ ...editForm, warranty: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                      placeholder="np. 12 miesięcy"
                    />
                    <label className="flex items-center gap-3 mt-4">
                      <input
                        type="checkbox"
                        checked={editForm.includesCharger}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            includesCharger: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded"
                      />
                      <span className="text-gray-300">
                        Ładowarka z kablem w zestawie
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Zdjęcia ogłoszenia
                </h4>

                {editImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {editImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative border-2 border-gray-200 rounded-lg p-2 hover:border-purple-600 transition-colors"
                      >
                        <img
                          src={normalizeImageUrl(imageUrl)}
                          alt={`Zdjęcie ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImageUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              title="Przesuń w górę"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImageDown(index)}
                              disabled={index === editImages.length - 1}
                              className={`p-1 rounded ${
                                index === editImages.length - 1
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                              title="Przesuń w dół"
                            >
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Usuń zdjęcie"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                            Główne
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Brak zdjęć</p>
                  </div>
                )}

                <div>
                  <label className="block w-full">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                    >
                      <Upload className="h-5 w-5" />
                      Dodaj nowe zdjęcia
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://i.imgur.com/abc123.jpg"
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                      Dodaj link
                    </button>
                  </div>
                </div>
              </div>

              {/* Specification */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  Specyfikacja smartfona
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marka *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.brand}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            brand: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.model}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            model: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kolor *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.color}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            color: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System operacyjny *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.osType}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            osType: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wersja systemu
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.osVersion}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            osVersion: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pamięć wewnętrzna *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.storage}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            storage: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pamięć RAM *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.ram}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            ram: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aparat główny *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.rearCameras}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            rearCameras: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aparat przedni *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.frontCamera}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            frontCamera: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pojemność baterii *
                    </label>
                    <input
                      type="text"
                      value={editForm.specification.batteryCapacity}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          specification: {
                            ...editForm.specification,
                            batteryCapacity: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Additional optional specs */}
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowAdditionalSpecs((prev) => !prev)}
                  className="w-full text-left px-4 py-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-purple-400" />
                      <span className="font-semibold">
                        Dodatkowe specyfikacje (opcjonalne)
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`h-5 w-5 ${
                        showAdditionalSpecs ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {showAdditionalSpecs && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-900 rounded-lg border border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={editForm.specification.displaySize}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              displaySize: e.target.value,
                            },
                          })
                        }
                        placeholder="Przekątna"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editForm.specification.displayTech}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              displayTech: e.target.value,
                            },
                          })
                        }
                        placeholder="Technologia"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={editForm.specification.wifi}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              wifi: e.target.value,
                            },
                          })
                        }
                        placeholder="Wi-Fi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editForm.specification.bluetooth}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              bluetooth: e.target.value,
                            },
                          })
                        }
                        placeholder="Bluetooth"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={editForm.specification.ipRating}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              ipRating: e.target.value,
                            },
                          })
                        }
                        placeholder="Odporność (IP)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editForm.specification.fastCharging}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              fastCharging: e.target.value,
                            },
                          })
                        }
                        placeholder="Ładowanie przewodowe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={editForm.specification.wirelessCharging}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              wirelessCharging: e.target.value,
                            },
                          })
                        }
                        placeholder="Ładowanie bezprzewodowe"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editForm.specification.processor}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              processor: e.target.value,
                            },
                          })
                        }
                        placeholder="Procesor"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        value={editForm.specification.gpu}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              gpu: e.target.value,
                            },
                          })
                        }
                        placeholder="Karta graficzna"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={editForm.specification.screenResolution}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              screenResolution: e.target.value,
                            },
                          })
                        }
                        placeholder="Rozdzielczość"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <input
                        value={editForm.specification.refreshRate}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            specification: {
                              ...editForm.specification,
                              refreshRate: e.target.value,
                            },
                          })
                        }
                        placeholder="Częstotliwość odświeżania (Hz)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Zapisz zmiany
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-900/50 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Potwierdź usunięcie
              </h3>
            </div>
            <p className="text-gray-300 mb-6">
              Czy na pewno chcesz usunąć to ogłoszenie? Ta operacja jest
              nieodwracalna.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Usuń ogłoszenie
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditAd;
