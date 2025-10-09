import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  User,
  ChevronDown,
  LogOut,
  ShoppingBag,
  MessageSquare,
  Star,
  Shield,
  Users,
  MapPin,
  Calendar,
  Smartphone,
  Heart,
  Eye,
  Share2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Package,
  Monitor,
  Battery,
  Camera,
  HardDrive,
  Palette,
  Check,
  LogIn,
  Wifi,
  Bluetooth,
  Building2,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

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

interface Review {
  id: number;
  userId: number;
  advertisementId: number;
  advertisementTitle?: string; // Opcjonalne, bo nie zawsze jest potrzebne
  advertisementStatus?: string; // Status ogłoszenia
  userName: string; // email użytkownika
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Report {
  id: number;
  userId: number;
  userName: string;
  reason: string;
  description: string;
  dateReported: string;
  status: "pending" | "reviewed" | "resolved";
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
  const [searchParams] = useSearchParams();
  const reviewId = searchParams.get("reviewId");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // Edit review states
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editReviewData, setEditReviewData] = useState({
    rating: 5,
    comment: "",
    advertisementId: 0,
  });

  // Report states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    reason: "",
    description: "",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to specific review if reviewId is provided
  useEffect(() => {
    if (reviewId) {
      const timer = setTimeout(() => {
        const reviewElement = document.getElementById(`review-${reviewId}`);
        if (reviewElement) {
          reviewElement.scrollIntoView({ behavior: "smooth", block: "center" });
          // Add highlight effect
          reviewElement.style.backgroundColor = "#fef3c7";
          setTimeout(() => {
            reviewElement.style.backgroundColor = "";
          }, 3000);
        }
      }, 500); // Wait for component to fully render

      return () => clearTimeout(timer);
    }
  }, [reviewId, reviews]);

  const phone = smartphones.find((p) => p.id === parseInt(id || "0"));

  // Stan dla smartfona - dynamiczne pobieranie z API
  const [phoneData, setPhoneData] = useState<SmartphoneData | null>(
    phone || null
  );
  const [loading, setLoading] = useState(!phone);
  const [error, setError] = useState<string | null>(null);

  // Pobieranie danych smartfona z API jeśli nie ma w statycznych danych
  useEffect(() => {
    const fetchPhone = async () => {
      if (phone) {
        setPhoneData(phone);
        return; // Jeśli jest w statycznych danych, użyj ich
      }

      if (!id) {
        setError("Brak ID smartfona");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/advertisements/${id}`
        );

        if (response.ok) {
          const ad = await response.json();
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
                ? ad.imageUrls
                : ["https://dummyimage.com/400x500/ccc/fff&text=Brak+zdjęcia"],
            seller: ad.userName || "Użytkownik",
            sellerPhone: "Dostępny po zalogowaniu",
            sellerEmail: "Dostępny po zalogowaniu",
            dateAdded: ad.createdAt || ad.dateAdded,
            views: 0,
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
              warranty: ad.warranty || "",
              includesCharger: ad.includesCharger || false,
            },
          };
          setPhoneData(mappedPhone);
        } else if (response.status === 404) {
          setError("Smartphone nie istnieje");
        } else {
          setError("Błąd podczas pobierania danych");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania smartfona:", error);
        setError("Błąd połączenia z serwerem");
      } finally {
        setLoading(false);
      }
    };

    fetchPhone();
  }, [id, phone]);

  // Pobieranie opinii dla ogłoszenia
  useEffect(() => {
    if (phoneData?.id) {
      fetchOpinions(phoneData.id);
    }
  }, [phoneData?.id]);

  // Pobieranie danych sprzedawcy
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!id) return;

      try {
        // Sprawdzenie czy użytkownik jest zalogowany
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);

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

    fetchSellerInfo();
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

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "NEW":
      case "nowy":
        return "bg-green-100 text-green-800";
      case "LIKE_NEW":
        return "bg-emerald-100 text-emerald-800";
      case "VERY_GOOD":
        return "bg-blue-100 text-blue-800";
      case "GOOD":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTABLE":
        return "bg-orange-100 text-orange-800";
      case "używany":
        return "bg-blue-100 text-blue-800";
      case "uszkodzony":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case "NEW":
        return "Nowy";
      case "LIKE_NEW":
        return "Jak nowy";
      case "VERY_GOOD":
        return "Bardzo dobry";
      case "GOOD":
        return "Dobry";
      case "ACCEPTABLE":
        return "Zadowalający";
      case "nowy":
        return "Nowy";
      case "używany":
        return "Używany";
      case "uszkodzony":
        return "Uszkodzony";
      default:
        return condition;
    }
  };

  const handlePrevImage = () => {
    if (phoneData) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? phoneData.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (phoneData) {
      setCurrentImageIndex((prev) =>
        prev === phoneData.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleContactSeller = () => {
    if (phoneData) {
      navigate(
        `/user/message?seller=${encodeURIComponent(
          phoneData.seller
        )}&product=${encodeURIComponent(phoneData.title)}`
      );
    }
  };

  // Fetch opinions for advertisement
  const fetchOpinions = async (advertisementId: number) => {
    try {
      console.log(`Fetching opinions for advertisement ${advertisementId}...`);
      const response = await axios.get<Review[]>(
        `http://localhost:8080/api/opinions/advertisement/${advertisementId}`
      );
      console.log(`Received ${response.data.length} opinions:`, response.data);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching opinions:", error);
    }
  };

  // Review handlers
  const handleAddReview = async () => {
    if (!token) {
      alert("Musisz być zalogowany, aby dodać opinię");
      return;
    }

    if (!newReview.comment.trim() || newReview.comment.trim().length < 10) {
      setReviewError("Komentarz musi mieć co najmniej 10 znaków");
      return;
    }

    try {
      setReviewError(null);
      const response = await axios.post(
        "http://localhost:8080/api/opinions",
        {
          advertisementId: phoneData?.id,
          rating: newReview.rating,
          comment: newReview.comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviewSuccess(
        "Opinia została dodana i oczekuje na moderację. Zostanie wyświetlona po zatwierdzeniu przez administratora."
      );
      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);

      // Clear success message after 5 seconds
      setTimeout(() => setReviewSuccess(null), 5000);
    } catch (error: any) {
      if (error.response?.data) {
        setReviewError(error.response.data);
      } else {
        setReviewError("Nie udało się dodać opinii. Spróbuj ponownie.");
      }
    }
  };

  // Start editing review
  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditReviewData({
      rating: review.rating,
      comment: review.comment,
      advertisementId: review.advertisementId,
    });
    setReviewError(null);
    setReviewSuccess(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditReviewData({ rating: 5, comment: "", advertisementId: 0 });
    setReviewError(null);
  };

  // Submit edited review
  const handleEditReview = async (reviewId: number) => {
    if (!token) {
      alert("Musisz być zalogowany, aby edytować opinię");
      return;
    }

    if (
      !editReviewData.comment.trim() ||
      editReviewData.comment.trim().length < 10
    ) {
      setReviewError("Komentarz musi mieć co najmniej 10 znaków");
      return;
    }

    try {
      setReviewError(null);
      await axios.put(
        `http://localhost:8080/api/opinions/${reviewId}`,
        {
          rating: editReviewData.rating,
          comment: editReviewData.comment.trim(),
          advertisementId: editReviewData.advertisementId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviewSuccess(
        "Opinia została zaktualizowana i oczekuje na ponowną moderację."
      );
      setEditingReviewId(null);
      setEditReviewData({ rating: 5, comment: "", advertisementId: 0 });

      // Refresh opinions
      if (phoneData) {
        await fetchOpinions(phoneData.id);
      }

      // Clear success message after 5 seconds
      setTimeout(() => setReviewSuccess(null), 5000);
    } catch (error: any) {
      if (error.response?.data) {
        setReviewError(error.response.data);
      } else {
        setReviewError("Nie udało się zaktualizować opinii. Spróbuj ponownie.");
      }
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: number) => {
    if (!token) {
      alert("Musisz być zalogowany, aby usunąć opinię");
      return;
    }

    if (!window.confirm("Czy na pewno chcesz usunąć tę opinię?")) {
      return;
    }

    try {
      setReviewError(null);
      await axios.delete(`http://localhost:8080/api/opinions/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviewSuccess("Opinia została usunięta");

      // Refresh opinions
      if (phoneData) {
        await fetchOpinions(phoneData.id);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setReviewSuccess(null), 3000);
    } catch (error: any) {
      if (error.response?.data) {
        setReviewError(error.response.data);
      } else {
        setReviewError("Nie udało się usunąć opinii. Spróbuj ponownie.");
      }
    }
  };

  // Check if current user is owner of the review
  const isReviewOwner = (review: Review): boolean => {
    if (!token) return false;
    try {
      const decoded: any = jwtDecode(token);
      const userEmail = decoded.sub;
      return review.userName === userEmail;
    } catch (error) {
      return false;
    }
  };

  // Report handlers
  const handleSubmitReport = () => {
    if (!token) {
      alert("Musisz być zalogowany, aby zgłosić problem");
      return;
    }

    if (reportForm.reason && reportForm.description.trim()) {
      // W prawdziwej aplikacji wysłalibyśmy to do API
      alert("Zgłoszenie zostało wysłane. Dziękujemy za informację.");
      setReportForm({ reason: "", description: "" });
      setShowReportForm(false);
    } else {
      alert("Proszę wypełnić wszystkie pola");
    }
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden bg-white">
      {/* Header */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full bg-white">
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
                  {token ? (
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
                        className="dropdown-logout flex items-center gap-3 px-4 py-2"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <button
                      className="dropdown-logout w-full text-left flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn className="w-4 h-4 text-green-600" />
                      Zaloguj się
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-32 pb-12 max-w-7xl">
          {loading && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p>Ładowanie danych ogłoszenia...</p>
            </div>
          )}

          {error && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Błąd</h2>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={() => navigate("/smartfony")}
                className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Powrót do katalogu
              </button>
            </div>
          )}

          {!loading && !error && phoneData && (
            <div
              className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full overflow-y-auto"
              style={{
                maxHeight: "calc(100vh - 200px)",
                scrollbarWidth: "thin",
                scrollbarColor: "#8B5CF6 #F3F4F6",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Images Section */}
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={phoneData.images[currentImageIndex]}
                      alt={phoneData.title}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    {phoneData.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full shadow-md hover:bg-opacity-100 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm">
                          {currentImageIndex + 1} / {phoneData.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {phoneData.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {phoneData.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index
                              ? "border-purple-600"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${phoneData.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Opis</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {phoneData.description}
                    </p>
                  </div>
                </div>

                {/* Details Section */}
                <div className="space-y-6">
                  {/* Title and Price */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-1">
                        {phoneData.title}
                      </h1>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setIsLiked(!isLiked)}
                          className={`p-2 rounded-full transition-colors ${
                            isLiked
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              isLiked ? "fill-current" : ""
                            }`}
                          />
                        </button>
                        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${getConditionColor(
                          phoneData.condition
                        )}`}
                      >
                        {getConditionLabel(phoneData.condition)}
                      </span>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">
                          {phoneData.views} wyświetleń
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      {phoneData.originalPrice && (
                        <span className="text-xl text-gray-500 line-through">
                          {phoneData.originalPrice.toLocaleString()} zł
                        </span>
                      )}
                      <span className="text-3xl font-bold text-gray-900">
                        {phoneData.price.toLocaleString()} zł
                      </span>
                      {phoneData.originalPrice && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          -
                          {Math.round(
                            (1 - phoneData.price / phoneData.originalPrice) *
                              100
                          )}
                          %
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {phoneData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(phoneData.dateAdded).toLocaleDateString(
                          "pl-PL"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Section - Informacje o sprzedawcy */}
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      {sellerInfo?.sellerType === "business" ? (
                        <Building2 className="w-5 h-5 text-purple-600" />
                      ) : (
                        <User className="w-5 h-5 text-purple-600" />
                      )}
                      Sprzedawca
                    </h3>

                    {sellerInfo ? (
                      <div className="space-y-3">
                        {/* Nazwa sprzedawcy */}
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {sellerInfo.sellerType === "business" &&
                            sellerInfo.companyName
                              ? sellerInfo.companyName
                              : sellerInfo.name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" />
                            Sprzedający od {sellerInfo.yearJoined}
                          </p>
                        </div>

                        {/* Dane firmowe - tylko dla firm */}
                        {sellerInfo.sellerType === "business" && (
                          <div className="border-t border-gray-200 pt-3 space-y-2">
                            {sellerInfo.address && (
                              <div className="text-sm">
                                <span className="text-gray-600">Adres: </span>
                                <span className="text-gray-900">
                                  {sellerInfo.address}
                                </span>
                              </div>
                            )}
                            {sellerInfo.nip && (
                              <div className="text-sm">
                                <span className="text-gray-600">NIP: </span>
                                <span className="text-gray-900">
                                  {sellerInfo.nip}
                                </span>
                              </div>
                            )}
                            {sellerInfo.regon && (
                              <div className="text-sm">
                                <span className="text-gray-600">REGON: </span>
                                <span className="text-gray-900">
                                  {sellerInfo.regon}
                                </span>
                              </div>
                            )}
                            {sellerInfo.website && (
                              <div className="text-sm">
                                <span className="text-gray-600">Strona: </span>
                                <a
                                  href={sellerInfo.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline"
                                >
                                  {sellerInfo.website}
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Kontakt - tylko dla zalogowanych */}
                        {isLoggedIn &&
                        (sellerInfo.phone || sellerInfo.email) ? (
                          <div className="border-t border-gray-200 pt-3 space-y-2">
                            {sellerInfo.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-600" />
                                <a
                                  href={`tel:${sellerInfo.phone}`}
                                  className="text-purple-600 hover:underline"
                                >
                                  {sellerInfo.phone}
                                </a>
                              </div>
                            )}
                            {sellerInfo.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-600" />
                                <a
                                  href={`mailto:${sellerInfo.email}`}
                                  className="text-purple-600 hover:underline"
                                >
                                  {sellerInfo.email}
                                </a>
                              </div>
                            )}
                          </div>
                        ) : !isLoggedIn ? (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
                            <p className="text-sm text-purple-800 flex items-center gap-2">
                              <LogIn className="w-4 h-4" />
                              Zaloguj się, aby zobaczyć dane kontaktowe
                            </p>
                          </div>
                        ) : null}

                        {/* Przycisk wiadomości */}
                        <button
                          onClick={handleContactSeller}
                          className="w-full mt-3 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Napisz wiadomość
                        </button>
                      </div>
                    ) : (
                      // Fallback jeśli nie ma danych sprzedawcy
                      <div>
                        <p className="font-medium text-gray-900 mb-2">
                          {phoneData.seller}
                        </p>
                        <button
                          onClick={handleContactSeller}
                          className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Napisz wiadomość
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Basic Specifications */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      Specyfikacja podstawowa
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Marka i Model */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Marka:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.brand}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Model:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.model}
                        </span>
                      </div>

                      {/* Kolor */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Palette className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Kolor:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.color}
                        </span>
                      </div>

                      {/* System operacyjny */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Smartphone className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">System:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.osType || "Brak danych"}{" "}
                          {phoneData.specifications.osVersion || ""}
                        </span>
                      </div>

                      {/* Pamięć */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <HardDrive className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Pamięć:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.storage}
                        </span>
                      </div>

                      {/* RAM */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">RAM:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.ram}
                        </span>
                      </div>

                      {/* Aparat główny */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Camera className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Aparat:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.cameraMP}
                        </span>
                      </div>

                      {/* Aparat przedni */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Camera className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Przedni:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.frontCamera ||
                            "Brak danych"}
                        </span>
                      </div>

                      {/* Bateria */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-20">
                          <Battery className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Bateria:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.batteryCapacity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Specifications */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-gray-600" />
                      Specyfikacja szczegółowa
                    </h3>
                    <div className="space-y-3">
                      {/* Procesor */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <HardDrive className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Procesor:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.processor || "Brak danych"}
                        </span>
                      </div>

                      {/* GPU */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <HardDrive className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">GPU:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.gpu || "Brak danych"}
                        </span>
                      </div>

                      {/* Ekran */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Ekran:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.screenSize || "Brak danych"}
                        </span>
                      </div>

                      {/* Technologia wyświetlacza */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Technologia:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.displayTech ||
                            "Brak danych"}
                        </span>
                      </div>

                      {/* Rozdzielczość */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Rozdzielczość:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.screenResolution ||
                            "Brak danych"}
                        </span>
                      </div>

                      {/* Częstotliwość odświeżania */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Odświeżanie:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.refreshRate ||
                            "Brak danych"}
                        </span>
                      </div>

                      {/* Wi-Fi */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Wifi className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Wi-Fi:</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.wifi || "Brak danych"}
                        </span>
                      </div>

                      {/* Bluetooth */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Bluetooth className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Bluetooth:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.bluetooth || "Brak danych"}
                        </span>
                      </div>

                      {/* Odporność */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Odporność:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.ipRating || "Brak danych"}
                        </span>
                      </div>

                      {/* Ładowanie przewodowe */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Ładowanie przewodowe:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.fastCharging ||
                            "Brak danych"}
                        </span>
                      </div>

                      {/* Ładowanie bezprzewodowe */}
                      <div className="flex items-center">
                        <div className="flex items-center gap-2 w-48">
                          <Monitor className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Ładowanie bezprzewodowe:
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.specifications.wirelessCharging ||
                            "Brak danych"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Dodatkowe informacje
                    </h3>
                    <div className="space-y-3">
                      {/* Stan urządzenia */}
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          Stan urządzenia:
                        </span>
                        <span
                          className={`text-sm font-medium px-2 py-0.5 rounded ${getConditionColor(
                            phoneData.condition
                          )}`}
                        >
                          {getConditionLabel(phoneData.condition)}
                        </span>
                      </div>

                      {/* Gwarancja */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          Gwarancja:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {phoneData.additionalInfo.warranty || "Brak danych"}
                        </span>
                      </div>

                      {/* W zestawie */}
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">W zestawie:</div>
                        <div className="flex flex-wrap gap-2">
                          {phoneData.additionalInfo.includesCharger ? (
                            <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              <Check className="w-3 h-3" /> Ładowarka z kablem
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Tylko telefon
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div id="opinie" className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900">
                    Opinie ({reviews.length})
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => phoneData && fetchOpinions(phoneData.id)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                      title="Odśwież listę opinii"
                    >
                      <Clock className="w-4 h-4" />
                      Odśwież
                    </button>
                    {token && (
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Dodaj opinię
                      </button>
                    )}
                  </div>
                </div>

                {/* Success/Error Messages */}
                {reviewSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{reviewSuccess}</p>
                  </div>
                )}
                {reviewError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{reviewError}</p>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && token && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-4">Dodaj swoją opinię</h4>

                    {/* Rating */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ocena
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Star
                            key={rating}
                            className={`w-6 h-6 cursor-pointer ${
                              rating <= newReview.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                            onClick={() =>
                              setNewReview({ ...newReview, rating })
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Komentarz (minimum 10 znaków)
                      </label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Podziel się swoją opinią o tym smartfonie..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newReview.comment.length} / 1000 znaków
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddReview}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Dodaj opinię
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setNewReview({ rating: 5, comment: "" });
                          setReviewError(null);
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Brak opinii. Bądź pierwszym, który podzieli się opinią!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        id={`review-${review.id}`}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        {/* Check if this review is being edited */}
                        {editingReviewId === review.id ? (
                          // Edit Form
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">
                              Edytuj opinię
                            </h4>

                            {/* Rating */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ocena
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                  <Star
                                    key={rating}
                                    className={`w-6 h-6 cursor-pointer ${
                                      rating <= editReviewData.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                    onClick={() =>
                                      setEditReviewData({
                                        ...editReviewData,
                                        rating,
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Comment */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Komentarz (minimum 10 znaków)
                              </label>
                              <textarea
                                value={editReviewData.comment}
                                onChange={(e) =>
                                  setEditReviewData({
                                    ...editReviewData,
                                    comment: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={4}
                                placeholder="Podziel się swoją opinią..."
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {editReviewData.comment.length} / 1000 znaków
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditReview(review.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Zapisz zmiany
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                              >
                                Anuluj
                              </button>
                            </div>

                            <p className="text-xs text-orange-600 mt-2">
                              ⚠️ Po edycji opinia będzie wymagała ponownej
                              moderacji przez administratora
                            </p>
                          </div>
                        ) : (
                          // Display Review
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <span className="font-medium text-gray-900">
                                  {review.userName}
                                </span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString("pl-PL")}
                                </span>

                                {/* Edit/Delete buttons - only for review owner */}
                                {token && isReviewOwner(review) && (
                                  <div className="flex gap-1 ml-2">
                                    <button
                                      onClick={() => handleStartEdit(review)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Edytuj opinię"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReview(review.id)
                                      }
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                      title="Usuń opinię"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Report Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Zgłoś problem</h3>
                  {token && (
                    <button
                      onClick={() => setShowReportForm(!showReportForm)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Zgłoś
                    </button>
                  )}
                </div>

                {/* Report Form */}
                {showReportForm && token && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium mb-4 text-red-800">
                      Zgłoś problem z tym ogłoszeniem
                    </h4>

                    {/* Reason */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Powód zgłoszenia
                      </label>
                      <select
                        value={reportForm.reason}
                        onChange={(e) =>
                          setReportForm({
                            ...reportForm,
                            reason: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opis problemu
                      </label>
                      <textarea
                        value={reportForm.description}
                        onChange={(e) =>
                          setReportForm({
                            ...reportForm,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>
                )}

                {!token && (
                  <p className="text-gray-500 text-sm">
                    <LogIn className="w-4 h-4 inline mr-2" />
                    Zaloguj się, aby zgłosić problem z tym ogłoszeniem
                  </p>
                )}
              </div>

              {/* Safety Notice */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Zasady bezpieczeństwa
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Zawsze sprawdź telefon przed zakupem. Spotkaj się w
                      publicznym miejscu. Nie przekazuj pieniędzy przed
                      sprawdzeniem urządzenia.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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

export default SmartphoneDetails;
