import React, { useRef, useState } from "react";
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
} from "lucide-react";
import "../../styles/MobileResponsive.css";

const PolitykaCookies: React.FC = () => {
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
              <User className="w-4 h-4 text-blue-600" />
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

      {/* Fioletowe tło i przewijany biały kwadrat z treścią */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Polityka plików cookies
            </h1>
            <p className="text-sm text-gray-600">
              Ostatnia aktualizacja: 18.08.2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Czym są pliki cookies?
              </h2>
              <p className="text-gray-700">
                Cookies to niewielkie pliki tekstowe zapisywane na Twoim
                urządzeniu podczas korzystania z serwisu. Umożliwiają m.in.
                zapamiętanie ustawień, utrzymanie sesji logowania oraz analizę
                sposobu używania serwisu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Jakich plików cookies używamy?
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Niezbędne – wymagane do prawidłowego działania serwisu (np.
                  utrzymanie sesji, bezpieczeństwo).
                </li>
                <li>
                  Analityczne/wydajnościowe – pomagają zrozumieć, jak
                  użytkownicy korzystają z serwisu (statystyki, poprawa UX).
                </li>
                <li>
                  Funkcjonalne – zapamiętują Twoje preferencje (np. wybrane
                  filtry, układ listy).
                </li>
                <li>
                  Reklamowe – w razie wdrożenia, służą do personalizacji i
                  mierzenia skuteczności reklam.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Cel i podstawa prawna
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Zapewnienie działania i bezpieczeństwa serwisu – nasz prawnie
                  uzasadniony interes.
                </li>
                <li>
                  Poprawa jakości i personalizacja – Twoja zgoda (jeśli
                  wymagana).
                </li>
                <li>
                  Statystyka i analiza – nasz uzasadniony interes lub zgoda, w
                  zależności od zakresu.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Zarządzanie zgodą i wyłączenie cookies
              </h2>
              <p className="text-gray-700 mb-2">
                W każdej chwili możesz zmienić swoje preferencje dotyczące
                cookies w ustawieniach przeglądarki lub w naszym module
                zarządzania zgodą.
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Panel zgód: przejdź do{" "}
                  <a
                    href="/ustawienia-plikow-cookies"
                    className="text-purple-700 hover:underline"
                  >
                    Ustawienia plików cookies
                  </a>{" "}
                  i dostosuj kategorie.
                </li>
                <li>
                  Przeglądarka: możesz blokować lub usuwać pliki cookies;
                  pamiętaj, że wyłączenie niektórych może ograniczyć
                  funkcjonalność serwisu.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Cookies podmiotów trzecich
              </h2>
              <p className="text-gray-700">
                W serwisie mogą działać dostawcy zewnętrzni (np. narzędzia
                analityczne). Pliki cookies tych podmiotów podlegają ich własnym
                politykom. Zalecamy zapoznanie się z zasadami prywatności
                odpowiednich dostawców.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Okres przechowywania
              </h2>
              <p className="text-gray-700">
                Czas przechowywania zależy od rodzaju pliku: sesyjne są usuwane
                po zamknięciu przeglądarki, stałe pozostają na urządzeniu do
                czasu ich wygaśnięcia lub ręcznego usunięcia.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. Zmiany Polityki cookies
              </h2>
              <p className="text-gray-700">
                Możemy aktualizować niniejszą Politykę, aby odzwierciedlała
                zmiany w technologii, przepisach lub usługach. O istotnych
                zmianach poinformujemy w serwisie.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. Kontakt
              </h2>
              <p className="text-gray-700">
                W sprawach dotyczących cookies i prywatności skontaktuj się z
                nami poprzez formularz dostępny w serwisie lub dane podane w
                sekcji „Kontakt”.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Stopka jak w innych stronach */}
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

export default PolitykaCookies;
