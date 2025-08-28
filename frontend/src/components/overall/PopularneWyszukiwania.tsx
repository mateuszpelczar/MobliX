import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../styles/MobileResponsive.css";

const PopularneWyszukiwania: React.FC = () => {
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
                  <button onClick={handleLogout} className="dropdown-logout">
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fioletowe tło i przewijany biały kwadrat z treścią */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Popularne wyszukiwania
            </h1>
            <p className="text-sm text-gray-600">
              Ostatnia aktualizacja: 28.08.2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Najczęściej wyszukiwane kategorie
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">iPhone</h3>
                  <p className="text-sm text-gray-600">
                    Wszystkie modele Apple iPhone
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Samsung Galaxy
                  </h3>
                  <p className="text-sm text-gray-600">
                    Seria Galaxy S, Note, A
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">Xiaomi</h3>
                  <p className="text-sm text-gray-600">Redmi, Mi, POCO</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">Huawei</h3>
                  <p className="text-sm text-gray-600">P, Mate, Honor</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">OnePlus</h3>
                  <p className="text-sm text-gray-600">Seria OnePlus</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Google Pixel
                  </h3>
                  <p className="text-sm text-gray-600">Czyste Android</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Najpopularniejsze wyszukiwania
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Ostatni miesiąc
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">iPhone 15 Pro</span>
                      <span className="text-sm text-gray-500">
                        2,847 wyszukań
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">Samsung Galaxy S24</span>
                      <span className="text-sm text-gray-500">
                        2,103 wyszukań
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">
                        Xiaomi Redmi Note 13
                      </span>
                      <span className="text-sm text-gray-500">
                        1,856 wyszukań
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">iPhone 14</span>
                      <span className="text-sm text-gray-500">
                        1,743 wyszukań
                      </span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">Google Pixel 8</span>
                      <span className="text-sm text-gray-500">
                        1,329 wyszukań
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Trending teraz
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">
                        iPhone 15 Pro Max 256GB
                      </span>
                      <span className="text-sm text-green-600">↗ +45%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">
                        Samsung Galaxy S24 Ultra
                      </span>
                      <span className="text-sm text-green-600">↗ +32%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">OnePlus 12</span>
                      <span className="text-sm text-green-600">↗ +28%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">Xiaomi 14</span>
                      <span className="text-sm text-green-600">↗ +23%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-gray-700">Nothing Phone 2a</span>
                      <span className="text-sm text-green-600">↗ +19%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Wyszukiwania według ceny
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Do 1000 zł
                  </h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>Xiaomi Redmi Note 12</li>
                    <li>Samsung Galaxy A54</li>
                    <li>Realme 11</li>
                    <li>Motorola Edge 40 Neo</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    1000-3000 zł
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>Samsung Galaxy S23</li>
                    <li>Google Pixel 7a</li>
                    <li>OnePlus Nord 3</li>
                    <li>iPhone 13</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">
                    Powyżej 3000 zł
                  </h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>iPhone 15 Pro Max</li>
                    <li>Samsung Galaxy S24 Ultra</li>
                    <li>Google Pixel 8 Pro</li>
                    <li>OnePlus 12</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Porady dotyczące wyszukiwania
              </h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-3">
                  Jak skutecznie wyszukiwać?
                </h3>
                <ul className="list-disc pl-6 text-yellow-700 space-y-2">
                  <li>
                    Używaj konkretnych nazw modeli zamiast ogólnych określeń
                  </li>
                  <li>
                    Dodaj informacje o pojemności pamięci (np. "128GB", "256GB")
                  </li>
                  <li>
                    Sprecyzuj stan urządzenia ("nowy", "używany", "uszkodzony")
                  </li>
                  <li>Używaj filtrów cenowych aby zawęzić wyniki</li>
                  <li>
                    Sprawdzaj różne warianty nazw (np. "iPhone 15" i "iPhone 15
                    Pro")
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Stopka jak w innych stronach */}
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

export default PopularneWyszukiwania;
