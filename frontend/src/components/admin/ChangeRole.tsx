import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/MobileResponsive.css";
import { jwtDecode } from "jwt-decode";
import {
  MessageSquare,
  ShoppingBag,
  Star,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  UserCog,
  Mail,
  Tag,
  Crown,
  UserCheck,
  UserX,
  Trash2,
  Edit3,
  AlertTriangle,
  Check,
  X,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
          setError(
            "Brak uprawnień do wyświetlania listy użytkowników. Wymagana rola ADMIN."
          );
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
          "http://localhost:8080/api/admin/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000, // 10 sekund timeoutu
          }
        );

        console.log("Odpowiedź z serwera:", response.data);
        setUsers(response.data);
      } catch (err) {
        console.error("Błąd podczas pobierania użytkowników:", err);
        const e = err as any;
        const statusCode = e?.response?.status as number | undefined;
        const errorMessage = e?.response?.data?.message || e?.message || "";

        if (statusCode === 403) {
          setError(
            "Brak uprawnień do pobrania listy użytkowników. Sprawdź czy masz rolę ADMIN."
          );
        } else if (e?.code === "ECONNABORTED") {
          setError("Upłynął limit czasu połączenia. Spróbuj ponownie później.");
        } else if (!e?.response) {
          setError(
            "Błąd sieci. Sprawdź czy backend jest uruchomiony na porcie 8088 i spróbuj ponownie."
          );

          // Spróbuj ponownie za 5 sekund
          setTimeout(() => {
            fetchUsers();
          }, 5000);
        } else {
          setError(
            `Nie udało się pobrać listy użytkowników. Błąd: ${statusCode} - ${errorMessage}`
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  //zmiana roli uzytkownika
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
        `http://localhost:8080/api/admin/users/${userId}/role`,
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
  // Usuwanie użytkownika
  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Odśwież listę użytkowników po usunięciu
      fetchUsers();
    } catch (error) {
      setError("Błąd podczas usuwania użytkownika");
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

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="w-4 h-4" />;
      case "STAFF":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "STAFF":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  // Sprawdzanie roli użytkownika
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isStaff = false;
  let isUser = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      // Poprawiona weryfikacja ról
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <div className="flex items-center justify-center mt-4 gap-2">
            <UserCog className="w-5 h-5 text-purple-600" />
            <p className="text-gray-700">Ładowanie użytkowników...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* White header bar at top */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        {/* Logo in top left */}
        <div
          className="panel-logo text-lg sm:text-xl md:text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/main")}
          style={{ userSelect: "none" }}
        >
          MobliX
        </div>

        {/* Account dropdown in top right corner */}
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button text-sm sm:text-base whitespace-nowrap px-2 sm:px-4 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Twoje konto
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
                <div className="py-1">
                  {token ? (
                    <>
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
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/admin");
                          }}
                          className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                        >
                          <Shield className="w-4 h-4 text-red-600" />
                          Panel administratora
                        </button>
                      )}
                      {(isAdmin || isStaff) && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/staffpanel");
                          }}
                          className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                        >
                          <Users className="w-4 h-4 text-orange-600" />
                          Panel pracownika
                        </button>
                      )}
                      {(isAdmin || isStaff || isUser) && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/userpanel");
                          }}
                          className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          Panel użytkownika
                        </button>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
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
        <div className="container mx-auto px-4 relative pt-64 pb-12">
          {/* White content box - adjusted positioning with equal spacing */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-4xl mx-auto min-h-[400px] sm:min-h-[500px] mt-10 mb-12 flex flex-col gap-6 sm:gap-8">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center gap-3 mb-3">
                <UserCog className="w-8 h-8" />
                <h2 className="text-2xl sm:text-3xl font-bold">
                  System Zarządzania Użytkownikami
                </h2>
              </div>
              <p className="text-purple-100 text-sm sm:text-base">
                Kompleksowe narzędzie do administracji kontami użytkowników i
                zarządzania uprawnieniami
              </p>
            </div>

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

            {/* Search and Filter Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Szukaj po ID, nazwie użytkownika lub email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Role Filter Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRoleFilter("ALL")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      roleFilter === "ALL"
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Wszystkie
                    </div>
                  </button>
                  <button
                    onClick={() => setRoleFilter("USER")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      roleFilter === "USER"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Użytkownicy
                    </div>
                  </button>
                  <button
                    onClick={() => setRoleFilter("STAFF")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      roleFilter === "STAFF"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Staff
                    </div>
                  </button>
                  <button
                    onClick={() => setRoleFilter("ADMIN")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      roleFilter === "ADMIN"
                        ? "bg-red-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Admini
                    </div>
                  </button>
                </div>
              </div>

              {/* Results count */}
              <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  Znaleziono {filteredUsers.length} z {users.length}{" "}
                  użytkowników
                </span>
              </div>
            </div>

            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  Lista użytkowników
                </h2>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  {users.length === 0 ? (
                    <div className="flex flex-col items-center gap-3">
                      <UserX className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">
                        Brak użytkowników do wyświetlenia.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <Search className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500">
                        Nie znaleziono użytkowników spełniających kryteria
                        wyszukiwania.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setRoleFilter("ALL");
                        }}
                        className="text-purple-600 hover:text-purple-800 underline"
                      >
                        Wyczyść filtry
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            ID
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Nazwa użytkownika
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Aktualna rola
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            Zmień rolę
                          </div>
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Akcja
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{user.id}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {user.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {user.username}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {getRoleIcon(user.role)}
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  handleRoleChange(user.id, "USER")
                                }
                                className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                                  user.role === "USER"
                                    ? "bg-green-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-green-100"
                                }`}
                                title="Ustaw jako USER"
                              >
                                <User className="w-3 h-3" />
                                USER
                              </button>
                              <button
                                onClick={() =>
                                  handleRoleChange(user.id, "STAFF")
                                }
                                className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                                  user.role === "STAFF"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                                }`}
                                title="Ustaw jako STAFF"
                              >
                                <Shield className="w-3 h-3" />
                                STAFF
                              </button>
                              <button
                                onClick={() =>
                                  handleRoleChange(user.id, "ADMIN")
                                }
                                className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                                  user.role === "ADMIN"
                                    ? "bg-red-600 text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-red-100"
                                }`}
                                title="Ustaw jako ADMIN"
                              >
                                <Crown className="w-3 h-3" />
                                ADMIN
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Usuń
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* White footer bar at bottom */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xs xs:text-sm sm:text-base px-1 sm:px-2">
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

export default ChangeRole;
