import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import messengerIcon from "../icons/messenger.png";
import starIcon from "../icons/star.png";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const MainPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVoivodeshipOpen, setIsVoivodeshipOpen] = useState(false);
  const [selectedVoivodeship, setSelectedVoivodeship] = useState("Województwo");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const voivodeshipRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
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

  const handleAccountClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
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
      isAdmin = decoded.role === "ADMIN";
      isUser = decoded.role === "USER";
      isStaff = decoded.role === "STAFF";
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
    <div className="panel-layout">
      {/* White header bar at top */}
      <div className="panel-header">
        {/* Logo in top left */}
        <div className="panel-logo">MobliX</div>

        {/* Account dropdown in top right corner */}
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleAccountClick}
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

            {/* Dropdown menu */}
            {isDropdownOpen && token && (
              <div className="dropdown-menu">
                <div className="py-1">
                  {/* Common options for all logged users */}
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

                  {/* Role-specific panels */}
                  {isAdmin && (
                    <button
                      onClick={handleGoToAdminPanel}
                      className="dropdown-button"
                    >
                      Panel administratora
                    </button>
                  )}
                  {isUser && (
                    <a href="#" className="dropdown-item">
                      Panel użytkownika
                    </a>
                  )}
                  {isStaff && (
                    <a href="#" className="dropdown-item">
                      Panel pracownika
                    </a>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-1"></div>

                  {/* Logout button */}
                  <button onClick={handleLogout} className="dropdown-logout">
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Black search bar */}
      <div className="panel-search-bar">
        <div className="search-bar-container">
          {/* Icons on the left */}
          <div className="search-icons">
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
          <div className="search-input-container">
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
      <div className="panel-content-with-search">
        {/* Add announcement button on the left above white box */}
        <div className="absolute left-8 top-1/4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-lg transition-colors">
            Dodaj ogłoszenie
          </button>
        </div>

        {/* White content box - moved lower */}
        <div className="bg-white rounded-lg shadow-lg p-12 w-full max-w-4xl mx-auto min-h-[500px] mt-16">
          <div className="text-center flex flex-col justify-center h-full">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              Strona Główna
            </h1>
            <p className="text-gray-600 text-xl">Witaj w panelu głównym</p>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom */}
      <div className="panel-footer">
        <div className="flex justify-center items-center h-full gap-8 text-sm">
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors"
          >
            Zasady bezpieczeństwa
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors"
          >
            Popularne wyszukiwania
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors"
          >
            Jak działa MobliX
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors"
          >
            Regulamin
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors"
          >
            Polityka cookies
          </a>
          <a
            href="#"
            className="text-black hover:text-gray-600 transition-colors"
          >
            Ustawienia plików cookies
          </a>
        </div>
      </div>
    </div>
  );
};

export default MainPanel;
