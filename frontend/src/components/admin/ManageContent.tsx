import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MobileResponsive.css";

type ContentItem = {
  key: string;
  title: string;
  path: string;
  description: string;
};

const ITEMS: ContentItem[] = [
  {
    key: "safety",
    title: "Zasady bezpieczeństwa",
    path: "/zasady-bezpieczenstwa",
    description: "Wskazówki jak bezpiecznie kupować i sprzedawać w MobliX.",
  },
  {
    key: "popular",
    title: "Popularne wyszukiwania",
    path: "/popularne-wyszukiwania",
    description: "Najczęściej wyszukiwane frazy i kategorie.",
  },
  {
    key: "how",
    title: "Jak działa MobliX",
    path: "/jak-dziala-moblix",
    description: "Opis działania platformy, kontaktu i moderacji.",
  },
  {
    key: "terms",
    title: "Regulamin",
    path: "/regulamin",
    description: "Zasady korzystania z serwisu.",
  },
  {
    key: "cookies",
    title: "Polityka cookies",
    path: "/polityka-cookies",
    description: "Informacje o plikach cookies i preferencjach.",
  },
  {
    key: "cookies-settings",
    title: "Ustawienia plików cookies",
    path: "/ustawienia-plikow-cookies",
    description: "Konfiguracja zgód na poszczególne kategorie cookies.",
  },
];

const ManageContent: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div className="panel-logo text-lg sm:text-xl md:text-2xl font-bold">
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
              <div className="dropdown-menu right-0">
                <div className="py-1">
                  <a href="#" className="dropdown-item">
                    Ogłoszenia
                  </a>
                  <a href="#" className="dropdown-item">
                    Czat
                  </a>
                  <a href="#" className="dropdown-item">
                    Oceny
                  </a>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/personaldetails");
                    }}
                  >
                    Profil
                  </button>
                  <button onClick={handleLogout} className="dropdown-logout">
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
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Zarządzaj treściami
              </h1>
            </div>

            <p className="text-gray-700">
              Wybierz stronę z listy i kliknij „Edytuj”, aby przejść do jej
              widoku i zmienić treść.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ITEMS.map((item) => (
                <div
                  key={item.key}
                  className="border rounded-xl p-4 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(item.path)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm"
                    >
                      Edytuj
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    Ścieżka: {item.path}
                  </div>
                </div>
              ))}
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

export default ManageContent;
