import React, { useState } from "react";

const UserPanel: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  // No dropdown logic needed for UserPanel header
  return (
    <div className="panel-layout">
      {/* White header bar at top */}
      <div className="panel-header">
        <div className="panel-logo">MobliX</div>
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
              <div className="dropdown-menu">
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
                  <a href="#" className="dropdown-item">
                    Profil
                  </a>
                  <a href="#" className="dropdown-item">
                    Ustawienia
                  </a>
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

      {/* Main content with large white box and user buttons */}
      <div className="panel-content flex justify-center items-center min-h-[600px]">
        <div className="bg-white rounded-2xl shadow-2xl p-16 w-full max-w-5xl flex flex-col gap-10">
          <div className="grid grid-cols-2 gap-8">
            <button className="user-btn bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Wiadomości
            </button>
            <button className="user-btn bg-purple-500 hover:bg-purple-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Zarządzaj ogłoszeniem
            </button>
            <button className="user-btn bg-green-500 hover:bg-green-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Przeglądaj historię transakcji
            </button>
            <button className="user-btn bg-pink-500 hover:bg-pink-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Dodaj ogłoszenie
            </button>
            <button className="user-btn bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Edytuj ogłoszenie
            </button>
            <button className="user-btn bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Edytuj dane profilowe
            </button>
            <button className="user-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Powiadomienia
            </button>
            <button className="user-btn bg-teal-500 hover:bg-teal-600 text-white font-semibold py-6 px-8 rounded-xl shadow-md transition-colors text-lg">
              Obserwowane przedmioty
            </button>
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

export default UserPanel;
