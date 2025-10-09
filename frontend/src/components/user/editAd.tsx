import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  Smartphone,
  Camera,
  Battery,
  Cpu,
  HardDrive,
  Shield,
  Upload,
  X,
  FileText,
  DollarSign,
  Palette,
  MessageSquare,
  Star,
  User,
  Users,
  LogOut,
  ChevronDown,
  LogIn,
  Save,
  ShoppingBag,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
} from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";

type OsType = "Android" | "iOS";

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
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    if (
      imageUrl.includes("/images/") &&
      !imageUrl.includes("/uploads/images/")
    ) {
      return imageUrl.replace("/images/", "/uploads/images/");
    }
    return imageUrl;
  }

  if (imageUrl.startsWith("/images/")) {
    return `http://localhost:8080/uploads${imageUrl}`;
  }

  if (imageUrl.startsWith("/uploads/images/")) {
    return `http://localhost:8080${imageUrl}`;
  }

  return `http://localhost:8080/uploads/images/${imageUrl}`;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Loading & error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form states - inicjalizowane danymi ogłoszenia
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [warranty, setWarranty] = useState<string>("");
  const [includesCharger, setIncludesCharger] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Obowiązkowe pola specyfikacji
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [osType, setOsType] = useState<string>("");
  const [osVersion, setOsVersion] = useState<string>("");
  const [storage, setStorage] = useState<string>("");
  const [ram, setRam] = useState<string>("");
  const [rearCameras, setRearCameras] = useState<string>("");
  const [frontCamera, setFrontCamera] = useState<string>("");
  const [batteryCapacity, setBatteryCapacity] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication logic
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isStaff = false;
  let isUser = false;
  let isAuthenticated = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";

      if (decoded.exp && Date.now() / 1000 < decoded.exp) {
        isAuthenticated = true;
      }
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  // Load ad data on component mount
  useEffect(() => {
    const fetchAdvertisement = async () => {
      if (!id || !token) {
        setError("Brak ID ogłoszenia lub tokenu autoryzacji");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<Advertisement>(
          `http://localhost:8080/api/advertisements/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const ad = response.data;

        // Populate form fields with ad data
        setTitle(ad.title);
        setPrice(ad.price.toString());
        setDescription(ad.description);
        setCondition(ad.condition);
        setWarranty(ad.warranty || "");
        setIncludesCharger(ad.includesCharger);
        setImages(ad.imageUrls || []);

        // Specification fields
        setBrand(ad.specification?.brand || "");
        setModel(ad.specification?.model || "");
        setColor(ad.specification?.color || "");
        setOsType(ad.specification?.osType || "");
        setOsVersion(ad.specification?.osVersion || "");
        setStorage(ad.specification?.storage || "");
        setRam(ad.specification?.ram || "");
        setRearCameras(ad.specification?.rearCameras || "");
        setFrontCamera(ad.specification?.frontCamera || "");
        setBatteryCapacity(ad.specification?.batteryCapacity || "");

        setLoading(false);
      } catch (err: any) {
        console.error("Błąd podczas pobierania ogłoszenia:", err);
        setError(
          err.response?.data?.message || "Nie udało się pobrać ogłoszenia"
        );
        setLoading(false);
      }
    };

    fetchAdvertisement();
  }, [id, token]);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && token) {
      const files = Array.from(event.target.files);

      // Check limit before upload
      if (images.length + files.length > 6) {
        alert(
          `Możesz dodać maksymalnie 6 zdjęć. Obecnie masz ${images.length} zdjęć.`
        );
        return;
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        try {
          const response = await axios.post<string>(
            "http://localhost:8080/api/advertisements/upload",
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );

          const imageUrl = response.data;
          setImages((prevImages) => [...prevImages, imageUrl]);
        } catch (error) {
          console.error("Błąd przesyłania zdjęcia:", error);
          alert("Nie udało się przesłać zdjęcia");
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      const newImages = [...images];
      [newImages[index - 1], newImages[index]] = [
        newImages[index],
        newImages[index - 1],
      ];
      setImages(newImages);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < images.length - 1) {
      const newImages = [...images];
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      setImages(newImages);
    }
  };

  const handleAddImageFromUrl = () => {
    if (!imageUrl.trim()) {
      alert("Proszę wpisać adres URL zdjęcia");
      return;
    }

    if (images.length >= 6) {
      alert("Możesz dodać maksymalnie 6 zdjęć");
      return;
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      alert("Nieprawidłowy adres URL");
      return;
    }

    setImages([...images, imageUrl]);
    setImageUrl("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validation
    if (!title.trim() || !price.trim() || !description.trim()) {
      alert("Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    if (!id || !token) {
      alert("Brak ID ogłoszenia lub tokenu autoryzacji");
      return;
    }

    try {
      const updateData = {
        title,
        description,
        price: parseFloat(price),
        condition,
        warranty: warranty || null,
        includesCharger,
        imageUrls: images,
        specification: {
          brand,
          model,
          color,
          osType,
          osVersion,
          storage,
          ram,
          rearCameras,
          frontCamera,
          batteryCapacity,
        },
      };

      await axios.put(
        `http://localhost:8080/api/advertisements/${id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Ogłoszenie zostało zaktualizowane!");
      navigate("/user/your-ads");
    } catch (err: any) {
      console.error("Błąd podczas aktualizacji ogłoszenia:", err);
      alert(
        err.response?.data?.message || "Nie udało się zaktualizować ogłoszenia"
      );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Dostęp zabroniony</h2>
          <p className="text-gray-600 mb-4">
            Musisz być zalogowany, aby edytować ogłoszenie.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Powrót do strony głównej
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie ogłoszenia...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Błąd</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/user/your-ads")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Powrót do ogłoszeń
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        {/* Logo in top left */}
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
          style={{ userSelect: "none" }}
        >
          MobliX
        </div>

        {/* Account dropdown in top right corner */}
        <div className="panel-buttons">
          {isAuthenticated ? (
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
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/adminpanel");
                        }}
                        className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
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
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-logout flex items-center gap-3 px-4 py-2"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Wyloguj się
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/")}
              className="auth-button login-button text-sm sm:text-base"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              Zaloguj się
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="panel-content-with-search flex-grow w-full overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 lg:p-6 max-w-4xl mx-auto max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
                Edytuj ogłoszenie
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Podstawowe informacje
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tytuł ogłoszenia *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="np. iPhone 13 128GB w doskonałym stanie"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="2500"
                        min="1"
                        required
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        PLN
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Opisz szczegółowo stan telefonu, dołączone akcesoria, powód sprzedaży..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Device Specifications */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Specyfikacja urządzenia
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marka *
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Apple, Samsung, Xiaomi..."
                      required
                    />
                  </div>

                  {/* Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="iPhone 13, Galaxy S22..."
                      required
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kolor *
                    </label>
                    <div className="relative">
                      <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Midnight, White, Blue..."
                        required
                      />
                    </div>
                  </div>

                  {/* OS Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System operacyjny *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Android"
                          checked={osType === "Android"}
                          onChange={(e) => setOsType(e.target.value as OsType)}
                          className="mr-2"
                        />
                        <FaAndroid className="w-5 h-5 text-green-500 mr-1" />
                        Android
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="iOS"
                          checked={osType === "iOS"}
                          onChange={(e) => setOsType(e.target.value as OsType)}
                          className="mr-2"
                        />
                        <FaApple className="w-5 h-5 text-gray-600 mr-1" />
                        iOS
                      </label>
                    </div>
                  </div>

                  {/* OS Version */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wersja systemu *
                    </label>
                    <input
                      type="text"
                      value={osVersion}
                      onChange={(e) => setOsVersion(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="14.0, 17.0..."
                      required
                    />
                  </div>

                  {/* Storage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pamięć wewnętrzna *
                    </label>
                    <div className="relative">
                      <HardDrive className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="128GB, 256GB, 1TB..."
                        required
                      />
                    </div>
                  </div>

                  {/* RAM */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RAM *
                    </label>
                    <div className="relative">
                      <Cpu className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="4GB, 6GB, 8GB..."
                        required
                      />
                    </div>
                  </div>

                  {/* Rear Cameras */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aparat tylny * (Mpx)
                    </label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={rearCameras}
                        onChange={(e) => setRearCameras(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="48MP, 12MP + 12MP..."
                        required
                      />
                    </div>
                  </div>

                  {/* Front Camera */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aparat przedni * (Mpx)
                    </label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={frontCamera}
                        onChange={(e) => setFrontCamera(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="12MP, 32MP..."
                        required
                      />
                    </div>
                  </div>

                  {/* Battery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bateria * (mAh)
                    </label>
                    <div className="relative">
                      <Battery className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={batteryCapacity}
                        onChange={(e) => setBatteryCapacity(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="3240mAh, 4500mAh..."
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Dodatkowe informacje
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stan *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Wybierz stan</option>
                      <option value="NEW">Nowy</option>
                      <option value="LIKE_NEW">Jak nowy</option>
                      <option value="VERY_GOOD">Bardzo dobry</option>
                      <option value="GOOD">Dobry</option>
                      <option value="ACCEPTABLE">Zadowalający</option>
                    </select>
                  </div>

                  {/* Warranty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gwarancja
                    </label>
                    <input
                      type="text"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="np. 12 miesięcy"
                    />
                  </div>

                  {/* Includes Charger */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includesCharger}
                        onChange={(e) => setIncludesCharger(e.target.checked)}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        W zestawie ładowarka z kablem
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Zdjęcia
                </h2>

                <div className="space-y-4">
                  {/* Existing images grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      {images.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={normalizeImageUrl(imageUrl)}
                            alt={`Zdjęcie ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => {
                              console.error(
                                `Błąd ładowania zdjęcia ${index}:`,
                                imageUrl
                              );
                              e.currentTarget.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EBrak%3C/text%3E%3C/svg%3E";
                            }}
                          />

                          {/* Move up button */}
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImageUp(index)}
                              className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                              title="Przenieś w górę"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          )}

                          {/* Move down button */}
                          {index < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImageDown(index)}
                              className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
                              title="Przenieś w dół"
                            >
                              <ChevronDownIcon className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Usuń zdjęcie"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors w-full justify-center"
                      disabled={images.length >= 6}
                    >
                      <Upload className="w-5 h-5" />
                      Dodaj zdjęcia z komputera
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      {images.length >= 6
                        ? "Osiągnięto limit 6 zdjęć"
                        : `Możesz dodać jeszcze ${
                            6 - images.length
                          } zdjęć. Pierwsze zdjęcie będzie zdjęciem głównym.`}
                    </p>
                  </div>

                  {/* URL input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lub wklej adres URL zdjęcia
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageFromUrl();
                          }
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                        disabled={images.length >= 6}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageFromUrl}
                        disabled={images.length >= 6 || !imageUrl.trim()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Dodaj
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Wklej bezpośredni link do zdjęcia (max. 6 zdjęć łącznie)
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg flex-1 sm:flex-initial"
                >
                  <Save className="w-5 h-5" />
                  Zapisz zmiany
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/user/your-ads")}
                  className="flex items-center justify-center gap-2 bg-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium text-lg flex-1 sm:flex-initial"
                >
                  <X className="w-5 h-5" />
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
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
