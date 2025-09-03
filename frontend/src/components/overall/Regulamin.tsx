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

const Regulamin: React.FC = () => {
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
              Regulamin serwisu MobliX
            </h1>
            <p className="text-sm text-gray-600">
              Ostatnia aktualizacja: 18.08.2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                1. Postanowienia ogólne
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  MobliX to platforma ogłoszeniowa umożliwiająca publikowanie i
                  przeglądanie ogłoszeń dotyczących smartfonów.
                </li>
                <li>
                  MobliX nie prowadzi sprzedaży i nie jest stroną transakcji
                  między użytkownikami.
                </li>
                <li>
                  Korzystając z serwisu, akceptujesz niniejszy Regulamin oraz
                  Politykę cookies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                2. Zakres usług
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Użytkownicy niezalogowani mogą przeglądać, wyszukiwać i
                  filtrować ogłoszenia.
                </li>
                <li>
                  Użytkownicy zalogowani mogą dodawać, edytować i usuwać własne
                  ogłoszenia.
                </li>
                <li>
                  Kontakt między stronami odbywa się przez wiadomości w serwisie
                  (Czat → Wyślij wiadomość) lub telefonicznie (przycisk
                  „Zadzwoń”).
                </li>
                <li>
                  Serwis nie oferuje koszyka, płatności online ani realizacji
                  wysyłki.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                3. Konta i zasady korzystania
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Założenie konta wymaga podania prawdziwych danych i akceptacji
                  Regulaminu.
                </li>
                <li>
                  Użytkownik odpowiada za bezpieczeństwo swojego konta i
                  nieudostępnianie danych logowania.
                </li>
                <li>
                  Zakazane jest tworzenie fikcyjnych ofert, podszywanie się pod
                  inne osoby oraz spam.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                4. Ogłoszenia – wymagania i zakazy
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Ogłoszenia muszą dotyczyć wyłącznie smartfonów oraz ich
                  bezpośredniej sprzedaży.
                </li>
                <li>
                  Opis i zdjęcia powinny być rzetelne i nie wprowadzać w błąd.
                </li>
                <li>
                  Zakazane: treści bezprawne, naruszające prawa autorskie,
                  wulgarne, dyskryminujące, reklamy niezwiązane z tematem.
                </li>
                <li>
                  Serwis może moderować, ukryć lub usunąć ogłoszenie naruszające
                  Regulamin.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                5. Kontakt, płatności i dostawa
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Warunki transakcji (cena, płatność, odbiór/wysyłka) ustalają
                  użytkownicy między sobą.
                </li>
                <li>
                  MobliX nie pośredniczy w płatnościach ani dostawach i nie
                  odpowiada za ich przebieg.
                </li>
                <li>
                  Zalecamy zapoznanie się z sekcją „Zasady bezpieczeństwa”.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                6. Odpowiedzialność
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Treści ogłoszeń pochodzą od użytkowników; odpowiada za nie
                  wyłącznie ich autor.
                </li>
                <li>
                  MobliX nie gwarantuje dostępności ofert, jakości towarów ani
                  zawarcia transakcji.
                </li>
                <li>
                  W najszerszym dopuszczalnym prawem zakresie serwis nie ponosi
                  odpowiedzialności za szkody wynikłe z korzystania z platformy.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                7. Moderacja i zgłaszanie naruszeń
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Zastrzegamy sobie prawo do odmowy publikacji, edycji lub
                  usunięcia treści naruszających Regulamin lub prawo.
                </li>
                <li>
                  Naruszenia można zgłaszać poprzez dostępne w serwisie
                  formularze lub kontakt z administracją.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                8. Prywatność i cookies
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Informacje o przetwarzaniu danych i plikach cookies znajdują
                  się w zakładce „Polityka cookies”.
                </li>
                <li>
                  Ustawieniami plików cookies możesz zarządzać w „Ustawienia
                  plików cookies”.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                9. Zmiany, blokada konta i rozwiązanie umowy
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Regulamin może być aktualizowany; o istotnych zmianach
                  poinformujemy w serwisie.
                </li>
                <li>
                  W przypadku naruszeń możemy czasowo ograniczyć funkcje,
                  zablokować konto lub usunąć je.
                </li>
                <li>
                  Użytkownik może w każdej chwili zakończyć korzystanie z
                  serwisu i usunąć konto.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                10. Prawo właściwe i kontakt
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>
                  Do umowy o świadczenie usług drogą elektroniczną stosuje się
                  prawo właściwe dla siedziby operatora serwisu.
                </li>
                <li>
                  Kontakt: poprzez formularz w serwisie lub dane wskazane w
                  sekcji „Kontakt”.
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

export default Regulamin;
