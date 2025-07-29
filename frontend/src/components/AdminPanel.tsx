import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
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

      {/* Main content with dark gradient background */}
      <div className="panel-content">
        <h2 className="text-3xl font-bold text-white mb-4">
          Panel Administratora
        </h2>
        <p className="text-gray-300 text-lg">Tu bedzie panel admina</p>
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

export default AdminPanel;
