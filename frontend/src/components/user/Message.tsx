import React, { useState, useRef } from "react";
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
  Send,
  Clock,
  UserCircle,
  Inbox,
  MessageCircle,
  Search,
  Filter,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

type AdItem = { id: number; title: string; owner: "me" | "user" };

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data; replace later with API
  const [filter, setFilter] = useState<"me" | "user" | "all">("me");
  const [ads] = useState<AdItem[]>([
    // Moje ogłoszenia (rozmowy o moich ogłoszeniach)
    {
      id: 1,
      title: "iPhone 13 128GB - rozmowa z Janem Kowalskim",
      owner: "me",
    },
    { id: 2, title: "MacBook Pro 2021 - rozmowa z Anną Nowak", owner: "me" },
    // Ogłoszenia innych (wiadomości wysłane do sprzedawców)
    {
      id: 3,
      title: "Samsung S22 Ultra - rozmowa z Piotrem Zielińskim",
      owner: "user",
    },
    {
      id: 4,
      title: "Dell XPS 15 - rozmowa z Martą Lewandowską",
      owner: "user",
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Mock conversation data for each ad
  const conversations: Record<
    number,
    { sender: string; text: string; time: string }[]
  > = {
    1: [
      {
        sender: "Jan Kowalski",
        text: "Dzień dobry, czy iPhone jest jeszcze dostępny?",
        time: "10:01",
      },
      { sender: "Ja", text: "Tak, jest dostępny.", time: "10:02" },
      {
        sender: "Jan Kowalski",
        text: "Czy cena jest do negocjacji?",
        time: "10:03",
      },
      { sender: "Ja", text: "Możemy się dogadać.", time: "10:04" },
    ],
    2: [
      {
        sender: "Anna Nowak",
        text: "Witam, czy MacBook ma gwarancję?",
        time: "09:15",
      },
      { sender: "Ja", text: "Tak, jeszcze rok.", time: "09:16" },
    ],
    3: [
      {
        sender: "Ja",
        text: "Dzień dobry, interesuje mnie Samsung S22 Ultra.",
        time: "11:20",
      },
      {
        sender: "Piotr Zieliński",
        text: "Zapraszam do zakupu!",
        time: "11:21",
      },
    ],
    4: [
      {
        sender: "Ja",
        text: "Czy Dell XPS 15 ma dedykowaną kartę graficzną?",
        time: "12:00",
      },
      {
        sender: "Marta Lewandowska",
        text: "Tak, posiada RTX 3050.",
        time: "12:01",
      },
    ],
  };

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
        <div className="container mx-auto px-4 relative pt-40 pb-12 max-w-5xl">
          <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-8 min-h-[300px] border-t-4 border-blue-500">
            {/* Header with gradient background and icon */}
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg -z-10"></div>
              <div className="flex items-center justify-center gap-3 py-6">
                <MessageCircle className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Wiadomości
                </h2>
              </div>
            </div>
            {/* Modern tabs with icons */}
            <div className="flex justify-center">
              <div className="bg-gray-50 p-2 rounded-xl flex gap-2">
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    filter === "me"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-md"
                  }`}
                  onClick={() => setFilter("me")}
                >
                  <Inbox className="w-4 h-4" />
                  Moje ogłoszenia
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    filter === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-blue-600 hover:bg-white hover:shadow-md"
                  }`}
                  onClick={() => setFilter("user")}
                >
                  <Search className="w-4 h-4" />
                  Ogłoszenia
                </button>
              </div>
            </div>
            {/* Modern two-column layout with enhanced styling */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[400px]">
              {/* Left: Enhanced conversations list */}
              <div className="w-full lg:w-2/5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-gray-800">
                    {filter === "me"
                      ? "Rozmowy dotyczące Twoich ogłoszeń"
                      : "Wiadomości wysłane do sprzedawców"}
                  </p>
                </div>

                {ads.filter((a) => a.owner === filter).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">Brak rozmów</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Rozpocznij pierwszą konwersację
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ads
                      .filter((a) => a.owner === filter)
                      .map((a) => (
                        <div
                          key={a.id}
                          className={`p-4 cursor-pointer rounded-xl transition-all duration-200 border ${
                            selectedId === a.id
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-300 shadow-lg transform scale-102"
                              : "hover:bg-white hover:shadow-md border-gray-100 bg-gray-50"
                          }`}
                          onClick={() => setSelectedId(a.id)}
                        >
                          <div className="flex items-center gap-3">
                            <UserCircle
                              className={`w-8 h-8 flex-shrink-0 ${
                                selectedId === a.id
                                  ? "text-white"
                                  : "text-gray-400"
                              }`}
                            />
                            <div className="flex-grow min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  selectedId === a.id
                                    ? "text-white"
                                    : "text-gray-800"
                                }`}
                              >
                                {a.title.split(" - ")[0]}
                              </p>
                              <p
                                className={`text-sm truncate ${
                                  selectedId === a.id
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {a.title.split(" - ")[1] || "Nowa rozmowa"}
                              </p>
                            </div>
                            {selectedId === a.id && (
                              <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Right: Enhanced conversation details */}
              <div className="w-full lg:w-3/5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                {selectedId && conversations[selectedId] ? (
                  <div className="flex flex-col h-full">
                    {/* Chat header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-xl">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-6 h-6" />
                        <div>
                          <h3 className="font-semibold">Szczegóły rozmowy</h3>
                          <p className="text-blue-100 text-sm">
                            Aktywna konwersacja
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-grow p-6 overflow-y-auto">
                      <div className="space-y-4">
                        {conversations[selectedId].map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${
                              msg.sender === "Ty"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                msg.sender === "Ty"
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <div
                                className={`flex items-center gap-1 mt-2 text-xs ${
                                  msg.sender === "Ty"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>{msg.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Message input */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Napisz wiadomość..."
                          className="flex-grow px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-200">
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-12">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-blue-500" />
                      </div>
                      <p className="text-gray-500 text-lg font-medium">
                        Wybierz rozmowę
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Kliknij na konwersację z listy po lewej stronie
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom */}
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

export default EditAd;
