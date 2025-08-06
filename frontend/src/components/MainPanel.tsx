import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import messengerIcon from "../icons/messenger.png";
import starIcon from "../icons/star.png";
import "../styles/MobileResponsive.css";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const MainPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isVoivodeshipOpen, setIsVoivodeshipOpen] = useState(false);
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("Województwo");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const voivodeshipRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        voivodeshipRef.current &&
        !voivodeshipRef.current.contains(event.target as Node)
      ) {
        setIsVoivodeshipOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  const handleVoivodeshipClick = () => {
    setIsVoivodeshipOpen(!isVoivodeshipOpen);
  };

  const handleVoivodeshipSelect = (voivodeship: string) => {
    setSelectedVoivodeship(voivodeship);
    setIsVoivodeshipOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery, "in", selectedVoivodeship);
  };

  const handleMessengerClick = () => {
    // TODO: Implement messenger functionality
    console.log("Messenger icon clicked");
  };

  const handleStarClick = () => {
    // TODO: Implement star/favorites functionality
    console.log("Star icon clicked");
  };

  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      // Sprawdzenie czy rola zawiera "ADMIN" (z lub bez prefiksu "ROLE_")
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";

      // Logowanie informacji o tokenie dla celów diagnostycznych
      console.log("Rola użytkownika:", decoded.role);
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  const voivodeships = [
    "Cała Polska",
    "Dolnośląskie",
    "Kujawsko-pomorskie",
    "Lubelskie",
    "Lubuskie",
    "Łódzkie",
    "Małopolskie",
    "Mazowieckie",
    "Opolskie",
    "Podkarpackie",
    "Podlaskie",
    "Pomorskie",
    "Śląskie",
    "Świętokrzyskie",
    "Warmińsko-mazurskie",
    "Wielkopolskie",
    "Zachodniopomorskie",
  ];

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        {/* Logo in top left */}
        <div className="panel-logo text-lg sm:text-xl md:text-2xl font-bold">
          MobliX
        </div>

        {/* Account dropdown in top right corner */}
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button text-sm sm:text-base whitespace-nowrap px-2 sm:px-4"
            >
              Twoje konto
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ml-1 ${
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
                  {token ? (
                    <>
                      <a href="#" className="dropdown-item">
                        Ogłoszenia
                      </a>
                      <a href="#" className="dropdown-item">
                        Czat
                      </a>
                      <a href="#" className="dropdown-item">
                        Oceny
                      </a>
                      <a href="#" className="dropdown-item">
                        Profil
                      </a>
                      <a href="#" className="dropdown-item">
                        Ustawienia
                      </a>
                      {isAdmin && (
                        <button
                          onClick={handleGoToAdminPanel}
                          className="dropdown-button"
                        >
                          Panel administratora
                        </button>
                      )}
                      {isUser && (
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
                      {isStaff && (
                        <a href="#" className="dropdown-item">
                          Panel pracownika
                        </a>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-logout"
                      >
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <button
                      className="dropdown-logout w-full text-left"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      Zaloguj się
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Black search bar */}
      <div className="panel-search-bar w-full">
        <div className="search-bar-container flex items-center justify-between px-2 sm:px-6 h-full">
          {/* Icons on the left */}
          <div className="search-icons flex items-center gap-4">
            <img
              src={messengerIcon}
              alt="Messenger"
              className="search-icon cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleMessengerClick}
            />
            <img
              src={starIcon}
              alt="Star"
              className="search-icon cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleStarClick}
            />
          </div>

          {/* Search input in the center */}
          <div className="search-input-container flex-1 max-w-md mx-auto">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Wyszukaj smartfony..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </form>
          </div>

          {/* Voivodeship button on the right */}
          <div className="relative" ref={voivodeshipRef}>
            <button
              onClick={handleVoivodeshipClick}
              className="voivodeship-button"
            >
              {selectedVoivodeship}
              <svg
                className={`w-4 h-4 transition-transform ${
                  isVoivodeshipOpen ? "rotate-180" : ""
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

            {/* Voivodeship dropdown */}
            {isVoivodeshipOpen && (
              <div className="voivodeship-dropdown">
                <div className="py-1">
                  {voivodeships.map((voivodeship) => (
                    <div
                      key={voivodeship}
                      onClick={() => handleVoivodeshipSelect(voivodeship)}
                      className="voivodeship-item"
                    >
                      {voivodeship}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content with dark gradient background */}
      <div className="panel-content-with-search flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12">
          {/* Add announcement button - fixed visibility and positioning */}
          <div className="sticky top-2 xs:top-4 sm:top-5 md:top-6 w-full flex justify-center sm:justify-start mb-0 mt-1 xs:mt-2 z-10">
            <div className="w-full max-w-4xl mx-auto relative">
              <div className="absolute right-0 left-0 sm:left-auto sm:right-full mr-[-20px] xs:mr-[-25px] sm:mr-[-30px] md:mr-[-40px]">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 xs:px-5 sm:px-6 md:px-8 py-1.5 xs:py-2 sm:py-2.5 md:py-3 rounded-md sm:rounded-lg font-medium text-xs xs:text-sm sm:text-base md:text-lg shadow-lg sm:shadow-xl transition-colors animate-pulse-subtle w-auto min-w-[120px] xs:min-w-[140px] sm:min-w-[180px] md:min-w-[200px]">
                  Dodaj ogłoszenie
                </button>
              </div>
            </div>
          </div>

          {/* White content box - adjusted positioning with equal spacing */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-17 w-full max-w-4xl mx-auto min-h-[400px] sm:min-h-[500px] mt-10 mb-12 flex flex-col gap-6 sm:gap-8">
            {/* Reklama */}
            <div className="w-full h-24 sm:h-32 md:h-40 flex items-center justify-center border border-dashed border-gray-400 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg font-semibold text-gray-700">
              Reklama
            </div>
            {/* Okienka na smartfony */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="border border-black rounded-lg p-1 sm:p-2 flex flex-col items-center"
                >
                  <img
                    src="https://dummyimage.com/120x128/ddd/222"
                    alt="Smartfon"
                    className="mb-1 sm:mb-2 w-16 h-20 sm:w-24 sm:h-28 md:w-28 md:h-32 object-cover"
                  />
                  <div className="font-medium text-gray-800 mb-0.5 sm:mb-1 text-xs md:text-sm truncate w-full text-center">
                    Nazwa smartfona
                  </div>
                  <div className="font-bold text-sm sm:text-base md:text-lg text-gray-900">
                    999 zł
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate w-full text-center">
                    Warszawa
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 sm:mt-1 truncate w-full text-center">
                    Dodano: 31.07
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xxs xs:text-xs sm:text-sm px-1 sm:px-2">
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Zasady bezpieczeństwa
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Popularne wyszukiwania
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Jak działa MobliX
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Regulamin
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Polityka cookies
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors py-1 text-center"
          >
            Ustawienia plików cookies
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
