import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../styles/MobileResponsive.css";

const JakDzialaMoblix: React.FC = () => {
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

      {/* Fioletowe tło i biały kwadrat z treścią */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Jak działa MobliX
            </h1>
            <p className="text-gray-700 leading-relaxed">
              MobliX to platforma ogłoszeniowa skoncentrowana na smartfonach.
              Łączymy osoby, które sprzedają i kupują telefony różnych marek i
              modeli. Z MobliX łatwo wyszukasz konkretny model, porównasz
              oferty, skontaktujesz się ze sprzedawcą i bezpiecznie
              sfinalizujesz zakup.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Wyszukiwanie i filtrowanie
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Wyszukuj smartfony po <strong>marce</strong>,{" "}
                  <strong>modelu</strong>, <strong>pamięci</strong> czy{" "}
                  <strong>kolorze</strong>.
                </li>
                <li>
                  Filtruj po <strong>cenie</strong>,{" "}
                  <strong>stanie urządzenia</strong> (nowy/używany), a także
                  innych parametrach.
                </li>
                <li>Sortuj wyniki według trafności, ceny lub daty dodania.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Konto i profil
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Załóż konto, aby <strong>dodawać ogłoszenia</strong> i
                  zarządzać nimi.
                </li>
                <li>
                  Uzupełnij <strong>dane profilowe</strong> i buduj{" "}
                  <strong>wiarygodność</strong> dzięki ocenom.
                </li>
                <li>
                  Z panelu użytkownika masz szybki dostęp do wiadomości,
                  ogłoszeń i ustawień profilu.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Dodawanie ogłoszeń
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Dodaj tytuł, opis, cenę, wybierz markę i pozostałe parametry
                  oraz dodaj <strong>zdjęcia</strong>.
                </li>
                <li>Edytuj lub usuwaj swoje oferty w dowolnym momencie.</li>
                <li>
                  Udzielaj odpowiedzi na pytania kupujących i negocjuj warunki.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Komunikacja między użytkownikami
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Wysyłaj <strong>wiadomości</strong> bezpośrednio do
                  sprzedającego lub kupującego.
                </li>
                <li>
                  Otrzymuj powiadomienia o nowych wiadomościach i odpowiedziach.
                </li>
                <li>
                  Ustalaj szczegóły transakcji i wygodny sposób odbioru/wysyłki.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Zakupy i bezpieczeństwo
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Porównuj oferty i wybierz najlepszą dla siebie.</li>
                <li>
                  Finalizuj zakup na bezpiecznych warunkach uzgodnionych między
                  stronami.
                </li>
                <li>
                  Sprawdź <strong>Zasady bezpieczeństwa</strong> i kupuj
                  świadomie.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Moderacja i administracja
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Zespół dba o porządek i reaguje na zgłoszenia nieodpowiednich
                  treści.
                </li>
                <li>
                  Administratorzy mogą{" "}
                  <strong>edytować/usunąć ogłoszenia</strong> naruszające
                  regulamin, przeglądać logi i raporty.
                </li>
              </ul>
            </section>

            <div className="bg-gray-50 border rounded-lg p-4 text-gray-700">
              Masz pytania? Zajrzyj do sekcji: „Zasady bezpieczeństwa”,
              „Popularne wyszukiwania”, „Regulamin” oraz „Polityka cookies” w
              stopce.
            </div>
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

export default JakDzialaMoblix;
