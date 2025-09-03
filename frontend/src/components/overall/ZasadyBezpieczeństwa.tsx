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
} from "lucide-react";

const ZasadyBezpieczeństwa: React.FC = () => {
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
              Zasady bezpieczeństwa
            </h1>
            <p className="text-sm text-gray-600">
              Ostatnia aktualizacja: 19.08.2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Ogólne zasady ostrożności
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Korzystaj z czatu w serwisie i nie przechodź na podejrzane
                  linki zewnętrzne.
                </li>
                <li>
                  Nie udostępniaj danych logowania, numerów kart, kodów BLIK ani
                  jednorazowych kodów autoryzacyjnych.
                </li>
                <li>
                  Jeśli coś budzi Twoje wątpliwości – przerwij rozmowę i zgłoś
                  ogłoszenie.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Weryfikacja ogłoszeń i sprzedających
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Sprawdź historię konta i opinie użytkownika (jeśli dostępne).
                </li>
                <li>Uważaj na ceny znacznie zaniżone względem rynku.</li>
                <li>
                  Proś o dodatkowe zdjęcia i informacje (np. numer IMEI, stan
                  baterii, akcesoria).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Płatności i bezpieczeństwo transakcji
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  MobliX nie pośredniczy w płatnościach – nie wysyłaj zaliczek
                  nieznajomym.
                </li>
                <li>
                  Unikaj przesyłania środków przez szybkie przelewy na prośbę z
                  linków przesłanych w czacie.
                </li>
                <li>
                  Przy odbiorze osobistym płać po sprawdzeniu urządzenia; przy
                  wysyłce rozważ usługę z ubezpieczeniem i możliwością
                  sprawdzenia przesyłki.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Odbiór i sprawdzenie telefonu
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Sprawdź zgodność numeru IMEI z dokumentami/ustaleniami oraz
                  czy urządzenie nie jest zablokowane (np. iCloud/FRP).
                </li>
                <li>
                  Przetestuj podstawowe funkcje: ekran, dotyk, bateria, aparat,
                  głośnik, mikrofon, port ładowania, sieć.
                </li>
                <li>
                  Spisz prosty protokół odbioru (data, model, cena, stan) i
                  poproś o potwierdzenie.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Oszustwa i phishing
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Nie klikaj w linki do „szybkich płatności”, „potwierdzeń
                  wysyłki” lub „zwrotów” przesłane przez obce osoby.
                </li>
                <li>Nie podawaj kodów BLIK ani haseł na prośbę rozmówcy.</li>
                <li>
                  Adresy stron sprawdzaj dokładnie (literówki, dziwne domeny,
                  brak certyfikatu HTTPS).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Ochrona konta
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Używaj silnego, unikalnego hasła; nie udostępniaj go nikomu.
                </li>
                <li>
                  Wylogowuj się na współdzielonych urządzeniach. Aktualizuj
                  przeglądarkę i system.
                </li>
                <li>
                  Uważaj na publiczne Wi‑Fi – unikaj logowania w niezaufanych
                  sieciach.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. Zgłaszanie nadużyć
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Zgłaszaj podejrzane ogłoszenia i wiadomości poprzez dostępne w
                  serwisie formularze.
                </li>
                <li>
                  W przypadku realnego zagrożenia lub przestępstwa skontaktuj
                  się z odpowiednimi służbami.
                </li>
                <li>
                  Przekaż zrzuty ekranu, numery telefonów i inne istotne
                  informacje ułatwiające weryfikację.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. Dane osobowe i prywatność
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Udostępniaj tylko niezbędne dane. Nigdy nie przesyłaj skanów
                  dokumentów tożsamości.
                </li>
                <li>
                  Zapoznaj się z{" "}
                  <a
                    href="/polityka-cookies"
                    className="text-purple-700 hover:underline"
                  >
                    Polityką cookies
                  </a>{" "}
                  i ustaw preferencje w{" "}
                  <a
                    href="/ustawienia-plikow-cookies"
                    className="text-purple-700 hover:underline"
                  >
                    Ustawieniach plików cookies
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                9. Co robi MobliX
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Udostępnia narzędzia kontaktu i mechanizmy zgłaszania
                  naruszeń.
                </li>
                <li>
                  Może moderować, ukrywać lub usuwać treści niezgodne z
                  Regulaminem lub prawem.
                </li>
                <li>
                  Nie pośredniczy w płatnościach i dostawie – warunki ustalają
                  użytkownicy między sobą.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                10. W razie problemów
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Przerwij rozmowę i nie wykonuj płatności, jeśli masz
                  wątpliwości.
                </li>
                <li>Zmień hasło do konta, jeśli podejrzewasz przejęcie.</li>
                <li>
                  Skontaktuj się z nami przez zakładkę „Kontakt” i rozważ
                  zgłoszenie sprawy organom ścigania.
                </li>
              </ul>
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

export default ZasadyBezpieczeństwa;
