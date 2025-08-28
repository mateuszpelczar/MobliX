import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/MobileResponsive.css";

const UserPanel: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isUser = userRole === "USER";
  const isStaff = userRole === "STAFF";

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div
          onClick={() => navigate("/main")}
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
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
              <div className="dropdown-menu">
                <div className="py-1">
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/your-ads");
                    }}
                  >
                    Ogłoszenia
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/message");
                    }}
                  >
                    Czat
                  </button>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/ratings");
                    }}
                  >
                    Oceny
                  </button>
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
      <div className="panel-content flex-grow w-full overflow-y-auto flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-12 lg:p-16 w-full max-w-5xl flex flex-col gap-4 sm:gap-8 md:gap-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 md:gap-8">
            <button
              onClick={() => navigate("/user/message")}
              className="user-btn bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg"
            >
              Wiadomości
            </button>

            {/* <button className="user-btn bg-green-500 hover:bg-green-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg">
              Historia transakcji
            </button> */}
            <button
              onClick={() => navigate("/user/addadvertisement")}
              className="user-btn bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg"
            >
              Dodaj ogłoszenie
            </button>
            <button
              onClick={() => navigate("/user/editAd")}
              className="user-btn bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg"
            >
              Zarządzaj ogłoszeniem
            </button>
            <button
              onClick={() => navigate("/user/personaldetails")}
              className="user-btn bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg"
            >
              Dane profilowe
            </button>
            <button
              onClick={() => navigate("/user/notifications")}
              className="user-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg"
            >
              Powiadomienia
            </button>
            <button
              onClick={() => navigate("/user/watched-ads")}
              className="user-btn bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 rounded-xl shadow-md transition-colors text-sm sm:text-base md:text-lg"
            >
              Obserwowane
            </button>
          </div>
        </div>
      </div>

      {/* White footer bar at bottom */}
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

export default UserPanel;
