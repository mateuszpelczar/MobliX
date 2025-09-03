import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
  Star,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Plus,
  Edit3,
  Pause,
  Play,
  Trash2,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

type Ad = {
  id: number;
  title: string;
  price: number;
  category: string;
  date: string;
  status: "active" | "sold" | "paused";
  views: number;
  images: string[];
};

const mockAds: Ad[] = [
  {
    id: 1,
    title: "iPhone 13 128GB",
    price: 2500,
    category: "Telefony",
    date: "2025-08-20",
    status: "active",
    views: 45,
    images: ["/api/placeholder/400/300"],
  },
  {
    id: 2,
    title: "Samsung S22 Ultra",
    price: 3200,
    category: "Telefony",
    date: "2025-08-18",
    status: "sold",
    views: 67,
    images: ["/api/placeholder/400/300"],
  },
  {
    id: 3,
    title: "Laptop Dell XPS 13",
    price: 4500,
    category: "Komputery",
    date: "2025-08-15",
    status: "paused",
    views: 23,
    images: ["/api/placeholder/400/300"],
  },
];

const tabLabels = [
  { key: "active", label: "Aktywne" },
  { key: "sold", label: "Sprzedane" },
  { key: "paused", label: "Wstrzymane" },
];

const YourAds: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "paused">(
    "active"
  );

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isStaff = userRole === "STAFF";

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filtered = mockAds.filter((ad) => ad.status === activeTab);

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
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
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
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

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12 max-w-5xl">
          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-8 min-h-[300px] border-t-4 border-blue-500">
            {/* Header with gradient background */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg -z-10"></div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-6">
                Twoje Ogłoszenia
              </h1>
            </div>

            {/* Tabs with modern design */}
            <div className="flex flex-wrap justify-center gap-2 bg-gray-50 p-2 rounded-xl">
              {tabLabels.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-md"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Add new ad button with icon */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate("/user/addadvertisement")}
                className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3 font-semibold"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Dodaj nowe ogłoszenie
              </button>
            </div>

            {/* Ads List with modern cards */}
            <div className="grid gap-6">
              {filtered.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    Brak ogłoszeń w tej kategorii
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Dodaj swoje pierwsze ogłoszenie
                  </p>
                </div>
              ) : (
                filtered.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300 group"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={ad.images[0]}
                            alt={ad.title}
                            className="w-full lg:w-40 h-40 object-cover bg-gray-200 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 left-3">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                ad.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : ad.status === "sold"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {ad.status === "active"
                                ? "Aktywne"
                                : ad.status === "sold"
                                ? "Sprzedane"
                                : "Wstrzymane"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-grow space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {ad.title}
                          </h3>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {ad.price.toLocaleString()} zł
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Tag className="w-4 h-4 text-blue-500" />
                            <span>{ad.category}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-green-500" />
                            <span>{ad.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Eye className="w-4 h-4 text-purple-500" />
                            <span>{ad.views} wyświetleń</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            onClick={() => navigate(`/user/edit-ad/${ad.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-all duration-200 hover:shadow-md"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edytuj
                          </button>
                          {ad.status === "active" && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-all duration-200 hover:shadow-md">
                              <Pause className="w-4 h-4" />
                              Wstrzymaj
                            </button>
                          )}
                          {ad.status === "paused" && (
                            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-all duration-200 hover:shadow-md">
                              <Play className="w-4 h-4" />
                              Aktywuj
                            </button>
                          )}
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-200 hover:shadow-md">
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
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

export default YourAds;
