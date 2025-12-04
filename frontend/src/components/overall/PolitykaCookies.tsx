import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Bell,
  Heart,
  Plus,
} from "lucide-react";
import "../../styles/MobileResponsive.css";

const PolitykaCookies: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pageContent, setPageContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const token = localStorage.getItem("token");
  // Pobierz liczbę ulubionych do paska nagłówka
  useEffect(() => {
    const fetchFavoriteCount = async () => {
      if (!token) return;
      try {
        const resp = await fetch("/api/favorites", {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (resp.ok) {
          const data = (await resp.json()) as Array<{ id: number }>;
          setFavoriteCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFavoriteCount();
  }, [token]);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode<{ role?: string }>(token);
        return decodedToken.role;
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/content-pages/slug/polityka-cookies"
        );
        // Fix: assert response.data type
        const data = response.data as { content: string };
        setPageContent(data.content);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF";
  const isUser = userRole === "USER";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

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

      {/* Treść: zachowujemy wielkość i kształt okienka, ale zmieniamy tło i tekst na czarne/białe */}
      <div className="flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-black rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            <div className="bg-black rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
              {loading ? (
                <div className="text-center py-8 text-white">Ładowanie...</div>
              ) : (
                <div
                  className="text-white"
                  dangerouslySetInnerHTML={{
                    __html: pageContent.replace(
                      /(<h1[^>]*>)(Polityka cookies)(<\/h1>)/i,
                      '$1<span style="color: white;">$2</span>$3'
                    ),
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stopka jak w MainPanel: czarne tło, biała czcionka */}
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

export default PolitykaCookies;
