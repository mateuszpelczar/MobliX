import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
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
  Star,
  Shield,
  Users,
  LogOut,
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
  }, []);

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
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Biały pasek u góry z napisem firmy i menu "Twoje konto" */}
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
              <div className="dropdown-menu right-0">
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

      {/* Fioletowe tło i biały kwadrat z treścią */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-8 pb-12 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full">
            {/* Nagłówek */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Zarządzanie treścią
                </h1>
                <p className="text-gray-600 mt-2">
                  Edytuj treść stron informacyjnych serwisu MobliX
                </p>
              </div>
              <button
                onClick={initializePages}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Inicjalizuj strony
              </button>
            </div>

            {/* Komunikaty */}
            {message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-lg mb-6 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
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
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Ładowanie stron...</p>
              </div>
            )}

            {/* Lista stron */}
            {!loading && !editingPage && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <FileText className="w-8 h-8 text-purple-600" />
                      <span className="text-xs text-gray-500">
                        ID: {page.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {page.title}
                    </h3>

                    <div className="text-sm text-gray-600 mb-4">
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
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Brak stron do wyświetlenia</p>
                    <p className="text-sm mt-2">
                      Kliknij "Inicjalizuj strony" aby utworzyć domyślne strony
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Edytor */}
            {editingPage && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Edycja: {editingPage.title}
                  </h2>
                  <button
                    onClick={cancelEditing}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tytuł */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tytuł strony
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Wprowadź tytuł strony"
                  />
                </div>

                {/* Zawartość HTML */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zawartość HTML
                  </label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    rows={20}
                    placeholder="Wprowadź zawartość HTML..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Możesz używać tagów HTML takich jak: h1, h2, p, ul, li,
                    strong, em, a, section
                  </p>
                </div>

                {/* Podgląd na żywo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Podgląd na żywo
                  </label>
                  <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
                    <div
                      dangerouslySetInnerHTML={{ __html: editedContent }}
                      className="prose max-w-none"
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
      </div>

      {/* Stopka */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xs xs:text-sm sm:text-base px-1 sm:px-2">
          <a
            href="/zasady-bezpieczenstwa"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Zasady bezpieczeństwa
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
        </div>
      </div>
    </div>
  );
};

export default ManageContent;
