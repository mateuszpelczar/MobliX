import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  Bell,
  Clock,
  TrendingDown,
  Camera,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
} from "lucide-react";

type Notification = {
  id: number;
  type: "price_drop" | "new_photos" | "platform" | "ad_ended" | "new_message";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon?: string;
};

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      type: "price_drop",
      title: "iPhone 13 128GB",
      message: "Cena ogłoszenia została obniżona z 3200 zł na 2999 zł.",
      timestamp: "2 godziny temu",
      isRead: false,
    },
    {
      id: 2,
      type: "new_photos",
      title: "MacBook Pro 2021",
      message: "Sprzedający dodał nowe zdjęcia do ogłoszenia.",
      timestamp: "Wczoraj",
      isRead: false,
    },
    {
      id: 3,
      type: "platform",
      title: "Platforma MobliX",
      message: "Zmieniono regulamin platformy. Zapoznaj się z nowymi zasadami.",
      timestamp: "3 dni temu",
      isRead: true,
    },
    {
      id: 4,
      type: "ad_ended",
      title: "Dell XPS 15",
      message: "Ogłoszenie zostało zakończone przez sprzedawcę.",
      timestamp: "5 dni temu",
      isRead: true,
    },
    {
      id: 5,
      type: "new_message",
      title: "Samsung S22 Ultra",
      message: "Otrzymałeś nową wiadomość od kupującego.",
      timestamp: "1 dzień temu",
      isRead: false,
    },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Check user role from JWT token
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
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const handleMarkAsRead = (id: number) => {
    console.log(`Oznacz jako przeczytane: ${id}`);
  };

  const handleMarkAllAsRead = () => {
    console.log("Oznacz wszystkie jako przeczytane");
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "price_drop":
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      case "new_photos":
        return <Camera className="w-5 h-5 text-blue-500" />;
      case "platform":
        return <FileText className="w-5 h-5 text-purple-500" />;
      case "ad_ended":
        return <X className="w-5 h-5 text-red-500" />;
      case "new_message":
        return <MessageSquare className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header like AdminPanel */}
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
              className="account-dropdown-button flex items-center gap-2"
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
                  <button
                    onClick={handleLogout}
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
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
        <div
          className="container mx-auto px-4 relative"
          style={{ paddingTop: "400px", paddingBottom: "48px" }}
        >
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8 w-full flex flex-col gap-6 min-h-[300px] border-t-4 border-blue-500">
            {/* Header with gradient background and icon */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg -z-10"></div>
              <div className="flex items-center justify-center gap-2 py-4">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Powiadomienia
                </h2>
              </div>
            </div>

            {/* Actions bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-gray-700 font-medium text-sm">
                    {notifications.filter((n) => !n.isRead).length}{" "}
                    nieprzeczytanych
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700 font-medium text-sm">
                    {notifications.filter((n) => n.isRead).length} przeczytanych
                  </span>
                </div>
              </div>
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4" />
                Oznacz wszystkie jako przeczytane
              </button>
            </div>

            {/* Notifications list */}
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  Brak powiadomień
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Gdy pojawią się nowe powiadomienia, zobaczysz je tutaj
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-gradient-to-br from-white to-gray-50 border rounded-xl p-4 transition-all duration-300 hover:shadow-lg group ${
                      !notification.isRead
                        ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-white flex items-center justify-center shadow-sm">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{notification.timestamp}</span>
                          </div>

                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                Oznacz jako przeczytane
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

export default EditAd;
