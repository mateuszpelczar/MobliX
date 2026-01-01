import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../overall/SearchBar";
import {
  MessageSquare,
  ShoppingBag,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Mail,
  Phone,
  Lock,
  UserCircle,
  Building2,
  MapPin,
  FileText,
  Globe,
  Hash,
  Users2,
  Eye,
  EyeOff,
  Save,
  Bell,
  Heart,
  Search,
  Plus,
} from "lucide-react";

type JwtPayLoad = { sub: string; role: string; exp: number };

type UserData = {
  id: number;
  username: string;
  email: string;
  role: string;
  accountType?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  nip?: string;
  regon?: string;
  address?: string;
  website?: string;
};

const PersonalDetails: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Prefill from token if possible
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;
  let tokenSub: string | undefined = undefined;
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
      tokenSub = decoded.sub;
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  // Form state
  const [accountType, setAccountType] = useState<"personal" | "business">(
    "personal"
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(() =>
    tokenSub && tokenSub.includes("@") ? tokenSub : ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  // Business account fields
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [regon, setRegon] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  // Loading state
  const [loading, setLoading] = useState(true);

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

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get<UserData>(
          "http://localhost:8080/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data;

        // Ustawienie danych użytkownika
        setAccountType(
          (userData.accountType as "personal" | "business") || "personal"
        );
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setEmail(userData.email || "");
        setPhone(userData.phone || "");

        // Dane firmowe
        if (userData.accountType === "business") {
          setCompanyName(userData.companyName || "");
          setNip(userData.nip || "");
          setRegon(userData.regon || "");
          setAddress(userData.address || "");
          setWebsite(userData.website || "");
        }
      } catch (error) {
        console.error("Błąd podczas pobierania danych użytkownika:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status: number } };
          if (axiosError.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchFavoriteCount();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Brak autoryzacji");
      return;
    }

    try {
      const updateData = {
        accountType,
        firstName,
        lastName,
        phone,
        password: password || undefined, // Tylko jeśli użytkownik chce zmienić hasło
        ...(accountType === "business" && {
          companyName,
          nip,
          regon,
          address,
          website,
        }),
      };

      await axios.put("http://localhost:8080/api/auth/me", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(
        `Dane ${
          accountType === "business" ? "firmowe" : "osobiste"
        } zostały zaktualizowane!`
      );
      setPassword(""); // Wyczyść pole hasła po zapisie
    } catch (error) {
      console.error("Błąd podczas aktualizacji danych:", error);
      alert("Wystąpił błąd podczas zapisywania danych");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-xl text-white">Ładowanie...</div>
      </div>
    );
  }

  const handleMessengerClick = () => navigate("/user/message");
  const handleNotificationsClick = () => navigate("/user/notifications");
  const handleWatchedAdsClick = () => navigate("/user/watchedads");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      searchQuery.trim()
        ? `/smartfony?search=${searchQuery.trim()}`
        : "/smartfony"
    );
  };

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

          {/* Wyszukiwarka z AI */}
          <div className="flex-1 max-w-2xl">
            <SearchBar />
          </div>

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
                        onClick={handleGoToAdminPanel}
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-red-400" />
                        Panel administratora
                      </button>
                    )}
                    {(isAdmin || isStaff) && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/staffpanel");
                        }}
                      >
                        <Users className="w-4 h-4 text-orange-400" />
                        Panel pracownika
                      </button>
                    )}
                    {(isAdmin || isStaff || isUser) && (
                      <button
                        className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/userpanel");
                        }}
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header z ikoną użytkownika */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6 flex items-center gap-4">
            <div className="bg-gray-700 p-4 rounded-full">
              <UserCircle className="w-12 h-12 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dane profilowe</h1>
              <p className="text-gray-300">
                Zarządzaj swoimi informacjami osobistymi
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Typ konta */}
            <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users2 className="w-5 h-5 text-purple-400" />
                Typ konta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType("personal")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    accountType === "personal"
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-600 bg-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User
                      className={`w-6 h-6 ${
                        accountType === "personal"
                          ? "text-purple-400"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="text-left">
                      <div className="font-medium text-white">
                        Konto prywatne
                      </div>
                      <div className="text-sm text-gray-400">
                        Dla użytkowników indywidualnych
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("business")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    accountType === "business"
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-600 bg-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2
                      className={`w-6 h-6 ${
                        accountType === "business"
                          ? "text-purple-400"
                          : "text-gray-400"
                      }`}
                    />
                    <div className="text-left">
                      <div className="font-medium text-white">
                        Konto firmowe
                      </div>
                      <div className="text-sm text-gray-400">
                        Dla firm i przedsiębiorców
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            {/* Informacje osobiste */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-purple-400" />
                Informacje osobiste
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <User className="w-4 h-4 text-gray-400" />
                    Imię
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="np. Jan"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <User className="w-4 h-4 text-gray-400" />
                    Nazwisko
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="np. Kowalski"
                  />
                </div>
              </div>
            </div>

            {/* Informacje kontaktowe */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Informacje kontaktowe
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="np. jan.kowalski@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Numer telefonu
                  </label>
                  <input
                    inputMode="tel"
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="np. 500 600 700"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Hasło
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Informacje o firmie - tylko dla kont firmowych */}
            {accountType === "business" && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  Informacje o firmie
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        Nazwa firmy
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="np. MojeFirma Sp. z o.o."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Hash className="w-4 h-4 text-gray-400" />
                        NIP
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={nip}
                        onChange={(e) => setNip(e.target.value)}
                        placeholder="np. 123-456-78-90"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <FileText className="w-4 h-4 text-gray-400" />
                        REGON
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={regon}
                        onChange={(e) => setRegon(e.target.value)}
                        placeholder="np. 123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <Globe className="w-4 h-4 text-gray-400" />
                        Strona internetowa
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="np. https://mojafirma.pl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Adres firmy
                    </label>
                    <input
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="np. ul. Przykładowa 123, 00-001 Warszawa"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Przyciski akcji */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Zapisz zmiany
              </button>
            </div>
          </form>
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

export default PersonalDetails;
