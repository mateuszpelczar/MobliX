import React, { useState, useEffect, useRef } from "react";
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
  Settings,
  X,
  Save,
  Upload,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Image as ImageIcon,
} from "lucide-react";

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
  status: "ACTIVE" | "PENDING" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  warranty?: string;
  includesCharger: boolean;
  userName: string;
  categoryName: string;
  locationName: string;
  location: string;
  voivodeship: string;
  specification: {
    brand: string;
    model: string;
    color: string;
    osType: string;
    osVersion: string;
    storage: string;
    ram: string;
    rearCameras: string;
    frontCamera: string;
    batteryCapacity: string;
  };
  imageUrls: string[];
}

// Helper function to normalize image URLs
const normalizeImageUrl = (imageUrl: string): string => {
  // If already a full URL, return as is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    // Fix old URLs with wrong path
    if (
      imageUrl.includes("/images/") &&
      !imageUrl.includes("/uploads/images/")
    ) {
      // Convert http://localhost:8080/images/xyz.png -> http://localhost:8080/uploads/images/xyz.png
      return imageUrl.replace("/images/", "/uploads/images/");
    }
    return imageUrl;
  }

  // If relative path, prepend base URL
  return `http://localhost:8080${imageUrl}`;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    condition: "",
    warranty: "",
    includesCharger: false,
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
    },
  });
  const [editImages, setEditImages] = useState<string[]>([]);

  // Authentication
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  // Fetch all advertisements on mount
  useEffect(() => {
    const fetchAdvertisements = async () => {
      if (!token) {
        console.error("Brak tokenu autoryzacji");
        setError("Brak tokenu autoryzacji");
        setLoading(false);
        return;
      }

      console.log("Pobieranie ogłoszeń...");
      console.log("Token:", token ? "Istnieje" : "Brak");
      console.log("isAdmin:", isAdmin);
      console.log("isStaff:", isStaff);

      try {
        const response = await axios.get<Advertisement[]>(
          "http://localhost:8080/api/advertisements/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Pobrano ogłoszenia:", response.data.length);
        console.log("Szczegóły ogłoszeń (imageUrls):");
        response.data.forEach((ad, index) => {
          console.log(`[${index}] ID: ${ad.id}, Title: ${ad.title}`);
          console.log(`    imageUrls:`, ad.imageUrls);
          console.log(`    imageUrls length:`, ad.imageUrls?.length || 0);
          if (ad.imageUrls && ad.imageUrls.length > 0) {
            console.log(`    First image:`, ad.imageUrls[0]);
          }
        });

        // Sort by updatedAt descending (recently updated first)
        const sortedAds = response.data.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt).getTime();
          return dateB - dateA;
        });
        setAds(sortedAds);
        setLoading(false);
      } catch (err: any) {
        console.error("Błąd podczas pobierania ogłoszeń:", err);
        console.error("Status:", err.response?.status);
        console.error("Data:", err.response?.data);
        setError(
          err.response?.data?.message || "Nie udało się pobrać ogłoszeń"
        );
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, [token, isAdmin, isStaff]);

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
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

  // Get status config
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

  const handleViewAd = (id: number) => {
    navigate(`/smartfon/${id}`);
  };

  const handleEditAd = (id: number) => {
    const ad = ads.find((a) => a.id === id);
    if (ad) {
      setEditingAd(ad);
      setEditForm({
        title: ad.title,
        description: ad.description,
        price: ad.price,
        condition: ad.condition,
        warranty: ad.warranty || "",
        includesCharger: ad.includesCharger,
        specification: {
          brand: ad.specification?.brand || "",
          model: ad.specification?.model || "",
          color: ad.specification?.color || "",
          osType: ad.specification?.osType || "",
          osVersion: ad.specification?.osVersion || "",
          storage: ad.specification?.storage || "",
          ram: ad.specification?.ram || "",
          rearCameras: ad.specification?.rearCameras || "",
          frontCamera: ad.specification?.frontCamera || "",
          batteryCapacity: ad.specification?.batteryCapacity || "",
        },
      });
      setEditImages(ad.imageUrls || []);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAd || !token) return;

    try {
      const updateData = {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        condition: editForm.condition,
        warranty: editForm.warranty,
        includesCharger: editForm.includesCharger,
        categoryId: 1, // Default smartphone category
        imageUrls: editImages, // Send updated images
        // Flatten specification fields
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
      };

      await axios.put(
        `http://localhost:8080/api/advertisements/${editingAd.id}`,
        updateData,
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

      // Sort by updatedAt descending (recently updated first)
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

      // Remove from list
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

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header - biały pasek jak w AdminPanel */}
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
              <div className="dropdown-menu">
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
                  {(isAdmin || isStaff) && (
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

      {/* Main content with modern design - jak w AdminPanel */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-[220px] pb-16 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="mb-8 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Settings className="h-8 w-8 text-purple-600" />
                Edycja ogłoszeń
              </h1>
              <p className="text-gray-600">
                Zarządzaj wszystkimi ogłoszeniami w systemie
              </p>
            </div>

            {/* Content wrapper z scrollem */}
            <div className="p-6 md:p-8 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj ogłoszeń..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Wszystkie statusy</option>
                  <option value="ACTIVE">Aktywne</option>
                  <option value="PENDING">Oczekujące</option>
                  <option value="REJECTED">Odrzucone</option>
                </select>
              </div>

              {/* Loading state */}
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Ładowanie ogłoszeń...</p>
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Błąd:</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Ads list */}
              {!loading && !error && (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Znaleziono:{" "}
                    <span className="font-semibold">{filteredAds.length}</span>{" "}
                    ogłoszeń
                  </div>

                  <div className="space-y-4">
                    {filteredAds.map((ad) => {
                      const statusConfig = getStatusConfig(ad.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={ad.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Image */}
                            <div className="w-full md:w-32 h-32 flex-shrink-0">
                              {ad.imageUrls && ad.imageUrls.length > 0 ? (
                                <img
                                  src={normalizeImageUrl(ad.imageUrls[0])}
                                  alt={ad.title}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    console.error(
                                      `Błąd ładowania obrazu dla ogłoszenia #${ad.id}:`,
                                      {
                                        title: ad.title,
                                        imageUrl: ad.imageUrls[0],
                                        normalizedUrl: normalizeImageUrl(
                                          ad.imageUrls[0]
                                        ),
                                      }
                                    );
                                    (e.target as HTMLImageElement).src =
                                      "https://via.placeholder.com/128x128?text=Brak+zdjęcia";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Smartphone className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {ad.title}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-gray-900">
                                    {ad.price.toLocaleString()} zł
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-red-600" />
                                  <span>{ad.locationName || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-purple-600" />
                                  <span>{ad.userName || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                  <span>
                                    {new Date(
                                      ad.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleViewAd(ad.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>Wyświetl</span>
                                </button>
                                <button
                                  onClick={() => handleEditAd(ad.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  <span>Edytuj</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(ad.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Usuń</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredAds.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                          Nie znaleziono ogłoszeń
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom - jak w AdminPanel */}
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

      {/* Edit modal */}
      {showEditModal && editingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Edytuj ogłoszenie #{editingAd.id}
              </h3>
              <button
                onClick={cancelEdit}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              {/* Podstawowe informacje */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Podstawowe informacje
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tytuł *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="np. iPhone 13 128GB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis *
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                          price: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="2500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="Nowy">Nowy</option>
                      <option value="Używany - bardzo dobry">
                        Używany - bardzo dobry
                      </option>
                      <option value="Używany - dobry">Używany - dobry</option>
                      <option value="Używany - zadowalający">
                        Używany - zadowalający
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="np. 12 miesięcy"
                    />
                  </div>

                  <div className="flex items-center h-full pt-7">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.includesCharger}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            includesCharger: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Dołączona ładowarka
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Zdjęcia */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Zdjęcia ogłoszenia
                </h4>

                {/* Existing images */}
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

                {/* Upload new images */}
                <div>
                  <label className="block w-full">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                      <Upload className="h-5 w-5" />
                      <span>Dodaj nowe zdjęcia</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Pierwsze zdjęcie będzie wyświetlane jako główne. Możesz
                    zmienić kolejność używając strzałek.
                  </p>
                </div>
              </div>

              {/* Specyfikacja techniczna */}
              <div className="space-y-4 border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  Specyfikacja techniczna
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Apple"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="iPhone 13"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Midnight"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="iOS / Android"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wersja systemu *
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="17.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="128GB"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="6GB"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aparat tylny *
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="12MP + 12MP"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="12MP"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bateria *
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="3240mAh"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
              <button
                onClick={cancelEdit}
                className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
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
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Potwierdź usunięcie
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz usunąć to ogłoszenie? Ta operacja jest
              nieodwracalna.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
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
    </div>
  );
};

export default EditAd;
