import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
              Twoje konto
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
                <div className="py-1">
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/your-ads");
                    }}
                  >
                    Ogłoszenia
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/message");
                    }}
                  >
                    Czat
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/ratings");
                    }}
                  >
                    Oceny
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/personaldetails");
                    }}
                  >
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
                      Panel użytkownika
                    </button>
                  )}
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="dropdown-logout"
                  >
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
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 min-h-[300px]">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
              Twoje Ogłoszenia
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center border-b border-gray-200">
              {tabLabels.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 mx-1 mb-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.key
                      ? "bg-blue-500 text-white border-b-2 border-blue-500"
                      : "text-gray-600 hover:text-blue-500 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Add new ad button */}
            <div className="flex justify-center mb-4">
              <button
                onClick={() => navigate("/user/addadvertisement")}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                + Dodaj nowe ogłoszenie
              </button>
            </div>

            {/* Ads List */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Brak ogłoszeń w tej kategorii
                </div>
              ) : (
                filtered.map((ad) => (
                  <div
                    key={ad.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full sm:w-32 h-32 object-cover rounded-lg bg-gray-200"
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {ad.title}
                        </h3>
                        <p className="text-xl font-bold text-blue-600 mb-2">
                          {ad.price.toLocaleString()} zł
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Kategoria: {ad.category}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          Data: {ad.date}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          Wyświetlenia: {ad.views}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => navigate(`/user/edit-ad/${ad.id}`)}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Edytuj
                          </button>
                          {ad.status === "active" && (
                            <button className="px-4 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors">
                              Wstrzymaj
                            </button>
                          )}
                          {ad.status === "paused" && (
                            <button className="px-4 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
                              Aktywuj
                            </button>
                          )}
                          <button className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors">
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
