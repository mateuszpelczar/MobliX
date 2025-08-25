import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MobileResponsive.css";

type Consent = {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  advertising: boolean;
  updatedAt?: string;
};

const CONSENT_KEY = "cookieConsent";
const defaultConsent: Consent = {
  essential: true,
  analytics: false,
  functional: false,
  advertising: false,
};

const UstawieniaPlikowCookies: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [consent, setConsent] = useState<Consent>(defaultConsent);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Consent;
        setConsent({ ...defaultConsent, ...parsed, essential: true });
      }
    } catch {
      setConsent(defaultConsent);
    }
  }, []);

  const handleSave = () => {
    const payload: Consent = {
      ...consent,
      essential: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(payload));
    // Proste powiadomienie o zapisie
    setSaved(true);
    window.dispatchEvent(
      new CustomEvent("cookie-consent-updated", { detail: payload })
    );
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConsent(defaultConsent);
    localStorage.removeItem(CONSENT_KEY);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Biały pasek u góry z napisem firmy i menu "Twoje konto" */}
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

      {/* Fioletowe tło i przewijany biały kwadrat z treścią */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-16 pb-12 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Ustawienia plików cookies
                </h1>
                <p className="text-sm text-gray-600">
                  Zarządzaj zgodami na poszczególne kategorie plików cookies.
                </p>
              </div>
              {saved && (
                <span className="text-green-700 bg-green-100 border border-green-300 rounded-md px-2 py-1 text-xs sm:text-sm">
                  Zapisano
                </span>
              )}
            </div>

            {/* Informacja i skrót do polityki */}
            <p className="text-gray-700">
              Szczegóły znajdziesz w{" "}
              <a
                href="/polityka-cookies"
                className="text-purple-700 hover:underline"
              >
                Polityce cookies
              </a>
              .
            </p>

            {/* Kategorii zgód */}
            <div className="space-y-4">
              {/* Niezbędne */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Niezbędne</h3>
                    <p className="text-gray-600 text-sm">
                      Wymagane do działania serwisu (sesja, bezpieczeństwo). Nie
                      można ich wyłączyć.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2 text-gray-400 cursor-not-allowed">
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Zawsze włączone</span>
                  </label>
                </div>
              </div>

              {/* Analityczne */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Analityczne</h3>
                    <p className="text-gray-600 text-sm">
                      Pomagają zrozumieć, jak użytkownicy korzystają z serwisu
                      (statystyki, wydajność).
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={consent.analytics}
                      onChange={(e) =>
                        setConsent((c) => ({
                          ...c,
                          analytics: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">Włącz</span>
                  </label>
                </div>
              </div>

              {/* Funkcjonalne */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Funkcjonalne
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Zapamiętują ustawienia i preferencje (np. filtry, układ
                      listy).
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={consent.functional}
                      onChange={(e) =>
                        setConsent((c) => ({
                          ...c,
                          functional: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">Włącz</span>
                  </label>
                </div>
              </div>

              {/* Reklamowe */}
              <div className="border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Reklamowe</h3>
                    <p className="text-gray-600 text-sm">
                      Personalizacja reklam i pomiar ich skuteczności.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={consent.advertising}
                      onChange={(e) =>
                        setConsent((c) => ({
                          ...c,
                          advertising: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">Włącz</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Przyciski akcji */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-end pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Przywróć domyślne
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-purple-700 text-white hover:bg-purple-800"
              >
                Zapisz ustawienia
              </button>
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

export default UstawieniaPlikowCookies;
