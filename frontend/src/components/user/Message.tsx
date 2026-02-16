import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import SearchBar from "../overall/SearchBar";
import {
  User,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
  Shield,
  Users,
  LogOut,
  Send,
  Image as ImageIcon,
  AlertCircle,
  Loader,
  CheckCheck,
  Bell,
  Heart,
  Search,
  Plus,
  LogIn,
} from "lucide-react";

type Conversation = {
  id: number;
  advertisementId: number | null;
  advertisementTitle: string | null;
  advertisementImageUrl: string | null;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

type Message = {
  id: number;
  conversationId: number;
  senderEmail: string;
  senderName: string;
  receiverEmail: string;
  receiverName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

const MessageComponent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adId = searchParams.get("adId");
  const sellerEmail = searchParams.get("seller");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [favoriteCount, setFavoriteCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  // Token dla dostępu do API
  const token = localStorage.getItem("token");

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

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isStaff = userRole === "STAFF";

  useEffect(() => {
    const email = getCurrentUserEmail();
    setCurrentUserEmail(email);

    // Jeśli są parametry URL (kliknięto "Napisz wiadomość")
    if (adId && sellerEmail) {
      openConversationFromAd(parseInt(adId), sellerEmail);
    } else {
      // Pobierz wszystkie konwersacje
      fetchConversations();
    }

    // Pobierz liczbę ulubionych
    fetchFavoriteCount();
  }, [adId, sellerEmail]);

  const fetchFavoriteCount = async () => {
    if (!token) return;

    try {
      const response = await axios.get<any[]>(
        `${import.meta.env.VITE_API_URL}/api/favorites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteCount(response.data.length);
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  useEffect(() => {
    // Scroll do dołu przy nowych wiadomościach
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const openConversationFromAd = async (
    advertisementId: number,
    seller: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Sprawdź czy użytkownik nie próbuje wysłać wiadomości do samego siebie
      const currentEmail = getCurrentUserEmail();
      if (currentEmail === seller) {
        setError("Nie możesz wysłać wiadomości do samego siebie");
        setLoading(false);
        return;
      }

      const response = await axios.get<Conversation>(
        `${import.meta.env.VITE_API_URL}/api/messages/conversation?advertisementId=${advertisementId}&otherUserEmail=${seller}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Ensure the conversation is not presented as tied to the advertisement
      const conv = response.data;
      conv.advertisementId = null;
      conv.advertisementTitle = null;
      conv.advertisementImageUrl = null;
      setSelectedConversation(conv);
      await fetchMessages(response.data.id);

      // Odśwież listę konwersacji
      await fetchConversations();
    } catch (error: any) {
      console.error("Error opening conversation:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Nie udało się otworzyć konwersacji. Spróbuj ponownie.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get<Conversation[]>(
        `${import.meta.env.VITE_API_URL}/api/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConversations(response.data);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Nie udało się pobrać konwersacji.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get<Message[]>(
        `${import.meta.env.VITE_API_URL}/api/messages/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(response.data);

      // Oznacz jako przeczytane
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/messages/conversation/${conversationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Odśwież listę konwersacji (aby zaktualizować licznik nieprzeczytanych)
      await fetchConversations();
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // Send message without advertisement association
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/messages/send`,
        {
          receiverEmail: selectedConversation.otherUserEmail,
          // do not include advertisementId to keep messages ad-agnostic
          content: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setNewMessage("");
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError("Nie udało się wysłać wiadomości. Spróbuj ponownie.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Teraz";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString("pl-PL");
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
              onClick={() => navigate("/user/message")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>

            {/* Ikona powiadomień */}
            <button
              onClick={() => navigate("/user/notifications")}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
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

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-700 h-[calc(100vh-200px)] flex">
            {/* Lewa kolumna - Lista konwersacji */}
            <div className="w-full md:w-1/3 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
              {/* Header listy konwersacji */}
              <div className="px-6 py-5 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Wiadomości</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {conversations.length} konwersacje
                </p>
              </div>

              {/* Lista konwersacji */}
              <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">
                      Brak konwersacji
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Kliknij "Napisz wiadomość" w ogłoszeniu aby rozpocząć czat
                    </p>
                  </div>
                ) : (
                  conversations
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setSelectedConversation(conv);
                          fetchMessages(conv.id);
                        }}
                        className={`px-6 py-5 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                          selectedConversation?.id === conv.id
                            ? "bg-gray-800"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar użytkownika z fioletową obramówką */}
                          <div className="w-16 h-16 bg-purple-600 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-purple-500">
                            {conv.advertisementImageUrl ? (
                              <img
                                src={conv.advertisementImageUrl}
                                alt={conv.otherUserName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-xl">
                                {conv.otherUserName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Informacje o konwersacji */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-white truncate text-base">
                                {conv.otherUserName}
                              </h4>
                              {conv.lastMessageTime && (
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatTime(conv.lastMessageTime)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-400 truncate">
                                {conv.lastMessage || conv.advertisementTitle}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Paginacja */}
              {conversations.length > itemsPerPage && (
                <div className="p-4 border-t border-gray-800 bg-[#1a1a1a]">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        currentPage === 1
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-white hover:bg-purple-600 border border-purple-500"
                      }`}
                    >
                      Poprzednia
                    </button>

                    {Array.from(
                      {
                        length: Math.ceil(conversations.length / itemsPerPage),
                      },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          currentPage === page
                            ? "bg-purple-600 text-white border-2 border-purple-400"
                            : "bg-gray-800 text-white hover:bg-purple-600 border border-purple-500"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(conversations.length / itemsPerPage)
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(conversations.length / itemsPerPage)
                      }
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        currentPage ===
                        Math.ceil(conversations.length / itemsPerPage)
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-white hover:bg-purple-600 border border-purple-500"
                      }`}
                    >
                      Następna
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prawa kolumna - Okno czatu */}
            <div className="hidden md:flex md:w-2/3 flex-col bg-gray-900">
              {selectedConversation ? (
                <>
                  {/* Header czatu */}
                  <div className="p-4 border-b border-gray-700 bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {selectedConversation.otherUserName}
                        </h3>
                        {selectedConversation.advertisementId ? (
                          <button
                            onClick={() =>
                              navigate(
                                `/smartfon/${selectedConversation.advertisementId}`
                              )
                            }
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            {selectedConversation.advertisementTitle}
                          </button>
                        ) : (
                          <div className="text-xs text-gray-400">
                            Ogólna konwersacja
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wiadomości */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">
                          Rozpocznij konwersację
                        </h3>
                        <p className="text-gray-500 text-sm">
                          Wyślij pierwszą wiadomość do sprzedawcy
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwnMessage =
                            message.senderEmail === currentUserEmail;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isOwnMessage ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-lg border-2 ${
                                  isOwnMessage
                                    ? "bg-purple-600 text-white rounded-br-none border-purple-500"
                                    : "bg-gray-800 text-gray-200 rounded-bl-none border-purple-500"
                                }`}
                              >
                                <p className="text-sm break-words mb-1">
                                  {message.content}
                                </p>
                                <div
                                  className={`flex items-center justify-between gap-2 text-xs ${
                                    isOwnMessage
                                      ? "text-purple-200"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <span>{formatTime(message.createdAt)}</span>
                                  <div className="flex items-center">
                                    {isOwnMessage ? (
                                      // Wskaźnik dla wysłanych wiadomości
                                      message.isRead ? (
                                        <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-sm">
                                          <CheckCheck
                                            className="w-2 h-2 text-purple-600"
                                            strokeWidth={3}
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center">
                                          <CheckCheck
                                            className="w-2 h-2 text-white"
                                            strokeWidth={3}
                                          />
                                        </div>
                                      )
                                    ) : (
                                      // Wskaźnik dla odebranych wiadomości
                                      message.isRead && (
                                        <div className="w-3.5 h-3.5 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
                                          <CheckCheck
                                            className="w-2 h-2 text-white"
                                            strokeWidth={3}
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input do wysyłania wiadomości */}
                  <div className="p-4 border-t border-gray-700 bg-gray-800">
                    {error && (
                      <div className="mb-3 flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="flex items-end gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Napisz wiadomość..."
                        className="flex-1 resize-none bg-gray-700 border-2 border-purple-500 text-white rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent max-h-32 placeholder-gray-400"
                        rows={2}
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full border-2 border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingMessage ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Naciśnij Enter aby wysłać, Shift+Enter dla nowej linii
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      Wybierz konwersację
                    </h3>
                    <p className="text-gray-400">
                      Wybierz kontakt z listy po lewej stronie, aby rozpocząć
                      czat
                    </p>
                  </div>
                </div>
              )}
            </div>
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

export default MessageComponent;
