import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../SearchBar";
import {
  FileText,
  Edit,
  Save,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  ChevronDown,
  ShoppingBag,
  MessageSquare,
  Shield,
  Users,
  LogOut,
  Bell,
  Heart,
  Plus,
  Search,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface ContentPage {
  id: number;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
  updatedBy: string;
}

const ManageContent: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: JwtPayLoad = jwtDecode(token);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Pobierz wszystkie strony
  const fetchPages = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<ContentPage[]>(
        "http://localhost:8080/api/content-pages",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPages(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pages:", error);
      setMessage({
        type: "error",
        text: "Nie udało się pobrać stron",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
    fetchFavoriteCount();
  }, []);

  const fetchFavoriteCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      searchQuery.trim()
        ? `/smartfony?search=${searchQuery.trim()}`
        : "/smartfony"
    );
  };

  // Rozpocznij edycję
  const startEditing = (page: ContentPage) => {
    setEditingPage(page);
    setEditedTitle(page.title);
    setEditedContent(page.content);
    setMessage(null);
  };

  // Anuluj edycję
  const cancelEditing = () => {
    setEditingPage(null);
    setEditedTitle("");
    setEditedContent("");
    setMessage(null);
  };

  // Zapisz zmiany
  const saveChanges = async () => {
    if (!editingPage) return;

    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put<ContentPage>(
        `http://localhost:8080/api/content-pages/${editingPage.id}`,
        {
          title: editedTitle,
          content: editedContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Aktualizuj listę stron
      setPages(pages.map((p) => (p.id === editingPage.id ? response.data : p)));

      setMessage({
        type: "success",
        text: "Zmiany zostały zapisane pomyślnie!",
      });

      // Zamknij edytor po 2 sekundach
      setTimeout(() => {
        cancelEditing();
      }, 2000);
    } catch (error) {
      console.error("Error saving changes:", error);
      setMessage({
        type: "error",
        text: "Nie udało się zapisać zmian",
      });
    } finally {
      setSaving(false);
    }
  };

  // Inicjalizuj strony domyślne
  const initializePages = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8080/api/content-pages/initialize",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        type: "success",
        text: "Strony zostały zainicjalizowane!",
      });

      // Odśwież listę
      fetchPages();
    } catch (error) {
      console.error("Error initializing pages:", error);
      setMessage({
        type: "error",
        text: "Nie udało się zainicjalizować stron",
      });
    }
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

          {/* Wyszukiwarka */}
          <SearchBar />

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMessengerClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <button
              onClick={handleNotificationsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>
            <button
              onClick={handleWatchedAdsClick}
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
            <button
              onClick={() => navigate("/user/addadvertisement")}
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
                <User className="w-5 h-5" />
                Twoje konto
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-purple-600 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    <button
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/user/your-ads");
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 text-blue-400" />
                      Ogłoszenia
                    </button>
                    <button
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/user/message");
                      }}
                    >
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      Czat
                    </button>
                    <button
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/user/personaldetails");
                      }}
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      Profil
                    </button>
                    {isAdmin && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/admin");
                        }}
                      >
                        <Shield className="w-4 h-4 text-red-400" />
                        Panel administratora
                      </button>
                    )}
                    {(isAdmin || isStaff) && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
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
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
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
                      className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Wyloguj
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header z ikoną FileText */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 p-4 rounded-full">
                  <FileText className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Zarządzanie treścią
                  </h1>
                  <p className="text-gray-300">
                    Edytuj treść stron informacyjnych serwisu MobliX
                  </p>
                </div>
              </div>
              <button
                onClick={initializePages}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Inicjalizuj strony
              </button>
            </div>
          </div>

          {/* Komunikaty */}
          {message && (
            <div
              className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
                message.type === "success"
                  ? "bg-green-900/50 text-green-200 border border-green-500"
                  : "bg-red-900/50 text-red-200 border border-red-500"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
              <p className="text-gray-300 mt-4">Ładowanie stron...</p>
            </div>
          )}

          {/* Lista stron */}
          {!loading && !editingPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-purple-400" />
                    <span className="text-xs text-gray-400">ID: {page.id}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {page.title}
                  </h3>

                  <div className="text-sm text-gray-300 mb-4">
                    <p>Slug: /{page.slug}</p>
                    <p>
                      Ostatnia aktualizacja:{" "}
                      {new Date(page.lastUpdated).toLocaleDateString("pl-PL")}
                    </p>
                    {page.updatedBy && <p>Przez: {page.updatedBy}</p>}
                  </div>

                  <button
                    onClick={() => startEditing(page)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edytuj
                  </button>
                </div>
              ))}

              {pages.length === 0 && (
                <div className="col-span-full bg-gray-800 rounded-lg text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <p className="text-lg text-gray-300">
                    Brak stron do wyświetlenia
                  </p>
                  <p className="text-sm mt-2 text-gray-400">
                    Strony pojawią się automatycznie po ich utworzeniu przez
                    backend
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Edytor */}
          {editingPage && (
            <div className="bg-gray-800 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Edycja: {editingPage.title}
                </h2>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tytuł */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tytuł strony
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Wprowadź tytuł strony"
                />
              </div>

              {/* Zawartość HTML */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zawartość HTML
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  rows={20}
                  placeholder="Wprowadź zawartość HTML..."
                />
                <p className="text-xs text-gray-400 mt-2">
                  Możesz używać tagów HTML takich jak: h1, h2, p, ul, li,
                  strong, em, a, section
                </p>
              </div>

              {/* Podgląd na żywo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Podgląd na żywo
                </label>
                <div className="border border-gray-600 rounded-lg p-6 bg-gray-900 max-h-96 overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{ __html: editedContent }}
                    className="prose prose-invert max-w-none text-white"
                    style={{
                      color: "white",
                    }}
                  />
                </div>
              </div>

              {/* Przyciski akcji */}
              <div className="flex gap-4">
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-5 h-5" />
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Czarna stopka jak w MainPanel */}
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <a
              href="/zasady-bezpieczenstwa"
              className="hover:text-purple-400 transition-colors"
            >
              Zasady bezpieczeństwa
            </a>
            <a
              href="/jak-dziala-moblix"
              className="hover:text-purple-400 transition-colors"
            >
              Jak działa MobliX
            </a>
            <a
              href="/regulamin"
              className="hover:text-purple-400 transition-colors"
            >
              Regulamin
            </a>
            <a
              href="/polityka-cookies"
              className="hover:text-purple-400 transition-colors"
            >
              Polityka cookies
            </a>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2024 MobliX. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManageContent;
