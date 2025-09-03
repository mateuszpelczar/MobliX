import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Upload,
  X,
  FileText,
  Tag,
  DollarSign,
  Palette,
  MessageSquare,
  ShoppingBag,
  Star,
  User,
  Users,
  LogOut,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";

type OsType = "Android" | "iOS";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const AddAdvertisement: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
  let isUser = false;
  let isStaff = false;
  let isAuthenticated = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";

      if (decoded.exp && Date.now() / 1000 < decoded.exp) {
        isAuthenticated = true;
      }
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
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

  const onSelectImages = (fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList);
      if (images.length + newFiles.length <= 3) {
        setImages([...images, ...newFiles]);
      } else {
        alert("Możesz dodać maksymalnie 3 zdjęcia");
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Musisz być zalogowany aby dodać ogłoszenie");
        return;
      }

      const advertisementData = {
        title,
        description,
        price: parseFloat(price),
        categoryId: 1, // Domyślna kategoria smartfonów
        locationId: null, // Opcjonalne
        imageUrls: imageUrl ? [imageUrl] : [],

        // Obowiązkowe specyfikacje
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

        // Opcjonalne specyfikacje
        displaySize,
        displayTech,
        wifi,
        bluetooth,
        ipRating,
        fastCharging,
        wirelessCharging,
      };

      const response = await fetch(
        "http://localhost:8088/api/user/advertisements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(advertisementData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert("Ogłoszenie zostało dodane pomyślnie!");
        console.log("Created advertisement:", result);

        // Reset formularza
        setTitle("");
        setPrice("");
        setDescription("");
        setImageUrl("");
        setImages([]);
        setBrand("");
        setModel("");
        setColor("");
        setOsVersion("");
        setStorage("");
        setRam("");
        setRearCameras("");
        setFrontCamera("");
        setBatteryCapacity("");
        setDisplaySize("");
        setDisplayTech("");
        setWifi("");
        setBluetooth("");
        setIpRating("");
        setFastCharging("");
        setWirelessCharging("");
      } else {
        const error = await response.text();
        alert("Błąd podczas dodawania ogłoszenia: " + error);
      }
    } catch (error) {
      console.error("Error creating advertisement:", error);
      alert("Wystąpił błąd podczas dodawania ogłoszenia");
    }
  };

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
                          onClick={handleGoToAdminPanel}
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
                        className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/login");
                        }}
                      >
                        <LogIn className="w-4 h-4 text-green-600" />
                        Zaloguj się
                      </button>
                      <button
                        className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/register");
                        }}
                      >
                        <User className="w-4 h-4 text-blue-600" />
                        Zarejestruj się
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dodaj ogłoszenie
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sekcja podstawowa - OBOWIĄZKOWA */}
              <div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Informacje podstawowe *
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="h-4 w-4" />
                      Tytuł *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Np. iPhone 15 Pro 256 GB"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="h-4 w-4" />
                      Cena (PLN) *
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="np. 4299"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4" />
                    Opis
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz stan urządzenia, co zawiera zestaw, dlaczego sprzedajesz..."
                  />
                </div>
              </div>

              {/* Sekcja zdjęć */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Zdjęcia</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Upload className="h-4 w-4" />
                      Dodaj zdjęcia (maksymalnie 3)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onSelectImages(e.target.files)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`Preview ${idx}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                      <Upload className="h-4 w-4" />
                      Lub podaj link do zdjęcia
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Specyfikacja techniczna smartfona - OBOWIĄZKOWE POLA */}
              <div className="border-2 border-green-200 rounded-xl p-6 bg-green-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Specyfikacja smartfona *
                  </h2>
                </div>

                {/* Podstawowe dane - OBOWIĄZKOWE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="h-4 w-4" />
                      Marka *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      required
                    >
                      <option value="">Wybierz markę</option>
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Huawei">Huawei</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Google">Google</option>
                      <option value="Nothing">Nothing</option>
                      <option value="Realme">Realme</option>
                      <option value="Oppo">Oppo</option>
                      <option value="Vivo">Vivo</option>
                      <option value="Motorola">Motorola</option>
                      <option value="Sony">Sony</option>
                      <option value="Inne">Inne</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Smartphone className="h-4 w-4" />
                      Model *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="np. iPhone 15 Pro"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Palette className="h-4 w-4" />
                      Kolor *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="np. Tytanowy naturalny"
                      required
                    />
                  </div>
                </div>

                {/* System operacyjny - OBOWIĄZKOWY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center gap-1">
                        <FaAndroid className="h-4 w-4" />
                        <FaApple className="h-4 w-4" />
                      </div>
                      System operacyjny *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={osType}
                      onChange={(e) => setOsType(e.target.value as OsType)}
                      required
                    >
                      <option value="Android">Android</option>
                      <option value="iOS">iOS</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      Wersja systemu *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={osVersion}
                      onChange={(e) => setOsVersion(e.target.value)}
                      placeholder={
                        osType === "iOS" ? "np. iOS 17" : "np. Android 14"
                      }
                      required
                    />
                  </div>
                </div>

                {/* Pamięć - OBOWIĄZKOWA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <HardDrive className="h-4 w-4" />
                      Pamięć wewnętrzna *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      required
                    >
                      <option value="">Wybierz pojemność</option>
                      <option value="64 GB">64 GB</option>
                      <option value="128 GB">128 GB</option>
                      <option value="256 GB">256 GB</option>
                      <option value="512 GB">512 GB</option>
                      <option value="1 TB">1 TB</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Cpu className="h-4 w-4" />
                      Pamięć RAM *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={ram}
                      onChange={(e) => setRam(e.target.value)}
                      required
                    >
                      <option value="">Wybierz RAM</option>
                      <option value="4 GB">4 GB</option>
                      <option value="6 GB">6 GB</option>
                      <option value="8 GB">8 GB</option>
                      <option value="12 GB">12 GB</option>
                      <option value="16 GB">16 GB</option>
                    </select>
                  </div>
                </div>

                {/* Aparaty - OBOWIĄZKOWE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Camera className="h-4 w-4" />
                      Aparat główny *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={rearCameras}
                      onChange={(e) => setRearCameras(e.target.value)}
                      placeholder="np. 48 MP + 12 MP + 12 MP"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Camera className="h-4 w-4" />
                      Aparat przedni *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={frontCamera}
                      onChange={(e) => setFrontCamera(e.target.value)}
                      placeholder="np. 12 MP"
                      required
                    />
                  </div>
                </div>

                {/* Bateria - OBOWIĄZKOWA */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Battery className="h-4 w-4" />
                    Pojemność baterii *
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    placeholder="np. 3274 mAh"
                    required
                  />
                </div>
              </div>

              {/* Dodatkowe specyfikacje - OPCJONALNE */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Monitor className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Dodatkowe specyfikacje (opcjonalne)
                  </h2>
                </div>

                {/* Wyświetlacz */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Wyświetlacz
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Przekątna
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={displaySize}
                        onChange={(e) => setDisplaySize(e.target.value)}
                        placeholder="np. 6.1 cala"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Technologia
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={displayTech}
                        onChange={(e) => setDisplayTech(e.target.value)}
                        placeholder="np. Super Retina XDR OLED"
                      />
                    </div>
                  </div>
                </div>

                {/* Łączność */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    Łączność
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Wifi className="h-4 w-4" />
                        Wi-Fi
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={wifi}
                        onChange={(e) => setWifi(e.target.value)}
                        placeholder="np. Wi‑Fi 6E"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Bluetooth className="h-4 w-4" />
                        Bluetooth
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={bluetooth}
                        onChange={(e) => setBluetooth(e.target.value)}
                        placeholder="np. 5.3"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Shield className="h-4 w-4" />
                        Odporność
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={ipRating}
                        onChange={(e) => setIpRating(e.target.value)}
                        placeholder="np. IP68"
                      />
                    </div>
                  </div>
                </div>

                {/* Ładowanie */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Ładowanie
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ładowanie przewodowe
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={fastCharging}
                        onChange={(e) => setFastCharging(e.target.value)}
                        placeholder="np. 27W"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ładowanie bezprzewodowe
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        value={wirelessCharging}
                        onChange={(e) => setWirelessCharging(e.target.value)}
                        placeholder="np. 15W MagSafe"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Przycisk publikacji */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center gap-3"
                >
                  <Plus className="h-5 w-5" />
                  Publikuj ogłoszenie
                </button>
              </div>
            </form>
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

export default AddAdvertisement;
