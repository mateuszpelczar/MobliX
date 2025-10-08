import React, { useRef, useState } from "react";
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
  FileText,
  Search,
  Settings,
  BookOpen,
  Cookie,
  HelpCircle,
  Edit3,
} from "lucide-react";

type ContentItem = {
  key: string;
  title: string;
  path: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: ContentItem[] = [
  {
    key: "safety",
    title: "Zasady bezpieczeństwa",
    path: "/zasady-bezpieczenstwa",
    description: "Wskazówki jak bezpiecznie kupować i sprzedawać w MobliX.",
    icon: Shield,
  },
  {
    key: "popular",
    title: "Popularne wyszukiwania",
    path: "/popularne-wyszukiwania",
    description: "Najczęściej wyszukiwane frazy i kategorie.",
    icon: Search,
  },
  {
    key: "how",
    title: "Jak działa MobliX",
    path: "/jak-dziala-moblix",
    description: "Opis działania platformy, kontaktu i moderacji.",
    icon: HelpCircle,
  },
  {
    key: "terms",
    title: "Regulamin",
    path: "/regulamin",
    description: "Zasady korzystania z serwisu.",
    icon: BookOpen,
  },
  {
    key: "cookies",
    title: "Polityka cookies",
    path: "/polityka-cookies",
    description: "Informacje o plikach cookies i preferencjach.",
    icon: Cookie,
  },
  {
    key: "cookies-settings",
    title: "Ustawienia plików cookies",
    path: "/ustawienia-plikow-cookies",
    description: "Konfiguracja zgód na poszczególne kategorie cookies.",
    icon: Settings,
  },
];

const ManageContent: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
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
                      className="dropdown-item w-full text-left bg-white text-black"
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
                      className="dropdown-item w-full text-left bg-white text-black"
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
                      className="dropdown-item w-full text-left bg-white text-black"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/userpanel");
                      }}
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      Panel użytkownika
                    </button>
                  )}
                  <button onClick={handleLogout} className="dropdown-logout">
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
      <div
        className="panel-content pt-20 px-4 pb-6 flex-1 flex"
        style={{ paddingTop: "100px" }}
      >
        <div
          className="bg-white rounded-2xl shadow-lg p-6 max-w-6xl mx-auto w-full max-h-[80vh] overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#a855f7 #f3f4f6",
          }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-full">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  System Zarządzania Treściami
                </h1>
                <p className="text-purple-100 text-lg">
                  Kompleksowe narzędzie do administracji treści platformy
                </p>
              </div>
            </div>
            <p className="text-purple-100">
              Zarządzaj wszystkimi stronami informacyjnymi, regulaminami i
              ustawieniami platformy MobliX
            </p>
          </div>

          <p className="text-gray-700 mb-6">
            Wybierz stronę z listy i kliknij „Edytuj", aby przejść do jej widoku
            i zmienić treść.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {ITEMS.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.key}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <IconComponent className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                        {item.path}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(item.path)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-200 flex-shrink-0"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edytuj
                    </button>
                  </div>
                </div>
              );
            })}
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

export default ManageContent;
