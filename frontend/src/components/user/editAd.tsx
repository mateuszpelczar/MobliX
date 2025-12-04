import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import SearchBar from "../SearchBar";
import {
  Smartphone,
  Camera,
  Cpu,
  Monitor as MonitorIcon,
  Wifi,
  Bluetooth,
  Zap,
  Plus,
  FileText,
  Search,
  MessageSquare,
  Bell,
  Heart,
  User,
  Users,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Building2,
  ShoppingBag,
  Save,
} from "lucide-react";
import { voivodeships } from "../../data/locations";

type OsType = "Android" | "iOS";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

// -------- Typy danych (proste interfejsy) --------
type Specification = {
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

type UserData = {
  accountType?: string;
};

// Typ dla ogłoszenia używany w komponencie
type Advertisement = {
  id?: number | string;
  title?: string;
  price?: number | null;
  description?: string | null;
  imageUrls?: string[];
  region?: string | null;
  voivodeship?: string | null;
  city?: string | null;
  locationName?: string | null;
  specification?: Specification | null;
  includesCharger?: boolean;
  warranty?: string | null;
  condition?: string | null;
  sellerType?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ---------- Stan komponentu (pola formularza i UI) ----------
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [title, setTitle] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState<string>("");

  const [selectedVoivodeship, setSelectedVoivodeship] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [citySearchTerm, setCitySearchTerm] = useState<string>("");
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

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

  const [includesCharger, setIncludesCharger] = useState<boolean>(false);
  const [warranty, setWarranty] = useState<string>("");
  const [condition, setCondition] = useState<string>("NEW");

  const [showAdditionalSpecs, setShowAdditionalSpecs] =
    useState<boolean>(false);
  const [sellerType, setSellerType] = useState<"personal" | "business">(
    "personal"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- Zmiana kolejnosci wyswietlania zdjec ----------
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

  // ---------- Autoryzacja ----------
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
      // token expiration check kept for potential use elsewhere
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  // ---------- Pobieranie ogłoszenia i wypełnianie formularza ----------
  useEffect(() => {
    const fetchAd = async () => {
      if (!id) return;
      try {
        // Typujemy odpowiedź jako Advertisement
        const resp = await axios.get<Advertisement>(
          `/api/advertisements/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const ad = resp.data;

        // Wypełnij pola formularza z odpowiedzi
        setTitle(ad.title ?? "");
        setPrice(ad.price?.toString() ?? "");
        setDescription(ad.description ?? "");
        setImageUrls(ad.imageUrls ?? []);
        setSelectedVoivodeship(ad.region ?? ad.voivodeship ?? "");
        setSelectedCity(ad.city ?? ad.locationName ?? "");
        setBrand(ad.specification?.brand ?? "");
        setModel(ad.specification?.model ?? "");
        setColor(ad.specification?.color ?? "");
        setOsType((ad.specification?.osType as OsType) ?? "Android");
        setOsVersion(ad.specification?.osVersion ?? "");
        setStorage(ad.specification?.storage ?? "");
        setRam(ad.specification?.ram ?? "");
        setRearCameras(ad.specification?.rearCameras ?? "");
        setFrontCamera(ad.specification?.frontCamera ?? "");
        setBatteryCapacity(ad.specification?.batteryCapacity ?? "");
        setDisplaySize(ad.specification?.displaySize ?? "");
        setDisplayTech(ad.specification?.displayTech ?? "");
        setWifi(ad.specification?.wifi ?? "");
        setBluetooth(ad.specification?.bluetooth ?? "");
        setIpRating(ad.specification?.ipRating ?? "");
        setFastCharging(ad.specification?.fastCharging ?? "");
        setWirelessCharging(ad.specification?.wirelessCharging ?? "");
        setProcessor(ad.specification?.processor ?? "");
        setGpu(ad.specification?.gpu ?? "");
        setScreenResolution(ad.specification?.screenResolution ?? "");
        setRefreshRate(ad.specification?.refreshRate ?? "");
        setIncludesCharger(ad.includesCharger ?? false);
        setWarranty(ad.warranty ?? "");
        setCondition(ad.condition ?? "NEW");
        setSellerType((ad.sellerType as "personal" | "business") ?? "personal");
      } catch (err) {
        console.error("Error fetching ad:", err);
      }
    };

    fetchAd();
  }, [id, token]);

  // ---------- Pobierz dane użytkownika (accountType) ----------
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const res = await axios.get<UserData>("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = res.data;
        if (userData.accountType === "business") setSellerType("business");
      } catch (e) {
        console.error("Error fetching user data", e);
      }
    };
    fetchUserData();
  }, [token]);

  // ---------- Pobierz liczbę ulubionych do paska nagłówka ----------
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      if (!token) return;
      try {
        const resp = await fetch("/api/favorites", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (resp.ok) {
          const data = (await resp.json()) as any[];
          setFavoriteCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFavoriteCount();
  }, [token]);

  // ---------- Dropdown: klik poza elementem zamyka dropdown ----------
  useEffect(() => {
    const h = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // ---------- Logowanie wyszukiwania z paska (navbar) ----------
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      try {
        let userId = null;
        if (token) {
          try {
            const dec = jwtDecode<JwtPayLoad>(token);
            userId = dec.sub ? parseInt(dec.sub) : null;
          } catch {}
        }
        await axios.post("/api/search-logs", {
          searchQuery: query,
          brand: null,
          model: null,
          minPrice: null,
          maxPrice: null,
          userId,
          sessionId: null,
          resultsCount: null,
          searchSource: "navbar",
        });
      } catch (e) {
        console.error("Search log error", e);
      }
      navigate(`/smartfony?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/smartfony");
    }
  };

  // ---------- Obsługa zdjęć (pliki + linki) ----------
  const onSelectImages = (fileList: FileList | null) => {
    if (fileList) {
      const newFiles = Array.from(fileList);
      if (images.length + newFiles.length + imageUrls.length <= 6) {
        setImages((prev) => [...prev, ...newFiles]);
      } else {
        alert("Możesz dodać maksymalnie 6 zdjęć");
      }
    }
  };

  const removeLocalImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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
    if (images.length + imageUrls.length >= 6) {
      alert("Możesz dodać maksymalnie 6 zdjęć łącznie");
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
    setImageUrls((prev) => [...prev, processedUrl]);
    setNewImageUrl("");
  };

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];
    const formData = new FormData();
    images.forEach((f) => formData.append("files", f));
    try {
      const resp = await fetch("/api/advertisements/upload-images", {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });
      if (!resp.ok) throw new Error("Upload failed");
      const result = (await resp.json()) as { imageUrls?: string[] };
      return result.imageUrls ?? [];
    } catch (e) {
      console.error("Upload error", e);
      return [];
    }
  };

  // ---------- Zatwierdzenie formularza: PUT aktualizacja ogłoszenia ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return alert("Brak ID ogłoszenia");
    if (!selectedVoivodeship || !selectedCity) {
      alert("Proszę wybierz województwo i miejscowość");
      return;
    }
    try {
      const tokenLocal = localStorage.getItem("token");
      if (!tokenLocal) {
        alert("Musisz być zalogowany");
        return;
      }

      let finalImageUrls: string[] = [];
      if (images.length > 0) {
        const uploaded = await uploadImages();
        if (uploaded.length === 0) {
          alert("Błąd podczas uploadu zdjęć");
          return;
        }
        finalImageUrls = [...finalImageUrls, ...uploaded];
      }
      finalImageUrls = [...finalImageUrls, ...imageUrls];

      // Backend expects flattened fields (CreateAdvertisementDTO), not nested `specification`.
      const payload = {
        title,
        description,
        price: parseFloat(price || "0"),
        categoryId: 1,
        region: selectedVoivodeship,
        city: selectedCity,
        imageUrls: finalImageUrls,
        // Flattened specification fields required by backend DTO
        brand,
        model,
        color,
        osType,
        osVersion: osVersion || null,
        storage,
        ram,
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
        includesCharger,
        warranty: warranty || null,
        condition,
        sellerType,
      };

      const resp = await fetch(`/api/advertisements/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenLocal}`,
        },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        alert("Ogłoszenie zaktualizowane!");
        navigate("/user/your-ads");
      } else {
        const txt = await resp.text();
        alert("Błąd aktualizacji: " + resp.status + " - " + txt);
      }
    } catch (e) {
      console.error(e);
      alert("Błąd sieci: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  // ---------- Pomocnik: zamykanie dropdown z listą miast ----------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".city-dropdown-container")) {
        setShowCityDropdown(false);
      }
    };
    if (showCityDropdown)
      document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showCityDropdown]);

  // NOTE: Editing is handled via the main form submit (handleSubmit).
  // Removed modal/list-edit helpers and references to global variables
  // like `setAds`, `setShowEditModal` and `editImages` which do not exist
  // in this standalone edit page.

  // ---------- Render (UI) ----------
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Nagłówek - czarny pasek (taki jak w MainPanel) */}
      <nav className="bg-black text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                token ? navigate("/user/message") : navigate("/login")
              }
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                token ? navigate("/user/notifications") : navigate("/login")
              }
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>
            <button
              onClick={() =>
                token ? navigate("/user/watchedads") : navigate("/login")
              }
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Ulubione"
            >
              <Heart className="w-6 h-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {favoriteCount > 9 ? "9+" : favoriteCount}
                </span>
              )}
            </button>
            <button
              onClick={() =>
                token ? navigate("/user/addadvertisement") : navigate("/login")
              }
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
                <div className="absolute right-0 mt-2 w-56 bg-purple-600 rounded-lg shadow-xl py-2 z-50">
                  {token ? (
                    <>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/your-ads");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        Ogłoszenia
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/message");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                      >
                        <MessageSquare className="w-4 h-4 text-green-400" />
                        Chat
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/user/personaldetails");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-black flex items-center gap-3 text-white"
                      >
                        <User className="w-4 h-4 text-purple-300" />
                        Profil
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/admin");
                          }}
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
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                      className="w-full text-left px-4 py-2 bg-black hover:bg-black flex items-center gap-3 text-white rounded-lg"
                    >
                      Zaloguj się
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Główne okno formularza */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-black rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 border-4 border-purple-600 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-lg shadow-lg">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Edytuj ogłoszenie
                </h1>
                <p className="text-gray-300 mt-1">
                  Zmień dane ogłoszenia i zapisz
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informacje podstawowe */}
              <div className="border-2 border-purple-500 rounded-xl p-6 bg-black">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Informacje podstawowe *
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tytuł *
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Np. iPhone 15 Pro 256 GB"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cena (PLN) *
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="np. 4299"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Opis{" "}
                    <span className="text-xs text-gray-400 ml-2">
                      {description.length}/2000
                    </span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      if (e.target.value.length <= 2000)
                        setDescription(e.target.value);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                  />
                </div>

                {/* Lokalizacja - wybór województwa i miasta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Województwo *
                    </label>
                    <select
                      value={selectedVoivodeship}
                      onChange={(e) => {
                        // Ustaw województwo i czyść miasto (użytkownik wybierze ponownie)
                        setSelectedVoivodeship(e.target.value);
                        setSelectedCity("");
                      }}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Wybierz województwo</option>
                      {voivodeships.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="city-dropdown-container relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Miejscowość *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Wpisz nazwę miejscowości..."
                        value={selectedCity || citySearchTerm}
                        onChange={(e) => {
                          setCitySearchTerm(e.target.value);
                          setSelectedCity("");
                          setShowCityDropdown(true);
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        disabled={!selectedVoivodeship}
                        className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      {showCityDropdown &&
                        selectedVoivodeship &&
                        (citySearchTerm || !selectedCity) && (
                          <div className="absolute z-50 w-full mt-1 bg-white text-black border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {voivodeships
                              .find((v) => v.name === selectedVoivodeship)
                              ?.cities.filter((city) =>
                                city
                                  .toLowerCase()
                                  .includes(
                                    (citySearchTerm || "").toLowerCase()
                                  )
                              )
                              .slice(0, 20)
                              .map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  className="w-full px-4 py-2 text-left hover:bg-purple-50"
                                  onClick={() => {
                                    setSelectedCity(city);
                                    setCitySearchTerm("");
                                    setShowCityDropdown(false);
                                  }}
                                >
                                  {city}
                                </button>
                              ))}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Zdjęcia */}
              <div className="border border-purple-500 rounded-xl p-6 bg-black">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Zdjęcia</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Wybierz pliki ({images.length + imageUrls.length}/6)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => onSelectImages(e.target.files)}
                      disabled={images.length + imageUrls.length >= 6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                    />
                    {images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`preview${idx}`}
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
                                onClick={() => removeLocalImage(idx)}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dodaj linki do zdjęć ({images.length + imageUrls.length}
                      /6)
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://i.imgur.com/abc123.jpg"
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        disabled={images.length + imageUrls.length >= 6}
                      />
                      <button
                        type="button"
                        onClick={addImageUrl}
                        disabled={
                          !newImageUrl.trim() ||
                          images.length + imageUrls.length >= 6
                        }
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg"
                      >
                        Dodaj
                      </button>
                    </div>

                    {imageUrls.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">Dodane linki:</p>
                        {imageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 bg-gray-900 rounded-lg"
                          >
                            <img
                              src={url}
                              alt={`link${idx}`}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).src =
                                  "https://dummyimage.com/48x48/ccc/fff&text=Error")
                              }
                            />
                            <span className="flex-1 text-sm text-white truncate">
                              {url}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveImageUrl(idx, "left")}
                                disabled={idx === 0}
                                className="p-1 bg-gray-700 text-white rounded"
                                title="Przenieś w lewo"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImageUrl(idx, "right")}
                                disabled={idx === imageUrls.length - 1}
                                className="p-1 bg-gray-700 text-white rounded"
                                title="Przenieś w prawo"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImageUrl(idx)}
                                className="p-1 text-red-500 hover:bg-red-100 rounded"
                                title="Usuń"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      💡 Możesz dodać łącznie do 6 zdjęć (pliki + linki). Dla
                      Imgur: użyj bezpośredniego linku do obrazu
                    </p>
                  </div>
                </div>
              </div>

              {/* Specyfikacja */}
              <div className="border-2 border-green-200 rounded-xl p-6 bg-black">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Specyfikacja smartfona *
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Marka *
                    </label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    >
                      <option value="">Wybierz markę</option>
                      <option>Apple</option>
                      <option>Samsung</option>
                      <option>Xiaomi</option>
                      <option>Huawei</option>
                      <option>OnePlus</option>
                      <option>Google</option>
                      <option>Nothing</option>
                      <option>Realme</option>
                      <option>Oppo</option>
                      <option>Vivo</option>
                      <option>Motorola</option>
                      <option>Sony</option>
                      <option>Inne</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Model *
                    </label>
                    <input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="np. iPhone 15 Pro"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Kolor *
                    </label>
                    <input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="np. Tytanowy"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    />
                  </div>
                </div>

                {/* Pozostałe pola specyfikacji */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      System operacyjny *
                    </label>
                    <select
                      value={osType}
                      onChange={(e) => setOsType(e.target.value as OsType)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    >
                      <option value="Android">Android</option>
                      <option value="iOS">iOS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Wersja systemu
                    </label>
                    <input
                      value={osVersion}
                      onChange={(e) => setOsVersion(e.target.value)}
                      placeholder="np. Android 14 / iOS 17"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Pamięć wewnętrzna *
                    </label>
                    <select
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    >
                      <option value="">Wybierz pojemność</option>
                      <option>64 GB</option>
                      <option>128 GB</option>
                      <option>256 GB</option>
                      <option>512 GB</option>
                      <option>1 TB</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Pamięć RAM *
                    </label>
                    <select
                      value={ram}
                      onChange={(e) => setRam(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    >
                      <option value="">Wybierz RAM</option>
                      <option>4 GB</option>
                      <option>6 GB</option>
                      <option>8 GB</option>
                      <option>12 GB</option>
                      <option>16 GB</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Aparat główny (MP) *
                    </label>
                    <input
                      value={rearCameras}
                      onChange={(e) => setRearCameras(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Aparat przedni (MP) *
                    </label>
                    <input
                      value={frontCamera}
                      onChange={(e) => setFrontCamera(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Pojemność baterii * (mAh)
                  </label>
                  <input
                    value={batteryCapacity}
                    onChange={(e) => setBatteryCapacity(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdditionalSpecs(!showAdditionalSpecs)}
                  className="w-full mt-6 px-4 py-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MonitorIcon className="h-5 w-5 text-purple-400" />
                      <span className="font-semibold">
                        Dodatkowe specyfikacje (opcjonalne)
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 ${
                        showAdditionalSpecs ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {showAdditionalSpecs && (
                  <div className="mt-4 space-y-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
                    {/* Dodatkowe pola */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MonitorIcon className="h-5 w-5" /> Wyświetlacz
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={displaySize}
                          onChange={(e) => setDisplaySize(e.target.value)}
                          placeholder="Przekątna"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                        <input
                          value={displayTech}
                          onChange={(e) => setDisplayTech(e.target.value)}
                          placeholder="Technologia"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Wifi className="h-5 w-5" /> Łączność
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          value={wifi}
                          onChange={(e) => setWifi(e.target.value)}
                          placeholder="Wi‑Fi"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                        <input
                          value={bluetooth}
                          onChange={(e) => setBluetooth(e.target.value)}
                          placeholder="Bluetooth"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                        <input
                          value={ipRating}
                          onChange={(e) => setIpRating(e.target.value)}
                          placeholder="IP rating"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5" /> Ładowanie
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={fastCharging}
                          onChange={(e) => setFastCharging(e.target.value)}
                          placeholder="Ładowanie przewodowe"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                        <input
                          value={wirelessCharging}
                          onChange={(e) => setWirelessCharging(e.target.value)}
                          placeholder="Ładowanie bezprzewodowe"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Cpu className="h-5 w-5" /> Procesor i grafika
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={processor}
                          onChange={(e) => setProcessor(e.target.value)}
                          placeholder="Procesor"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                        <input
                          value={gpu}
                          onChange={(e) => setGpu(e.target.value)}
                          placeholder="GPU"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MonitorIcon className="h-5 w-5" /> Wyświetlacz -
                        szczegóły
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          value={screenResolution}
                          onChange={(e) => setScreenResolution(e.target.value)}
                          placeholder="Rozdzielczość"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                        <input
                          value={refreshRate}
                          onChange={(e) => setRefreshRate(e.target.value)}
                          placeholder="Hz"
                          className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dodatkowe informacje */}
              <div className="border border-purple-500 rounded-xl p-6 bg-black">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Dodatkowe informacje
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Stan urządzenia *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
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
                    </label>
                    <input
                      value={warranty}
                      onChange={(e) => {
                        if (e.target.value.length <= 500)
                          setWarranty(e.target.value);
                      }}
                      placeholder="np. 24 miesiące"
                      className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-900 text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={includesCharger}
                      onChange={(e) => setIncludesCharger(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded"
                    />
                    <span className="text-gray-300">
                      Ładowarka z kablem w zestawie
                    </span>
                  </label>
                </div>
              </div>

              {/* Przyciski */}
              <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => navigate("/user/your-ads")}
                  type="button"
                  className="px-6 py-2 rounded-lg border border-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  Zapisz zmiany
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stopka */}
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <a href="/jak-dziala-moblix" className="hover:text-purple-400">
              Jak działa MobliX
            </a>
            <a href="/polityka-cookies" className="hover:text-purple-400">
              Polityka cookies
            </a>
            <a href="/regulamin" className="hover:text-purple-400">
              Regulamin
            </a>
            <a href="/zasady-bezpieczenstwa" className="hover:text-purple-400">
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

export default EditAd;
