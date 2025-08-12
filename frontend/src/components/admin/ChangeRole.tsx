import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/MobileResponsive.css";
import { jwtDecode } from "jwt-decode";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
}

interface JwtPayLoad {
  sub: string;
  role: string;
  exp: number;
}

const ChangeRole: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      // Wyświetlenie informacji o tokenie w konsoli
      const tokenPreview = token.substring(0, 15) + "...";
      console.log("Używany token (fragment):", tokenPreview);

      try {
        const decoded = jwtDecode<JwtPayLoad>(token);
        console.log("Zdekodowany token:", {
          sub: decoded.sub,
          role: decoded.role,
          expDate: new Date(decoded.exp * 1000).toLocaleString(),
        });

        // Sprawdzamy czy rola użytkownika to ADMIN
        if (!(decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN")) {
          setError("Brak uprawnień do wyświetlania listy użytkowników. Wymagana rola ADMIN.");
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Błąd dekodowania tokenu:", error);
        setError("Błąd weryfikacji tokenu. Proszę zalogować się ponownie.");
        setLoading(false);
        return;
      }

      // Pomijamy sprawdzanie dostępności serwera przez HEAD request,
      // który powoduje błąd 403 i od razu wykonujemy właściwe zapytanie
      console.log("Próba pobrania listy użytkowników...");

      try {
        // Dodanie timeoutu dla zapytania
        const response = await axios.get<User[]>(
          "http://localhost:8088/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            timeout: 10000 // 10 sekund timeoutu
          }
        );

        console.log("Odpowiedź z serwera:", response.data);
        setUsers(response.data);
      } catch (err) {
        console.error("Błąd podczas pobierania użytkowników:", err);

        if (axios.isAxiosError(err)) {
          const statusCode = err.response?.status;
          const errorMessage = err.response?.data?.message || err.message;

          console.error(`Status: ${statusCode}, Komunikat: ${errorMessage}`);

          if (statusCode === 403) {
            setError("Brak uprawnień do pobrania listy użytkowników. Sprawdź czy masz rolę ADMIN.");
          } else if (err.code === 'ECONNABORTED') {
            setError("Upłynął limit czasu połączenia. Spróbuj ponownie później.");
          } else if (!err.response) {
            setError("Błąd sieci. Sprawdź czy backend jest uruchomiony na porcie 8088 i spróbuj ponownie.");

            // Spróbuj ponownie za 5 sekund
            setTimeout(() => {
              fetchUsers();
            }, 5000);
          } else {
            setError(
              `Nie udało się pobrać listy użytkowników. Błąd: ${statusCode} - ${errorMessage}`
            );
          }
        } else {
          setError("Nie udało się pobrać listy użytkowników. Spróbuj ponownie.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      setSuccessMessage(null);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      await axios.put(
        `http://localhost:8088/api/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update user role in the local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      setSuccessMessage(`Pomyślnie zmieniono rolę użytkownika ID: ${userId}`);
    } catch (err) {
      setError("Nie udało się zmienić roli użytkownika. Spróbuj ponownie.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const goBack = () => {
    navigate("/admin");
  };

  // Sprawdzanie roli użytkownika
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      // Poprawiona weryfikacja ról
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Ładowanie użytkowników...</p>
        </div>
      </div>
    );
  }

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
                      {isAdmin && location.pathname !== '/admin/change-role' && (
                        <a
                          href="/admin"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDropdownOpen(false);
                            navigate("/admin");
                          }}
                          className="dropdown-item"
                        >
                          Panel admina
                        </a>
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

      {/* Main content with dark gradient background */}
      <div className="panel-content-with-search flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12">
          {/* White content box - adjusted positioning with equal spacing */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-4xl mx-auto min-h-[400px] sm:min-h-[500px] mt-10 mb-12 flex flex-col gap-6 sm:gap-8">
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center">
              Zarządzanie rolami użytkowników
            </h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {successMessage}
              </div>
            )}

            {/* NAGŁÓWEK ZARZĄDZANIE UŻYTKOWNIKAMI */}
            <div className="w-full flex justify-center items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 bg-transparent">Zarządzanie użytkownikami</h1>
            </div>

            <div className="flex-grow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Lista użytkowników
              </h2>

              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Brak użytkowników do wyświetlenia.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-xs sm:text-sm leading-normal">
                        <th className="py-2 px-3 sm:py-3 sm:px-6 text-left border-b">
                          ID
                        </th>
                        <th className="py-2 px-3 sm:py-3 sm:px-6 text-left border-b">
                          Email
                        </th>
                        <th className="py-2 px-3 sm:py-3 sm:px-6 text-left border-b">
                          Nazwa użytkownika
                        </th>
                        <th className="py-2 px-3 sm:py-3 sm:px-6 text-left border-b">
                          Aktualna rola
                        </th>
                        <th className="py-2 px-3 sm:py-3 sm:px-6 text-left border-b">
                          Zmień rolę
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-xs sm:text-sm">
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 sm:py-3 sm:px-6">{user.id}</td>
                          <td className="py-2 px-3 sm:py-3 sm:px-6">{user.email}</td>
                          <td className="py-2 px-3 sm:py-3 sm:px-6">{user.username}</td>
                          <td className="py-2 px-3 sm:py-3 sm:px-6">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                user.role === "ADMIN"
                                  ? "bg-red-100 text-red-800"
                                  : user.role === "STAFF"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-2 px-3 sm:py-3 sm:px-6">
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            >
                              <option value="USER">USER</option>
                              <option value="STAFF">STAFF</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded self-start"
            >
              Powrót do panelu
            </button>
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

export default ChangeRole;
