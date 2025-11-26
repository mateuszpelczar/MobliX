import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  MapPin,
  Smartphone,
  Heart,
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  Package,
  Check,
  LogIn,
  Building2,
  Search,
  Bell,
  Plus,
  Hash,
  Globe,
  Eye,
  Share2,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

interface FavoriteCheckResponse {
  isFavorite: boolean;
}

interface SellerInfo {
  sellerType: string;
  name: string;
  phone: string | null;
  email: string | null;
  yearJoined: number;
  companyName: string | null;
  address: string | null;
  website: string | null;
  nip: string | null;
  regon: string | null;
}

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
  sellerPhone: string;
  sellerEmail: string;
  dateAdded: string;
  views: number;
  likes: number;
  description: string;
  specifications: {
    brand: string;
    model: string;
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
  additionalInfo: {
    warranty: string;
    includesCharger: boolean;
  };
}

// Rozszerzone dane smartfonów
const smartphones: SmartphoneData[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB Titan Natural",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    price: 5299,
    originalPrice: 5999,
    location: "Warszawa, Mokotów",
    condition: "NEW",
    images: [
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Front",
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Back",
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Side",
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Box",
    ],
    seller: "TechStore Warszawa",
    sellerPhone: "+48 123 456 789",
    sellerEmail: "contact@techstore.pl",
    dateAdded: "2024-09-20",
    views: 1247,
    likes: 89,
    description:
      "Nowy iPhone 15 Pro Max w kolorze Titan Natural. Oryginalny, nieużywany, z pełną gwarancją Apple. Telefon jest fabrycznie nowy, w oryginalnym opakowaniu. Wszystkie akcesoria dołączone. Możliwość sprawdzenia przed zakupem w naszym sklepie stacjonarnym. Gwarancja producenta 2 lata.",
    specifications: {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      storage: "256GB",
      ram: "8GB",
      color: "Titan Natural",
      batteryCapacity: "4441mAh",
      screenSize: '6.7"',
      cameraMP: "48MP",
      osType: "iOS",
      osVersion: "17.0",
      frontCamera: "12MP",
      displayTech: "Super Retina XDR",
      wifi: "Wi-Fi 6E",
      bluetooth: "5.3",
      ipRating: "IP68",
      fastCharging: "27W",
      wirelessCharging: "15W MagSafe",
      processor: "Apple A17 Pro",
      gpu: "Apple GPU 6-core",
      screenResolution: "2796 x 1290",
      refreshRate: "120Hz",
    },
    additionalInfo: {
      warranty: "24 miesiące",
      includesCharger: true,
    },
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra 512GB Black",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    price: 4899,
    location: "Kraków, Stare Miasto",
    condition: "LIKE_NEW",
    images: [
      "https://dummyimage.com/600x700/1f2937/fff&text=Galaxy+S24+Front",
      "https://dummyimage.com/600x700/1f2937/fff&text=Galaxy+S24+Back",
      "https://dummyimage.com/600x700/1f2937/fff&text=Galaxy+S24+SPen",
    ],
    seller: "MobileTech Kraków",
    sellerPhone: "+48 987 654 321",
    sellerEmail: "info@mobiletech.pl",
    dateAdded: "2024-09-19",
    views: 892,
    likes: 67,
    description:
      "Samsung Galaxy S24 Ultra z S Pen. Najnowszy model 2024. Telefon fabrycznie nowy, w oryginalnym opakowaniu z wszystkimi akcesoriami.",
    specifications: {
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      storage: "512GB",
      ram: "12GB",
      color: "Phantom Black",
      batteryCapacity: "5000mAh",
      screenSize: '6.8"',
      cameraMP: "200MP",
      osType: "Android",
      osVersion: "14",
      frontCamera: "12MP",
      displayTech: "Dynamic AMOLED 2X",
      wifi: "Wi-Fi 7",
      bluetooth: "5.3",
      ipRating: "IP68",
      fastCharging: "45W",
      wirelessCharging: "15W",
      processor: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      screenResolution: "3120 x 1440",
      refreshRate: "120Hz",
    },
    additionalInfo: {
      warranty: "24 miesiące",
      includesCharger: true,
    },
  },
  {
    id: 3,
    title: "Xiaomi 14 Ultra 512GB White",
    brand: "Xiaomi",
    model: "14 Ultra",
    price: 3299,
    originalPrice: 3699,
    location: "Gdańsk, Śródmieście",
    condition: "VERY_GOOD",
    images: [
      "https://dummyimage.com/600x700/f59e0b/fff&text=Xiaomi+14+Front",
      "https://dummyimage.com/600x700/f59e0b/fff&text=Xiaomi+14+Back",
    ],
    seller: "Anna K.",
    sellerPhone: "+48 555 123 456",
    sellerEmail: "anna.k@email.com",
    dateAdded: "2024-09-18",
    views: 534,
    likes: 34,
    description:
      "Xiaomi 14 Ultra w idealnym stanie. Używany 2 miesiące, bez uszkodzeń. Telefon zawsze w etui i z folią ochronną.",
    specifications: {
      brand: "Xiaomi",
      model: "14 Ultra",
      storage: "512GB",
      ram: "16GB",
      color: "White",
      batteryCapacity: "5300mAh",
      screenSize: '6.73"',
      cameraMP: "50MP",
      osType: "Android",
      osVersion: "14",
      frontCamera: "32MP",
      displayTech: "LTPO AMOLED",
      wifi: "Wi-Fi 7",
      bluetooth: "5.4",
      ipRating: "IP68",
      fastCharging: "90W",
      wirelessCharging: "50W",
      processor: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      screenResolution: "3200 x 1440",
      refreshRate: "120Hz",
    },
    additionalInfo: {
      warranty: "22 miesiące",
      includesCharger: true,
    },
  },
];

const SmartphoneDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetailedSpecs, setShowDetailedSpecs] = useState(false);
  const [sellerAds, setSellerAds] = useState<SmartphoneData[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Report states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCurrentUserEmail = () => {
    const token = localStorage.getItem("token");
    if (!token) return "";
    try {
      const decoded: any = jwtDecode(token);
      return decoded.sub || "";
    } catch (error) {
      return "";
    }
  };

  const isCurrentUserOwner = () => {
    const currentUserEmail = getCurrentUserEmail();
    return currentUserEmail && sellerInfo?.email === currentUserEmail;
  };

  useEffect(() => {
    const incrementViewCount = async () => {
      if (!id) return;

      try {
        await axios.post(`http://localhost:8080/api/advertisements/${id}/view`);
        console.log("View count incremented");
      } catch (error) {
        console.error("Error incrementing view count:", error);
      }
    };

    // Wywołaj tylko raz przy montowaniu komponentu
    incrementViewCount();
  }, [id]);

  const phone = smartphones.find((p) => p.id === parseInt(id || "0"));

  // Stan dla smartfona - dynamiczne pobieranie z API
  const [phoneData, setPhoneData] = useState<SmartphoneData | null>(
    phone || null
  );
  const [loading, setLoading] = useState(!phone);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych smartfona z API jeśli nie ma w statycznych danych
  useEffect(() => {
    console.log("🔵 useEffect triggered, id:", id);
    const fetchPhone = async () => {
      if (!id) {
        console.log("🔴 No ID provided");
        setError("Brak ID smartfona");
        setLoading(false);
        return;
      }

      // Zawsze pobieraj z API dla świeżych danych
      try {
        console.log("⏳ Starting fetch, setting loading=true");
        setLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost:8080/api/advertisements/${id}`
        );

        console.log("📡 Response status:", response.status);

        if (response.ok) {
          const ad = await response.json();
          console.log("API Response:", ad);
          console.log("Warranty from API:", ad.warranty);
          console.log("IncludesCharger from API:", ad.includesCharger);
          // Mapowanie danych z backendu na format frontend
          const mappedPhone: SmartphoneData = {
            id: ad.id,
            title: ad.title,
            brand: ad.specification?.brand || "",
            model: ad.specification?.model || "",
            price: ad.price,
            location: ad.location || "Brak lokalizacji",
            condition: ad.condition || "nowy",
            images:
              ad.imageUrls && ad.imageUrls.length > 0
                ? ad.imageUrls.map((u: string) => {
                    if (!u)
                      return "https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia";
                    // If the backend returned a relative path like "/uploads/images/.." or "/images/...",
                    // request it from the backend server instead of the Vite dev server.
                    if (u.startsWith("http")) return u;
                    if (u.startsWith("/")) return `http://localhost:8080${u}`;
                    return u;
                  })
                : ["https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia"],
            seller: ad.userName || "Użytkownik",
            sellerPhone: "Dostępny po zalogowaniu",
            sellerEmail: "Dostępny po zalogowaniu",
            dateAdded: ad.createdAt || ad.dateAdded,
            views: ad.viewCount || 0,
            likes: 0,
            description: ad.description,
            specifications: {
              brand: ad.specification?.brand || "",
              model: ad.specification?.model || "",
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
            additionalInfo: {
              warranty: ad.warranty || "Brak danych",
              includesCharger:
                ad.includesCharger !== undefined ? ad.includesCharger : false,
            },
          };
          console.log("Mapped additionalInfo:", mappedPhone.additionalInfo);
          console.log("✅ Setting phoneData:", mappedPhone.title);
          setPhoneData(mappedPhone);
        } else if (response.status === 404) {
          console.log("🔴 404 - Ad not found");
          setError("Smartphone nie istnieje");
        } else {
          console.log("🔴 Error response:", response.status);
          setError("Błąd podczas pobierania danych");
        }
      } catch (error) {
        console.error("🔴 Błąd podczas pobierania smartfona:", error);
        setError("Błąd połączenia z serwerem");
      } finally {
        console.log("✔️ Setting loading=false");
        setLoading(false);
      }
    };

    fetchPhone();
  }, [id]);

  // Pobieranie danych sprzedawcy
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!id) return;

      try {
        // Sprawdzenie czy użytkownik jest zalogowany
        const token = localStorage.getItem("token");

        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `http://localhost:8080/api/advertisements/${id}/seller`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          setSellerInfo(data);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych sprzedawcy:", error);
      }
    };

    const fetchSellerAds = async () => {
      if (!id) return;

      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Pobierz wszystkie ogłoszenia
        const adsResponse = await fetch(
          `http://localhost:8080/api/advertisements`,
          { headers }
        );

        if (adsResponse.ok) {
          const allAds = await adsResponse.json();
          console.log("All ads:", allAds);
          console.log("Current ad ID:", id);

          // Filtruj ogłoszenia - tylko aktywne i różne od bieżącego
          const activeAds = allAds.filter(
            (ad: any) => ad.id !== parseInt(id) && ad.status === "ACTIVE"
          );

          console.log("Active ads:", activeAds);

          // Wybierz 2 losowe ogłoszenia
          const shuffled = activeAds.sort(() => 0.5 - Math.random());
          const randomAds = shuffled.slice(0, 2);

          // Mapuj dane do formatu SmartphoneData
          const mappedAds = randomAds.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            brand: ad.specification?.brand || "",
            model: ad.specification?.model || "",
            price: ad.price,
            location: ad.location || "Brak lokalizacji",
            condition: ad.condition || "nowy",
            images:
              ad.imageUrls && ad.imageUrls.length > 0
                ? ad.imageUrls
                : ["https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia"],
            seller: ad.userName || "Użytkownik",
            sellerPhone: "Dostępny po zalogowaniu",
            sellerEmail: "Dostępny po zalogowaniu",
            dateAdded: ad.createdAt || ad.dateAdded,
            views: ad.viewCount || 0,
            likes: 0,
            description: ad.description,
            specifications: {
              brand: ad.specification?.brand || "",
              model: ad.specification?.model || "",
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
            additionalInfo: {
              warranty: ad.warranty || "Brak danych",
              includesCharger:
                ad.includesCharger !== undefined ? ad.includesCharger : false,
            },
          }));

          setSellerAds(mappedAds);
        }
      } catch (error) {
        console.error("Błąd podczas pobierania ogłoszeń:", error);
      }
    };

    fetchSellerInfo();
    fetchSellerAds();
  }, [id]);

  // Sprawdzenie czy ogłoszenie jest w ulubionych
  useEffect(() => {
    const checkIfFavorite = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;

      try {
        const response = await axios.get<FavoriteCheckResponse>(
          `http://localhost:8080/api/favorites/${id}/check`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && typeof response.data.isFavorite === "boolean") {
          setIsFavorite(response.data.isFavorite);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkIfFavorite();
    fetchFavoriteCount();
  }, [id]);

  const fetchFavoriteCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get<any[]>(
        "http://localhost:8080/api/favorites",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteCount(response.data.length);
    } catch (error) {
      console.error("Error fetching favorite count:", error);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to reviews section if hash is #opinie
  useEffect(() => {
    if (window.location.hash === "#opinie") {
      // Delay scroll to ensure DOM is fully loaded
      const timer = setTimeout(() => {
        const opinieSection = document.getElementById("opinie");
        if (opinieSection) {
          opinieSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [id]); // Re-run when id changes

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
  const token = localStorage.getItem("token");

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Pokazuj loading podczas pobierania danych
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Ładowanie...
          </h2>
          <p className="text-gray-600">Pobieramy szczegóły ogłoszenia...</p>
        </div>
      </div>
    );
  }

  // Pokazuj błąd tylko jeśli nie ma phoneData i nie ma loading
  if (!loading && (!phoneData || error)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Smartfon nie znaleziony
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Podane ogłoszenie nie istnieje lub zostało usunięte."}
          </p>
          <button
            onClick={() => navigate("/smartfony")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Powrót do katalogu
          </button>
        </div>
      </div>
    );
  }

  const handleContactSeller = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Sprawdź czy użytkownik nie próbuje wysłać wiadomości do samego siebie
    if (isCurrentUserOwner()) {
      alert("Nie możesz wysłać wiadomości do samego siebie");
      return;
    }

    if (phoneData && sellerInfo?.email && id) {
      navigate(
        `/user/message?adId=${id}&seller=${encodeURIComponent(
          sellerInfo.email
        )}`
      );
    }
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`http://localhost:8080/api/favorites/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFavorite(false);
        alert("Usunięto z ulubionych");
      } else {
        await axios.post(
          `http://localhost:8080/api/favorites/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsFavorite(true);
        alert("Dodano do ulubionych");
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Wystąpił błąd. Spróbuj ponownie.");
      }
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = phoneData?.title || "Ogłoszenie na MobliX";

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Sprawdź to ogłoszenie: ${title}`,
          url: url,
        });
      } catch (error) {
        console.log("Udostępnianie anulowane", error);
      }
    } else {
      // Fallback - kopiuj link
      try {
        await navigator.clipboard.writeText(url);
        alert("Link skopiowany do schowka!");
      } catch (error) {
        console.error("Błąd kopiowania:", error);
        alert("Nie można skopiować linku");
      }
    }
  };

  // Report handlers
  const handleSubmitReport = async () => {
    if (!token) {
      alert("Musisz być zalogowany, aby zgłosić problem");
      return;
    }

    if (!reportForm.reason || !reportForm.description.trim()) {
      alert("Proszę wypełnić wszystkie pola");
      return;
    }

    try {
      // Map frontend reason values to backend enum
      const reasonMap: { [key: string]: string } = {
        fraud: "FRAUD",
        spam: "SPAM",
        inappropriate: "INAPPROPRIATE",
        duplicate: "DUPLICATE",
        fake_seller: "FAKE_SELLER",
        other: "OTHER",
      };

      const response = await axios.post(
        `http://localhost:8080/api/reports/${id}`,
        {
          reason: reasonMap[reportForm.reason],
          comment: reportForm.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Zgłoszenie zostało wysłane. Dziękujemy za informację.");
        setReportForm({ reason: "", description: "" });
        setShowReportForm(false);
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert(
          error.response.data || "Nie można wysłać zgłoszenia. Sprawdź dane."
        );
      } else if (error.response?.data) {
        alert(error.response.data);
      } else {
        alert("Wystąpił błąd podczas wysyłania zgłoszenia. Spróbuj ponownie.");
      }
      console.error("Error submitting report:", error);
    }
  };

  console.log(
    "🎨 Rendering - loading:",
    loading,
    "error:",
    error,
    "phoneData:",
    phoneData ? phoneData.title : null
  );

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
              e.preventDefault();
              if (searchQuery.trim())
                navigate(`/smartfony?search=${searchQuery.trim()}`);
              else navigate("/smartfony");
            }}
            className="flex-1 max-w-2xl"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj smartfonów..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

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
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {favoriteCount > 9 ? "9+" : favoriteCount}
                </span>
              )}
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
                      className="w-full text-left px-4 py-2 bg-black-600 hover:bg-black flex items-center gap-3 text-white rounded-lg"
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

      {/* Główna zawartość */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">
                Ładowanie danych ogłoszenia...
              </p>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Błąd</h2>
              <p className="text-gray-200 text-lg">{error}</p>
              <button
                onClick={() => navigate("/smartfony")}
                className="mt-4 px-6 py-2 bg-white text-purple-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Powrót do katalogu
              </button>
            </div>
          )}

          {!loading && !error && phoneData && (
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 md:gap-6">
              {/* Lewa kolumna - Zdjęcia */}
              <div className="space-y-4">
                {/* Główne zdjęcie */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700">
                  <img
                    src={phoneData.images[currentImageIndex]}
                    alt={phoneData.title}
                    className="w-full h-[400px] md:h-[500px] object-contain p-4"
                  />
                </div>

                {/* Miniaturki - max 6 zdjęć */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {phoneData.images.slice(0, 6).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative border-2 rounded-lg overflow-hidden aspect-square bg-purple-900/30 backdrop-blur-sm shadow-md ${
                        currentImageIndex === index
                          ? "border-purple-400 ring-2 ring-purple-300"
                          : "border-gray-700"
                      } hover:border-purple-400 transition-all`}
                    >
                      <img
                        src={image}
                        alt={`${phoneData.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Opis */}
                <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Opis</h3>
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {phoneData.description}
                  </p>
                </div>

                {/* Specyfikacja podstawowa */}
                <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-300" />
                    Specyfikacja
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Marka</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.brand || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Model</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.model || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Kolor</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.color || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">System operacyjny</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.osType || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Wersja systemu</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.osVersion || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Pamięć wewnętrzna</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.storage || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Pamięć RAM</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.ram || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Aparat główny (MP)</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.cameraMP || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-700">
                      <span className="text-gray-400">Aparat przedni (MP)</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.frontCamera || "Brak danych"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Pojemność baterii</span>
                      <span className="text-white font-semibold">
                        {phoneData.specifications.batteryCapacity ||
                          "Brak danych"}
                      </span>
                    </div>
                  </div>

                  {/* Przycisk rozwijania specyfikacji szczegółowej */}
                  <button
                    onClick={() => setShowDetailedSpecs(!showDetailedSpecs)}
                    className="w-full mt-4 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>
                      {showDetailedSpecs ? "Ukryj" : "Pokaż"} specyfikację
                      szczegółową
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        showDetailedSpecs ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Specyfikacja szczegółowa - rozwijana */}
                  {showDetailedSpecs && (
                    <div className="mt-4 space-y-2 text-sm border-t border-gray-700 pt-4">
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Przekątna ekranu</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.screenSize || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Technologia</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.displayTech ||
                            "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Wi-Fi</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.wifi || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Bluetooth</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.bluetooth || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Odporność</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.ipRating || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Ładowanie przewodowe
                        </span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.fastCharging ||
                            "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Ładowanie bezprzewodowe
                        </span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.wirelessCharging ||
                            "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Procesor</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.processor || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Karta graficzna</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.gpu || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Rozdzielczość</span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.screenResolution ||
                            "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">
                          Częstotliwość odświeżania (Hz)
                        </span>
                        <span className="text-white font-semibold">
                          {phoneData.specifications.refreshRate ||
                            "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Stan urządzenia</span>
                        <span className="text-white font-semibold">
                          {phoneData?.condition === "NEW" && "Nowy"}
                          {phoneData?.condition === "LIKE_NEW" && "Jak nowy"}
                          {phoneData?.condition === "VERY_GOOD" &&
                            "Bardzo dobry"}
                          {phoneData?.condition === "GOOD" && "Dobry"}
                          {phoneData?.condition === "ACCEPTABLE" &&
                            "Zadowalający"}
                          {!phoneData?.condition && "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Gwarancja</span>
                        <span className="text-white font-semibold">
                          {phoneData.additionalInfo?.warranty || "Brak danych"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">
                          Ładowarka z kablem w zestawie
                        </span>
                        <span className="text-white font-semibold">
                          {phoneData.additionalInfo?.includesCharger ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-4 h-4" /> Tak
                            </span>
                          ) : (
                            <span className="text-red-600">Nie</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Przycisk zgłoszenia na pełną szerokość */}
                <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
                  <button
                    onClick={() => setShowReportForm(!showReportForm)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Zgłoś ogłoszenie
                  </button>

                  {showReportForm && token && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-4 text-white">
                        Zgłoś problem z tym ogłoszeniem
                      </h4>

                      {/* Reason */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Powód zgłoszenia
                        </label>
                        <select
                          value={reportForm.reason}
                          onChange={(e) => {
                            setReportForm({
                              ...reportForm,
                              reason: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Wybierz powód</option>
                          <option value="fraud">
                            Oszustwo / fałszywe ogłoszenie
                          </option>
                          <option value="spam">Spam / treści promocyjne</option>
                          <option value="inappropriate">
                            Nieodpowiednie treści
                          </option>
                          <option value="duplicate">Duplikat ogłoszenia</option>
                          <option value="fake_seller">
                            Podejrzany sprzedawca
                          </option>
                          <option value="other">Inne</option>
                        </select>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Opis problemu
                        </label>
                        <textarea
                          value={reportForm.description}
                          onChange={(e) => {
                            setReportForm({
                              ...reportForm,
                              description: e.target.value,
                            });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          rows={4}
                          placeholder="Opisz szczegółowo problem z tym ogłoszeniem..."
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmitReport}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Wyślij zgłoszenie
                        </button>
                        <button
                          onClick={() => {
                            setShowReportForm(false);
                            setReportForm({ reason: "", description: "" });
                          }}
                          className="bg-purple-600/50 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
                        >
                          Anuluj
                        </button>
                      </div>
                    </div>
                  )}

                  {!token && (
                    <p className="text-purple-400 text-sm mt-4 flex items-center">
                      <LogIn className="w-4 h-4 inline mr-2" />
                      Zaloguj się, aby zgłosić problem z tym ogłoszeniem
                    </p>
                  )}

                  {/* Safety Notice */}
                  <div className="mt-6 bg-gray-700 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-white mb-1">
                          Zasady bezpieczeństwa
                        </h4>
                        <p className="text-sm text-gray-400">
                          Zawsze sprawdź telefon przed zakupem. Spotkaj się w
                          publicznym miejscu. Nie przekazuj pieniędzy przed
                          sprawdzeniem urządzenia.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Tytuł, cena, status */}
                <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-4">
                    {phoneData?.title}
                  </h1>
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-4">
                    {phoneData?.price.toLocaleString()} zł
                  </div>
                  <div className="flex items-center gap-2 md:gap-4 text-gray-400 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="text-sm">
                        <>
                          {phoneData?.condition === "NEW" && "Nowy"}
                          {phoneData?.condition === "LIKE_NEW" && "Jak nowy"}
                          {phoneData?.condition === "VERY_GOOD" &&
                            "Bardzo dobry"}
                          {phoneData?.condition === "GOOD" && "Dobry"}
                          {phoneData?.condition === "ACCEPTABLE" &&
                            "Zadowalający"}
                        </>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{phoneData?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">
                        {phoneData?.views} wyświetleń
                      </span>
                    </div>
                  </div>

                  {/* Przyciski ulubione i udostępnij */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex-1 ${
                        isFavorite
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-700 hover:bg-gray-600"
                      } text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-white" : ""}`}
                      />
                      <span className="text-sm">
                        {isFavorite ? "Ulubione" : "Dodaj"}
                      </span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Udostępnij</span>
                    </button>
                  </div>
                </div>

                {/* Informacje o sprzedawcy */}
                {sellerInfo && (
                  <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-xl border border-gray-700">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                      {sellerInfo.sellerType === "BUSINESS" ? (
                        <Building2 className="w-5 h-5 text-blue-400" />
                      ) : (
                        <User className="w-5 h-5 text-purple-400" />
                      )}
                      Sprzedawca
                    </h3>
                    <div className="space-y-3 text-gray-400">
                      <div>
                        <p className="font-semibold text-white text-lg">
                          {sellerInfo.sellerType === "BUSINESS" &&
                          sellerInfo.companyName
                            ? sellerInfo.companyName
                            : sellerInfo.name}
                        </p>
                        {sellerInfo.sellerType === "BUSINESS" &&
                          sellerInfo.name && (
                            <p className="text-sm text-gray-400 mt-1">
                              Przedstawiciel: {sellerInfo.name}
                            </p>
                          )}
                        <p className="text-sm text-gray-400 mt-1">
                          {sellerInfo.sellerType === "BUSINESS"
                            ? "Sprzedawca firmowy"
                            : "Sprzedawca prywatny"}
                        </p>
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-400">
                          Na Moblix od {sellerInfo.yearJoined}
                        </p>
                      </div>

                      {/* Dane kontaktowe */}
                      {token && (
                        <div className="border-t border-gray-700 pt-3 space-y-2">
                          {sellerInfo.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <a
                                href={`mailto:${sellerInfo.email}`}
                                className="text-purple-400 hover:underline"
                              >
                                {sellerInfo.email}
                              </a>
                            </div>
                          )}
                          {sellerInfo.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <a
                                href={`tel:${sellerInfo.phone}`}
                                className="text-purple-400 hover:underline"
                              >
                                {sellerInfo.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dane firmowe - tylko dla firm */}
                      {sellerInfo.sellerType === "BUSINESS" && (
                        <div className="border-t border-gray-700 pt-3 space-y-2 text-sm">
                          {sellerInfo.nip && (
                            <div className="flex items-start gap-2">
                              <Hash className="w-4 h-4 text-purple-300 mt-0.5" />
                              <div>
                                <span className="text-gray-400">NIP: </span>
                                <span className="text-white font-medium">
                                  {sellerInfo.nip}
                                </span>
                              </div>
                            </div>
                          )}
                          {sellerInfo.regon && (
                            <div className="flex items-start gap-2">
                              <Hash className="w-4 h-4 text-purple-300 mt-0.5" />
                              <div>
                                <span className="text-gray-400">REGON: </span>
                                <span className="text-white font-medium">
                                  {sellerInfo.regon}
                                </span>
                              </div>
                            </div>
                          )}
                          {sellerInfo.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                              <div>
                                <span className="text-gray-400">Adres: </span>
                                <span className="text-white font-medium">
                                  {sellerInfo.address}
                                </span>
                              </div>
                            </div>
                          )}
                          {sellerInfo.website && (
                            <div className="flex items-start gap-2">
                              <Globe className="w-4 h-4 text-gray-500 mt-0.5" />
                              <a
                                href={sellerInfo.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline font-medium"
                              >
                                {sellerInfo.website}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {!token && (
                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 mt-3">
                          <p className="text-sm text-purple-400 flex items-center gap-2 font-medium">
                            <LogIn className="w-4 h-4" />
                            Zaloguj się, aby zobaczyć dane kontaktowe
                          </p>
                        </div>
                      )}

                      {!isCurrentUserOwner() && (
                        <button
                          onClick={handleContactSeller}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-3"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Wyślij wiadomość
                        </button>
                      )}
                      {isCurrentUserOwner() && (
                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 mt-3">
                          <p className="text-sm text-gray-400 text-center font-medium">
                            To jest Twoje ogłoszenie
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Inne przykładowe ogłoszenia */}
                <div className="bg-gray-800 rounded-lg p-6 md:p-8 shadow-xl border border-gray-700 mt-40 relative top-32 min-h-[600px] max-w-4xl mx-auto">
                  <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-xl">
                    <ShoppingBag className="w-6 h-6 text-purple-300" />
                    Inne przykładowe ogłoszenia na tej stronie
                  </h3>
                  {sellerAds.length > 0 ? (
                    <div className="space-y-6">
                      {sellerAds.map((ad) => (
                        <div
                          key={ad.id}
                          onClick={() => navigate(`/smartfon/${ad.id}`)}
                          className="flex gap-6 p-6 bg-gray-700/50 hover:bg-gray-700 rounded-xl cursor-pointer transition-colors border-2 border-gray-600 hover:border-purple-500"
                        >
                          <img
                            src={ad.images[0]}
                            alt={ad.title}
                            className="w-40 h-40 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium text-xl truncate mb-3">
                              {ad.title}
                            </h4>
                            <p className="text-purple-400 font-bold text-2xl mb-3">
                              {ad.price.toLocaleString()} zł
                            </p>
                            <div className="flex items-center gap-2 text-gray-400 text-base">
                              <MapPin className="w-5 h-5" />
                              <span>{ad.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Brak innych ogłoszeń
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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

export default SmartphoneDetails;
