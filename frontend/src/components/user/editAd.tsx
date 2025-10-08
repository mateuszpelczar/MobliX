import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Smartphone,
  Camera,
  Battery,
  Cpu,
  HardDrive,
  Monitor,
  Wifi,
  Bluetooth,
  Shield,
  Zap,
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
} from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";

type OsType = "Android" | "iOS";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

// Mock data dla ogłoszenia - w prawdziwej aplikacji pobieralibyśmy z API
const mockAdData = {
  1: {
    id: 1,
    title: "iPhone 13 128GB",
    price: "2500",
    description:
      "Sprzedam iPhone 13 w bardzo dobrym stanie. Telefon był używany z etui i folią ochronną.",
    brand: "Apple",
    model: "iPhone 13",
    color: "Midnight",
    osType: "iOS" as OsType,
    osVersion: "17.0",
    storage: "128GB",
    ram: "6GB",
    rearCameras: "12MP + 12MP",
    frontCamera: "12MP",
    batteryCapacity: "3240mAh",
    displaySize: '6.1"',
    displayTech: "Super Retina XDR",
    wifi: "Wi-Fi 6",
    bluetooth: "5.0",
    ipRating: "IP68",
    fastCharging: "20W",
    wirelessCharging: "15W MagSafe",
    images: ["/api/placeholder/400/300"],
  },
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form states - inicjalizowane danymi ogłoszenia
  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Obowiązkowe pola specyfikacji
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [osType, setOsType] = useState<OsType>("Android");
  const [osVersion, setOsVersion] = useState<string>("");
  const [storage, setStorage] = useState<string>("");
  const [ram, setRam] = useState<string>("");
  const [rearCameras, setRearCameras] = useState<string>("");
  const [frontCamera, setFrontCamera] = useState<string>("");
  const [batteryCapacity, setBatteryCapacity] = useState<string>("");

  // Opcjonalne pola specyfikacji
  const [displaySize, setDisplaySize] = useState<string>("");
  const [displayTech, setDisplayTech] = useState<string>("");
  const [wifi, setWifi] = useState<string>("");
  const [bluetooth, setBluetooth] = useState<string>("");
  const [ipRating, setIpRating] = useState<string>("");
  const [fastCharging, setFastCharging] = useState<string>("");
  const [wirelessCharging, setWirelessCharging] = useState<string>("");

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
    if (id) {
      const adId = parseInt(id);
      const adData = mockAdData[adId as keyof typeof mockAdData];

      if (adData) {
        setTitle(adData.title);
        setPrice(adData.price);
        setDescription(adData.description);
        setBrand(adData.brand);
        setModel(adData.model);
        setColor(adData.color);
        setOsType(adData.osType);
        setOsVersion(adData.osVersion);
        setStorage(adData.storage);
        setRam(adData.ram);
        setRearCameras(adData.rearCameras);
        setFrontCamera(adData.frontCamera);
        setBatteryCapacity(adData.batteryCapacity);
        setDisplaySize(adData.displaySize);
        setDisplayTech(adData.displayTech);
        setWifi(adData.wifi);
        setBluetooth(adData.bluetooth);
        setIpRating(adData.ipRating);
        setFastCharging(adData.fastCharging);
        setWirelessCharging(adData.wirelessCharging);
      }
    }
  }, [id]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validation
    if (!title.trim() || !price.trim() || !description.trim()) {
      alert("Proszę wypełnić wszystkie wymagane pola");
      return;
    }

    // W prawdziwej aplikacji wysłalibyśmy dane do API
    console.log("Aktualizowanie ogłoszenia:", {
      id,
      title,
      price,
      description,
      brand,
      model,
      color,
      osType,
      osVersion,
      storage,
      ram,
      // ... pozostałe pola
    });

    alert("Ogłoszenie zostało zaktualizowane!");
    navigate("/user/your-ads");
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
                      Aparat tylny *
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
                      Aparat przedni *
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
                      Bateria *
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

              {/* Additional Specifications */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Dodatkowe specyfikacje (opcjonalne)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Display Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rozmiar ekranu
                    </label>
                    <div className="relative">
                      <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={displaySize}
                        onChange={(e) => setDisplaySize(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder='6.1", 6.7"...'
                      />
                    </div>
                  </div>

                  {/* Display Tech */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologia ekranu
                    </label>
                    <input
                      type="text"
                      value={displayTech}
                      onChange={(e) => setDisplayTech(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="OLED, AMOLED, Super Retina..."
                    />
                  </div>

                  {/* Wi-Fi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wi-Fi
                    </label>
                    <div className="relative">
                      <Wifi className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={wifi}
                        onChange={(e) => setWifi(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Wi-Fi 6, Wi-Fi 6E..."
                      />
                    </div>
                  </div>

                  {/* Bluetooth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bluetooth
                    </label>
                    <div className="relative">
                      <Bluetooth className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={bluetooth}
                        onChange={(e) => setBluetooth(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="5.0, 5.3..."
                      />
                    </div>
                  </div>

                  {/* IP Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odporność
                    </label>
                    <input
                      type="text"
                      value={ipRating}
                      onChange={(e) => setIpRating(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="IP68, IP67..."
                    />
                  </div>

                  {/* Fast Charging */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Szybkie ładowanie
                    </label>
                    <div className="relative">
                      <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={fastCharging}
                        onChange={(e) => setFastCharging(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="20W, 65W, 120W..."
                      />
                    </div>
                  </div>

                  {/* Wireless Charging */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ładowanie bezprzewodowe
                    </label>
                    <input
                      type="text"
                      value={wirelessCharging}
                      onChange={(e) => setWirelessCharging(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="15W MagSafe, 10W Qi..."
                    />
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
                      className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors w-full sm:w-auto"
                    >
                      <Upload className="w-5 h-5" />
                      Dodaj zdjęcia
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Maksymalnie 10 zdjęć (JPG, PNG, WEBP)
                    </p>
                  </div>

                  {/* Image preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Zdjęcie ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lub wklej URL zdjęcia
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
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
