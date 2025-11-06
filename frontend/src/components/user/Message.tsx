import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
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
  Clock,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";

type Conversation = {
  id: number;
  advertisementId: number;
  advertisementTitle: string;
  advertisementImageUrl: string;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

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
  }, [adId, sellerEmail]);

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

      const response = await axios.get<Conversation>(
        `http://localhost:8080/api/messages/conversation?advertisementId=${advertisementId}&otherUserEmail=${seller}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedConversation(response.data);
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
        "http://localhost:8080/api/messages/conversations",
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
        `http://localhost:8080/api/messages/conversation/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(response.data);

      // Oznacz jako przeczytane
      await axios.put(
        `http://localhost:8080/api/messages/conversation/${conversationId}/read`,
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

      await axios.post(
        "http://localhost:8080/api/messages/send",
        {
          receiverEmail: selectedConversation.otherUserEmail,
          advertisementId: selectedConversation.advertisementId,
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
        <div className="container mx-auto px-4 relative pt-52 pb-12 max-w-7xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[600px] flex">
            {/* Lewa kolumna - Lista konwersacji */}
            <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
              {/* Header listy konwersacji */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-full">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Wiadomości</h2>
                    <p className="text-sm text-green-100">
                      {conversations.length} konwersacji
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista konwersacji */}
              <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="w-8 h-8 text-green-600 animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Brak konwersacji
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Kliknij "Napisz wiadomość" w ogłoszeniu aby rozpocząć czat
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        fetchMessages(conv.id);
                      }}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id
                          ? "bg-green-50 border-l-4 border-l-green-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Zdjęcie ogłoszenia */}
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {conv.advertisementImageUrl ? (
                            <img
                              src={conv.advertisementImageUrl}
                              alt={conv.advertisementTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Informacje o konwersacji */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate text-sm">
                              {conv.otherUserName}
                            </h4>
                            {conv.unreadCount > 0 && (
                              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full ml-2">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {conv.advertisementTitle}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.lastMessage || "Brak wiadomości"}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {conv.lastMessageTime
                                ? formatTime(conv.lastMessageTime)
                                : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Prawa kolumna - Okno czatu */}
            <div className="hidden md:flex md:w-2/3 flex-col">
              {selectedConversation ? (
                <>
                  {/* Header czatu */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {selectedConversation.otherUserName}
                        </h3>
                        <p
                          className="text-sm text-green-100 cursor-pointer hover:underline"
                          onClick={() =>
                            navigate(
                              `/smartfon/${selectedConversation.advertisementId}`
                            )
                          }
                        >
                          {selectedConversation.advertisementTitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Wiadomości */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <MessageSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
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
                                className={`relative max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                  isOwnMessage
                                    ? "bg-green-600 text-white rounded-br-none"
                                    : "bg-white text-gray-900 rounded-bl-none shadow-md"
                                }`}
                              >
                                <p className="text-sm break-words mb-1">
                                  {message.content}
                                </p>
                                <div
                                  className={`flex items-center justify-between gap-2 text-xs ${
                                    isOwnMessage
                                      ? "text-green-100"
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
                                            className="w-2 h-2 text-green-600"
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
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {error && (
                      <div className="mb-3 flex items-center gap-2 text-red-600 text-sm">
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
                        className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent max-h-32"
                        rows={2}
                        disabled={sendingMessage}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Wybierz konwersację
                    </h3>
                    <p className="text-gray-500">
                      Wybierz konwersację z listy aby rozpocząć czat
                    </p>
                  </div>
                </div>
              )}
            </div>
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

export default MessageComponent;
