import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../SearchBar";
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
  User,
  Users,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Search,
  Package,
  Building2,
  Bell,
  Heart,
} from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";
import { voivodeships } from "../../data/locations";

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");

  // Pola lokalizacji
  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".city-dropdown-container")) {
        setShowCityDropdown(false);
      }
    };

    if (showCityDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showCityDropdown]);

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
  const [processor, setProcessor] = useState<string>("");
  const [gpu, setGpu] = useState<string>("");
  const [screenResolution, setScreenResolution] = useState<string>("");
  const [refreshRate, setRefreshRate] = useState<string>("");

  // Dodatkowe informacje
  const [includesCharger, setIncludesCharger] = useState<boolean>(false);
  const [warranty, setWarranty] = useState<string>("");
  const [condition, setCondition] = useState<string>("NEW");

  // Stan dla rozwijania sekcji dodatkowych specyfikacji
  const [showAdditionalSpecs, setShowAdditionalSpecs] =
    useState<boolean>(false);

  // Typ sprzedawcy - czy dodajesz jako osoba prywatna czy firma
  const [sellerType, setSellerType] = useState<"personal" | "business">(
    "personal"
  );
  const [userAccountType, setUserAccountType] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Pomocniki do zmiany kolejności zdjęć ----------
  const moveLocalImage = (index: number, direction: "left" | "right") => {
    setImages((prev) => {
      const arr = [...prev];
      const newIndex = direction === "left" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      const tmp = arr[newIndex];
      arr[newIndex] = arr[index];
      arr[index] = tmp;
      return arr;
    });
  };

  const moveImageUrl = (index: number, direction: "left" | "right") => {
    setImageUrls((prev) => {
      const arr = [...prev];
      const newIndex = direction === "left" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= arr.length) return prev;
      const tmp = arr[newIndex];
      arr[newIndex] = arr[index];
      arr[index] = tmp;
      return arr;
    });
  };

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

  // Pobierz dane użytkownika żeby sprawdzić czy ma konto firmowe
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;

      try {
        const response = await axios.get<{ accountType?: string }>(
          "http://localhost:8080/api/auth/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userData = response.data;
        setUserAccountType(userData.accountType || null);

        // Jeśli użytkownik ma tylko konto firmowe, ustaw sellerType na business
        if (userData.accountType === "business") {
          setSellerType("business");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych użytkownika:", error);
      }
    };

    fetchUserData();
  }, [token]);

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
      if (images.length + newFiles.length <= 6) {
        setImages([...images, ...newFiles]);
      } else {
        alert("Możesz dodać maksymalnie 6 zdjęć");
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      const isValidImageUrl =
        /\.(jpg|jpeg|png|gif|webp)$/i.test(newImageUrl) ||
        newImageUrl.includes("imgur.com") ||
        newImageUrl.includes("i.imgur.com");

      if (isValidImageUrl) {
        if (images.length + imageUrls.length < 6) {
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
          setImageUrls([...imageUrls, processedUrl]);
          setNewImageUrl("");
        } else {
          alert("Możesz dodać maksymalnie 6 zdjęć łącznie");
        }
      } else {
        alert(
          "Podaj prawidłowy link do obrazu (jpg, png, gif, webp) lub Imgur"
        );
      }
    }
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const formData = new FormData();
    images.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/advertisements/upload-images",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        return result.imageUrls;
      } else {
        throw new Error("Błąd podczas uploadu zdjęć");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja lokalizacji
    if (!selectedVoivodeship || !selectedCity) {
      alert("Proszę wybierz województwo i miejscowość");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Musisz być zalogowany aby dodać ogłoszenie");
        return;
      }

      // Upload zdjęć najpierw (jeśli są)
      // Połącz zdjęcia z plików i z linków
      let finalImageUrls: string[] = [];
      if (images.length > 0) {
        const uploadedUrls = await uploadImages();
        if (uploadedUrls.length === 0) {
          alert("Błąd podczas uploadu zdjęć. Spróbuj ponownie.");
          return;
        }
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      // Dodaj linki zewnętrzne
      finalImageUrls = [...finalImageUrls, ...imageUrls];

      const advertisementData = {
        title,
        description,
        price: parseFloat(price),
        categoryId: 1, // Domyślna kategoria smartfonów
        region: selectedVoivodeship, // Województwo
        city: selectedCity, // Miejscowość
        imageUrls: finalImageUrls, // Wszystkie zdjęcia

        // Obowiązkowe specyfikacje - zgodne z CreateAdvertisementDTO
        brand,
        model,
        color,
        osType,
        storage,
        ram,

        // Opcjonalne specyfikacje - zgodne z CreateAdvertisementDTO
        osVersion: osVersion || null,
        rearCameras: rearCameras || null,
        frontCamera: frontCamera || null,
        batteryCapacity: batteryCapacity || null,
        displaySize: displaySize || null,
        displayTech: displayTech || null,
        wifi: wifi || null,
        bluetooth: bluetooth || null,
        ipRating: ipRating || null,
        fastCharging: fastCharging || null,
        wirelessCharging: wirelessCharging || null,
        processor: processor || null,
        gpu: gpu || null,
        screenResolution: screenResolution || null,
        refreshRate: refreshRate || null,

        // Dodatkowe informacje
        includesCharger: includesCharger,
        warranty: warranty || null,
        condition: condition || "NEW",
        sellerType: sellerType, // Typ sprzedawcy
      };

      console.log("Sending advertisement data:", advertisementData);
      console.log("Token present:", !!token);
      console.log("Token value:", token);
      console.log("Is authenticated:", isAuthenticated);
      console.log(
        "User role:",
        isUser ? "USER" : isAdmin ? "ADMIN" : isStaff ? "STAFF" : "unknown"
      );

      const response = await fetch("http://localhost:8080/api/advertisements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(advertisementData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Ogłoszenie zostało dodane pomyślnie!");
        console.log("Created advertisement:", result);

        // Przekierowanie do katalogu smartfonów
        navigate("/smartfony");
        return; // Wyjście z funkcji, żeby nie resetować formularza

        // Reset formularza
        setTitle("");
        setPrice("");
        setDescription("");
        setImages([]);
        setImageUrls([]);
        setNewImageUrl("");
        setSelectedVoivodeship("");
        setSelectedCity("");
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
        setProcessor("");
        setGpu("");
        setScreenResolution("");
        setRefreshRate("");
        setIncludesCharger(false);
        setWarranty("");
        setCondition("NEW");
      } else {
        const errorText = await response.text();
        console.error("Backend response:", response.status, errorText);
        alert(
          "Błąd podczas dodawania ogłoszenia: " +
            response.status +
            " - " +
            errorText
        );
      }
    } catch (error) {
      console.error("Network/fetch error:", error);
      alert(
        "Wystąpił błąd podczas dodawania ogłoszenia: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

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

          {/* Wyszukiwarka z AI */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            {/* Ikona czatu */}
            <button
              onClick={() =>
                token ? navigate("/user/message") : navigate("/login")
              }
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Ikona powiadomień */}
            <button
              onClick={() =>
                token ? navigate("/user/notifications") : navigate("/login")
              }
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>

            {/* Ikona ulubionych */}
            <button
              onClick={() =>
                token ? navigate("/user/watchedads") : navigate("/login")
              }
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Ulubione ogłoszenia"
            >
              <Heart className="w-6 h-6" />
            </button>

            {/* Przycisk dodaj ogłoszenie */}
            <button
              onClick={() =>
                token ? navigate("/user/addadvertisement") : navigate("/login")
              }
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj ogłoszenie
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

      {/* Main Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border border-gray-700 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg shadow-lg">
                <Plus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Dodaj ogłoszenie
                </h1>
                <p className="text-gray-400 mt-1">
                  Wypełnij formularz i opublikuj swoje ogłoszenie
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sekcja podstawowa - OBOWIĄZKOWA */}
              <div className="border-2 border-purple-500 rounded-xl p-6 bg-gray-900">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Informacje podstawowe *
                  </h2>
                </div>

                {/* Wybór typu sprzedawcy - tylko jeśli użytkownik ma oba typy kont */}
                {userAccountType && (
                  <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-purple-500">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Dodajesz ogłoszenie jako:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSellerType("personal")}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          sellerType === "personal"
                            ? "border-purple-500 bg-purple-600 text-white"
                            : "border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-400"
                        }`}
                      >
                        <User className="h-5 w-5" />
                        <span className="font-medium">Osoba prywatna</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellerType("business")}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                          sellerType === "business"
                            ? "border-purple-500 bg-purple-600 text-white"
                            : "border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-400"
                        }`}
                        disabled={userAccountType !== "business"}
                      >
                        <Building2 className="h-5 w-5" />
                        <span className="font-medium">Firma</span>
                      </button>
                    </div>
                    {userAccountType !== "business" &&
                      sellerType === "personal" && (
                        <p className="text-xs text-gray-400 mt-2">
                          Aby dodawać ogłoszenia jako firma, zmień typ konta w
                          ustawieniach profilu
                        </p>
                      )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Tag className="h-4 w-4" />
                      Tytuł *
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Np. iPhone 15 Pro 256 GB"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <DollarSign className="h-4 w-4" />
                      Cena (PLN) *
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="np. 4299"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <FileText className="h-4 w-4" />
                    Opis
                    <span className="text-xs text-gray-400 ml-auto">
                      {description.length}/2000 znaków
                    </span>
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 2000) {
                        setDescription(e.target.value);
                      }
                    }}
                    placeholder="Opisz stan urządzenia, co zawiera zestaw, dlaczego sprzedajesz..."
                    maxLength={2000}
                  />
                  {description.length > 1900 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Uwaga: Zbliżasz się do limitu znaków ({description.length}
                      /2000)
                    </p>
                  )}
                </div>

                {/* Sekcja lokalizacji */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>📍</span>
                      Województwo *
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      value={selectedVoivodeship}
                      onChange={(e) => {
                        setSelectedVoivodeship(e.target.value);
                        setSelectedCity(""); // Resetuj miasto przy zmianie województwa
                      }}
                      required
                    >
                      <option value="">Wybierz województwo</option>
                      {voivodeships.map((voivodeship) => (
                        <option key={voivodeship.name} value={voivodeship.name}>
                          {voivodeship.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="city-dropdown-container relative">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span>🏙️</span>
                      Miejscowość *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Wpisz nazwę miejscowości..."
                        value={selectedCity || citySearchTerm}
                        onChange={(e) => {
                          setCitySearchTerm(e.target.value);
                          setSelectedCity("");
                          setShowCityDropdown(true);
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        disabled={!selectedVoivodeship}
                        required
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

                      {showCityDropdown &&
                        selectedVoivodeship &&
                        (citySearchTerm || !selectedCity) && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {voivodeships
                              .find((v) => v.name === selectedVoivodeship)
                              ?.cities.filter((city) =>
                                city
                                  .toLowerCase()
                                  .includes(
                                    (citySearchTerm || "").toLowerCase()
                                  )
                              )
                              .slice(0, 20) // Ograniczenie do 20 wyników
                              .map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-purple-50 focus:bg-purple-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    setSelectedCity(city);
                                    setCitySearchTerm("");
                                    setShowCityDropdown(false);
                                  }}
                                >
                                  {city}
                                </button>
                              ))}
                            {voivodeships
                              .find((v) => v.name === selectedVoivodeship)
                              ?.cities.filter((city) =>
                                city
                                  .toLowerCase()
                                  .includes(
                                    (citySearchTerm || "").toLowerCase()
                                  )
                              ).length === 0 &&
                              citySearchTerm && (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                  Nie znaleziono miejscowości "{citySearchTerm}"
                                </div>
                              )}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sekcja zdjęć */}
              <div className="border border-purple-500 rounded-xl p-6 bg-gray-900">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Zdjęcia</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                      <Upload className="h-4 w-4" />
                      Wybierz pliki ({images.length + imageUrls.length}/6)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onSelectImages(e.target.files)}
                      disabled={images.length + imageUrls.length >= 6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
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
                            <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => moveLocalImage(idx, "left")}
                                disabled={idx === 0}
                                className="bg-gray-700 text-white rounded p-1"
                                title="Przenieś w lewo"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveLocalImage(idx, "right")}
                                disabled={idx === images.length - 1}
                                className="bg-gray-700 text-white rounded p-1"
                                title="Przenieś w prawo"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="bg-red-500 text-white rounded-full p-1 mt-1"
                                title="Usuń"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                      <Upload className="h-4 w-4" />
                      Dodaj linki do zdjęć ({images.length + imageUrls.length}
                      /6)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://i.imgur.com/abc123.jpg lub https://example.com/image.png"
                        disabled={images.length + imageUrls.length >= 6}
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        disabled={
                          !newImageUrl.trim() ||
                          images.length + imageUrls.length >= 6
                        }
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Dodaj
                      </button>
                    </div>

                    {/* Wyświetlanie dodanych linków */}
                    {imageUrls.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">Dodane linki:</p>
                        <div className="space-y-2">
                          {imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg"
                            >
                              <img
                                src={url}
                                alt={`Link ${index + 1}`}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://dummyimage.com/48x48/ccc/fff&text=Error";
                                }}
                              />
                              <span className="flex-1 text-sm text-gray-300 truncate">
                                {url}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveImageUrl(index, "left")}
                                  disabled={index === 0}
                                  className="p-1 bg-gray-700 text-white rounded"
                                  title="Przenieś w lewo"
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveImageUrl(index, "right")}
                                  disabled={index === imageUrls.length - 1}
                                  className="p-1 bg-gray-700 text-white rounded"
                                  title="Przenieś w prawo"
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeImageUrl(index)}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded"
                                  title="Usuń"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      💡 Możesz dodać łącznie do 6 zdjęć (pliki + linki). Dla
                      Imgur: użyj bezpośredniego linku do obrazu
                    </p>
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
                      Aparat główny * (MP)
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
                      Aparat przedni * (MP)
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
                    Pojemność baterii * (mAh)
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    placeholder="np. 3274 mAh"
                    required
                  />
                </div>

                {/* Przycisk rozwijania dodatkowych specyfikacji */}
                <button
                  type="button"
                  onClick={() => setShowAdditionalSpecs(!showAdditionalSpecs)}
                  className="w-full mt-6 flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-semibold">
                      Dodatkowe specyfikacje (opcjonalne)
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-white transition-transform ${
                      showAdditionalSpecs ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Rozwijana sekcja dodatkowych specyfikacji */}
                {showAdditionalSpecs && (
                  <div className="mt-4 space-y-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    {/* Wyświetlacz */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Wyświetlacz
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Przekątna
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={displaySize}
                            onChange={(e) => setDisplaySize(e.target.value)}
                            placeholder="np. 6.1 cala"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Technologia
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={displayTech}
                            onChange={(e) => setDisplayTech(e.target.value)}
                            placeholder="np. Super Retina XDR OLED"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Łączność */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Wifi className="h-5 w-5" />
                        Łączność
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Wifi className="h-4 w-4" />
                            Wi-Fi
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={wifi}
                            onChange={(e) => setWifi(e.target.value)}
                            placeholder="np. Wi‑Fi 6E"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Bluetooth className="h-4 w-4" />
                            Bluetooth
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={bluetooth}
                            onChange={(e) => setBluetooth(e.target.value)}
                            placeholder="np. 5.3"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Shield className="h-4 w-4" />
                            Odporność
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={ipRating}
                            onChange={(e) => setIpRating(e.target.value)}
                            placeholder="np. IP68"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ładowanie */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Ładowanie
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Ładowanie przewodowe
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={fastCharging}
                            onChange={(e) => setFastCharging(e.target.value)}
                            placeholder="np. 27W"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Ładowanie bezprzewodowe
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={wirelessCharging}
                            onChange={(e) =>
                              setWirelessCharging(e.target.value)
                            }
                            placeholder="np. 15W MagSafe"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Procesor i grafika */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Cpu className="h-5 w-5" />
                        Procesor i grafika
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Procesor
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={processor}
                            onChange={(e) => setProcessor(e.target.value)}
                            placeholder="np. Apple A17 Pro"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Karta graficzna
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={gpu}
                            onChange={(e) => setGpu(e.target.value)}
                            placeholder="np. Apple GPU 6-core"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Wyświetlacz - zaawansowane */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Wyświetlacz - szczegóły
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Rozdzielczość
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={screenResolution}
                            onChange={(e) =>
                              setScreenResolution(e.target.value)
                            }
                            placeholder="np. 2556 x 1179"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-300 mb-2 block">
                            Częstotliwość odświeżania (Hz)
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={refreshRate}
                            onChange={(e) => setRefreshRate(e.target.value)}
                            placeholder="np. 120Hz"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dodatkowe informacje */}
              <div className="border border-purple-500 rounded-xl p-6 bg-gray-900">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Dodatkowe informacje
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Stan urządzenia *
                      </label>
                      <select
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
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
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Gwarancja
                        <span className="text-xs text-gray-400 ml-2">
                          {warranty.length}/500 znaków
                        </span>
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={warranty}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setWarranty(e.target.value);
                          }
                        }}
                        placeholder="np. 24 miesiące"
                        maxLength={500}
                      />
                      {warranty.length > 450 && (
                        <p className="text-xs text-orange-400 mt-1">
                          Uwaga: Zbliżasz się do limitu znaków (
                          {warranty.length}/500)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Checkbox dla ładowarki */}
                  <div className="mt-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={includesCharger}
                        onChange={(e) => setIncludesCharger(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-300">
                        Ładowarka z kablem w zestawie
                      </span>
                    </label>
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

      {/* Czarna stopka */}
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
          <div className="text-center mt-4 text-gray-400 text-xs">
            © 2024 MobliX. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AddAdvertisement;
