import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import {
  MessageSquare,
  ShoppingBag,
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
  Eye,
  Loader,
  Trash2,
  Search,
  Heart,
  Plus,
  LogIn,
} from "lucide-react";

type Notification = {
  id: number;
  type:
    | "PRICE_CHANGE"
    | "IMAGES_CHANGED"
    | "DESCRIPTION_CHANGED"
    | "AD_DELETED"
    | "AD_ENDED"
    | "TERMS_UPDATED"
    | "NEW_MESSAGE";
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  advertisementId: number | null;
  oldValue: string | null;
  newValue: string | null;
};

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<Notification[]>(
          "http://localhost:8080/api/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setNotifications(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Nie udało się pobrać powiadomień");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    fetchFavoriteCount();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    setIsDropdownOpen(false);
    navigate("/admin");
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

  const handleMarkAsRead = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:8080/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.put(
        "http://localhost:8080/api/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`http://localhost:8080/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.advertisementId) {
      navigate(`/smartfon/${notification.advertisementId}`);
    } else if (notification.type === "TERMS_UPDATED") {
      navigate("/regulamin");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "PRICE_CHANGE":
        return <TrendingDown className="w-6 h-6 text-green-400" />;
      case "IMAGES_CHANGED":
        return <Camera className="w-6 h-6 text-blue-400" />;
      case "DESCRIPTION_CHANGED":
        return <FileText className="w-6 h-6 text-cyan-400" />;
      case "TERMS_UPDATED":
        return <FileText className="w-6 h-6 text-purple-400" />;
      case "AD_DELETED":
      case "AD_ENDED":
        return <X className="w-6 h-6 text-red-400" />;
      case "NEW_MESSAGE":
        return <MessageSquare className="w-6 h-6 text-orange-400" />;
      default:
        return <Bell className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Teraz";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays === 1) return "Wczoraj";
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString("pl-PL");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
              navigate("/smartfony");
            }}
            className="flex-1 max-w-2xl"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Szukaj smartfonów..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            {/* Ikona czatu */}
            <button
              onClick={() => navigate("/user/message")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Ikona powiadomień - aktywna */}
            <button
              onClick={() => navigate("/user/notifications")}
              className="p-2 bg-purple-600 rounded-lg transition-colors relative"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Ikona ulubionych */}
            <button
              onClick={() => navigate("/user/watchedads")}
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
              onClick={() => navigate("/user/addadvertisement")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden lg:inline">Dodaj ogłoszenie</span>
            </button>

            {/* Dropdown Twoje konto */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:inline">Twoje konto</span>
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

      {/* Główna zawartość */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header sekcji */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-purple-600 rounded-full">
                <Bell className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Powiadomienia
            </h1>
            <p className="text-gray-300 text-lg">
              Śledź aktualizacje swoich obserwowanych ogłoszeń
            </p>
          </div>

          {/* Panel akcji */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-purple-600/20 px-4 py-2 rounded-lg border border-purple-500/30">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-white font-medium">
                    {unreadCount} nieprzeczytanych
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-green-600/20 px-4 py-2 rounded-lg border border-green-500/30">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    {notifications.filter((n) => n.isRead).length} przeczytanych
                  </span>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-purple-500/50 border-2 border-purple-400"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Oznacz wszystkie jako przeczytane</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista powiadomień */}
          {loading ? (
            <div className="text-center py-20">
              <Loader className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
              <p className="text-gray-300 text-lg">Ładowanie powiadomień...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/20 border border-red-500 rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <p className="text-red-400 font-medium text-lg">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Bell className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Brak powiadomień
              </h3>
              <p className="text-gray-400 text-lg">
                Gdy pojawią się nowe powiadomienia, zobaczysz je tutaj
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-500 cursor-pointer ${
                    !notification.isRead
                      ? "border-purple-500 bg-purple-900/20"
                      : "border-gray-700"
                  }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-full bg-gray-900/50 flex items-center justify-center border border-gray-700 group-hover:border-purple-500 transition-colors">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow space-y-2 min-w-0">
                      <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">
                        {notification.title}
                      </h3>

                      <p className="text-gray-300 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimestamp(notification.createdAt)}</span>
                        </div>

                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg transition-all duration-200"
                            >
                              <Eye className="w-4 h-4" />
                              Przeczytane
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            Usuń
                          </button>
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
          <div className="text-center text-gray-400 text-xs mt-4">
            © 2024 MobliX. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Notifications;
