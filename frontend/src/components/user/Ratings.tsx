import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../../styles/MobileResponsive.css";

type Rating = {
  id: number;
  title: string;
  user: string;
  date: string;
  status: "received" | "to-rate" | "rated";
  value?: number;
  comment?: string;
};

const mockRatings: Rating[] = [
  {
    id: 1,
    title: "iPhone 13 128GB",
    user: "Jan Kowalski",
    date: "2025-08-20",
    status: "received",
    value: 5,
    comment: "Wszystko OK!",
  },
  {
    id: 2,
    title: "Samsung S22 Ultra",
    user: "Anna Nowak",
    date: "2025-08-18",
    status: "to-rate",
  },
  {
    id: 3,
    title: "Pixel 7 Pro",
    user: "Marek Testowy",
    date: "2025-08-15",
    status: "rated",
    value: 4,
    comment: "Dobry kontakt.",
  },
  {
    id: 4,
    title: "Xiaomi 12",
    user: "Kasia Test",
    date: "2025-08-10",
    status: "to-rate",
  },
  {
    id: 5,
    title: "iPhone 12 Pro",
    user: "Jan Kowalski",
    date: "2025-08-05",
    status: "received",
    value: 3,
    comment: "Mogło być szybciej.",
  },
  {
    id: 6,
    title: "Samsung S21",
    user: "Anna Nowak",
    date: "2025-08-01",
    status: "rated",
    value: 5,
    comment: "Super!",
  },
];

const tabLabels = [
  { key: "received", label: "Otrzymane oceny" },
  { key: "to-rate", label: "Sprzedawca do oceny" },
  { key: "rated", label: "Wystawione oceny" },
];

const Ratings: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"received" | "to-rate" | "rated">(
    "received"
  );

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

  const filtered = mockRatings.filter((r) => r.status === activeTab);

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
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
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
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

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12 max-w-5xl">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 min-h-[300px]">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Oceny
            </h2>
            {/* Tabs */}
            <div className="flex gap-2 sm:gap-4 mb-4">
              {tabLabels.map((tab) => (
                <button
                  key={tab.key}
                  className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors text-sm sm:text-base ${
                    activeTab === tab.key
                      ? "border-purple-600 text-purple-700 bg-gray-50"
                      : "border-transparent text-gray-600 bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab.key as any)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex flex-col gap-3">
              {filtered.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  Brak ocen w tej kategorii.
                </div>
              )}
              {filtered.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-row items-center justify-between border rounded-lg px-4 py-3 bg-gray-50"
                >
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {r.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {r.user} • {r.date}
                    </div>
                    {r.value && (
                      <div className="text-yellow-500 text-sm">
                        Ocena: {r.value}/5
                      </div>
                    )}
                    {r.comment && (
                      <div className="text-gray-700 text-xs mt-1">
                        "{r.comment}"
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row gap-2 ml-4">
                    {activeTab === "to-rate" && (
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs sm:text-sm">
                        Oceń
                      </button>
                    )}
                    {activeTab === "rated" && (
                      <>
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs sm:text-sm">
                          Edytuj
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs sm:text-sm">
                          Usuń
                        </button>
                      </>
                    )}
                    {activeTab === "received" && (
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs sm:text-sm">
                        Zobacz
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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

export default Ratings;
