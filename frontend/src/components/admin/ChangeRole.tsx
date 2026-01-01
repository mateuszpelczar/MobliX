import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SearchBar from "../overall/SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  UserCog,
  Mail,
  Tag,
  Crown,
  UserX,
  Trash2,
  Edit3,
  Search,
  Filter,
  Bell,
  Heart,
  Plus,
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
  const [favoriteCount, setFavoriteCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchFavoriteCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFavoriteCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8080/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteCount(data.length);
      }
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");

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
        const e = err as {
          response?: { status?: number; data?: { message?: string } };
          message?: string;
          code?: string;
        };
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
      console.error("Błąd podczas zmiany roli:", err);
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
      console.error("Błąd podczas usuwania użytkownika:", error);
      setError("Błąd podczas usuwania użytkownika");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex justify-center items-center">
        <div className="text-center p-8 bg-gray-800 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <div className="flex items-center justify-center mt-4 gap-2">
            <UserCog className="w-5 h-5 text-purple-400" />
            <p className="text-white">Ładowanie użytkowników...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Czarny pasek nawigacji */}
      <nav className="bg-black text-white px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="text-2xl font-bold cursor-pointer hover:text-purple-400 transition-colors"
            onClick={() => navigate("/main")}
          >
            MobliX
          </div>

          {/* Wyszukiwarka */}
          <SearchBar />

          {/* Ikony i przyciski */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleMessengerClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Wiadomości"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <button
              onClick={handleNotificationsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Powiadomienia"
            >
              <Bell className="w-6 h-6" />
            </button>
            <button
              onClick={handleWatchedAdsClick}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative"
              title="Ulubione ogłoszenia"
            >
              <Heart className="w-6 h-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {favoriteCount > 9 ? "9+" : favoriteCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/user/addadvertisement")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Dodaj ogłoszenie
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
                Twoje konto
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-purple-600 rounded-lg shadow-xl z-50">
                  <div className="py-1">
                    {token ? (
                      <>
                        <button
                          className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/user/your-ads");
                          }}
                        >
                          <ShoppingBag className="w-4 h-4 text-blue-400" />
                          Ogłoszenia
                        </button>
                        <button
                          className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/user/message");
                          }}
                        >
                          <MessageSquare className="w-4 h-4 text-green-400" />
                          Czat
                        </button>
                        <button
                          className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/user/personaldetails");
                          }}
                        >
                          <User className="w-4 h-4 text-purple-400" />
                          Profil
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/admin");
                            }}
                            className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-red-400" />
                            Panel administratora
                          </button>
                        )}
                        {(isAdmin || isStaff) && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/staffpanel");
                            }}
                            className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          >
                            <Users className="w-4 h-4 text-orange-400" />
                            Panel pracownika
                          </button>
                        )}
                        {(isAdmin || isStaff || isUser) && (
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              navigate("/userpanel");
                            }}
                            className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          >
                            <User className="w-4 h-4 text-cyan-400" />
                            Panel użytkownika
                          </button>
                        )}
                        <div className="border-t border-purple-400 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          Wyloguj
                        </button>
                      </>
                    ) : (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
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
      </nav>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header z ikoną UserCog */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-4 rounded-full">
                <UserCog className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  System Zarządzania Użytkownikami
                </h1>
                <p className="text-gray-300">
                  Kompleksowe narzędzie do administracji kontami użytkowników i
                  zarządzania uprawnieniami
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
              {successMessage}
            </div>
          )}

          {/* Sekcja wyszukiwania i filtrów */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Pasek wyszukiwania */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Szukaj po ID, nazwie użytkownika lub email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Przyciski filtrów ról */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setRoleFilter("ALL")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    roleFilter === "ALL"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
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
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
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
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
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
                      : "bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Admini
                  </div>
                </button>
              </div>
            </div>

            {/* Licznik wyników */}
            <div className="mt-3 text-sm text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                Znaleziono {filteredUsers.length} z {users.length} użytkowników
              </span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">
                Lista użytkowników
              </h2>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                {users.length === 0 ? (
                  <div className="flex flex-col items-center gap-3">
                    <UserX className="w-12 h-12 text-gray-500" />
                    <p className="text-gray-400">
                      Brak użytkowników do wyświetlenia.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Search className="w-12 h-12 text-gray-500" />
                    <p className="text-gray-400">
                      Nie znaleziono użytkowników spełniających kryteria
                      wyszukiwania.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setRoleFilter("ALL");
                      }}
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      Wyczyść filtry
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto bg-gray-700 border border-gray-600 rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-600">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          ID
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nazwa użytkownika
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Aktualna rola
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          Zmień rolę
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4" />
                          Akcja
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-600">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-700 transition-colors"
                      >
                        <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-white">
                          #{user.id}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">
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
                              onClick={() => handleRoleChange(user.id, "USER")}
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
                              onClick={() => handleRoleChange(user.id, "STAFF")}
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
                              onClick={() => handleRoleChange(user.id, "ADMIN")}
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

      {/* Czarna stopka jak w MainPanel */}
      <footer className="bg-black text-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <a
              href="/zasady-bezpieczenstwa"
              className="hover:text-purple-400 transition-colors"
            >
              Zasady bezpieczeństwa
            </a>
            <a
              href="/jak-dziala-moblix"
              className="hover:text-purple-400 transition-colors"
            >
              Jak działa MobliX
            </a>
            <a
              href="/regulamin"
              className="hover:text-purple-400 transition-colors"
            >
              Regulamin
            </a>
            <a
              href="/polityka-cookies"
              className="hover:text-purple-400 transition-colors"
            >
              Polityka cookies
            </a>
          </div>
          <div className="text-center text-gray-400 text-sm mt-4">
            © 2024 MobliX. Wszelkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ChangeRole;
