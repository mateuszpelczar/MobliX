import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import SearchBar from "../overall/SearchBar";
import {
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Search,
  Eye,
  Ban,
  Unlock,
  Activity,
  Calendar,
  Mail,
  Phone,
  Building,
  Clock,
  X,
  MessageSquare,
  ShoppingBag,
  Save,
  Edit,
  Globe,
  MapPin,
  FileText,
  Hash,
  Bell,
  Heart,
  Plus,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface UserModeration {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  lastActivity: string | null;
  createdAt: string;
  advertisementCount: number;
  blocked: boolean;
  blockedUntil: string | null;
  blockReason: string | null;
}

interface UserDetails {
  id: number;
  username: string;
  email: string;
  role: string;
  accountType: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  nip: string;
  regon: string;
  address: string;
  website: string;
  lastActivity: string | null;
  createdAt: string;
  advertisementCount: number;
  blocked: boolean;
  blockedUntil: string | null;
  blockReason: string | null;
}

interface UserActivity {
  id: number;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  details: string;
  source: string;
  userEmail: string;
  ipAddress: string;
}

const ModeracjaUzytkownikow: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [users, setUsers] = useState<UserModeration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserModeration | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [blockDuration, setBlockDuration] = useState(15);
  const [blockReason, setBlockReason] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    accountType: "private",
    companyName: "",
    nip: "",
    regon: "",
    address: "",
    website: "",
  });

  const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded: JwtPayLoad = jwtDecode(token);
      return decoded.role;
    } catch (error) {
      return null;
    }
  };

  const userRole = getUserRole();
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF";
  const isUser = userRole === "USER";

  useEffect(() => {
    fetchUsers();
    fetchFavoriteCount();
  }, []);

  const fetchFavoriteCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{ count: number }>(
        `${import.meta.env.VITE_API_URL}/api/user/watched-ads/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFavoriteCount(response.data.count);
    } catch (error) {
      console.error("Error fetching favorite count:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMessengerClick = () => {
    navigate("/user/message");
  };

  const handleNotificationsClick = () => {
    navigate("/user/notifications");
  };

  const handleWatchedAdsClick = () => {
    navigate("/user/watched-ads");
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("User role:", getUserRole());
      const response = await axios.get<UserModeration[]>(
        `${import.meta.env.VITE_API_URL}/api/admin/users/moderation`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ DEBUG - sprawdź dane user@user.pl
      const blockedUser = response.data.find((u) => u.email === "user@user.pl");
      if (blockedUser) {
        console.log("=== USER@USER.PL DEBUG ===");
        console.log("Raw data from backend:", blockedUser);
        console.log("isBlocked:", blockedUser.blocked);
        console.log("blockedUntil:", blockedUser.blockedUntil);
        console.log("blockReason:", blockedUser.blockReason);

        const now = new Date();
        const blockedUntil = blockedUser.blockedUntil
          ? new Date(blockedUser.blockedUntil)
          : null;
        console.log("Current time:", now);
        console.log("Blocked until:", blockedUntil);
        console.log(
          "Is still blocked? (blockedUntil > now):",
          blockedUntil ? blockedUntil > now : false
        );
        console.log("isUserBlocked() result:", isUserBlocked(blockedUser));
        console.log("========================");
      }

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<UserDetails>(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserDetails(response.data);
      setEditForm({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phone: response.data.phone || "",
        email: response.data.email || "",
        accountType: response.data.accountType || "private",
        companyName: response.data.companyName || "",
        nip: response.data.nip || "",
        regon: response.data.regon || "",
        address: response.data.address || "",
        website: response.data.website || "",
      });
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Błąd podczas pobierania szczegółów użytkownika");
    }
  };

  const handleSaveUserDetails = async () => {
    if (!userDetails) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userDetails.id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Dane użytkownika zostały zaktualizowane");
      setIsEditing(false);
      await fetchUserDetails(userDetails.id);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Błąd podczas aktualizacji danych użytkownika");
    }
  };

  const fetchUserActivities = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<UserActivity[]>(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/activity-logs?limit=4`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserActivities(response.data);
      setShowActivityModal(true);
    } catch (error) {
      console.error("Error fetching user activities:", error);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${selectedUser.id}/block`,
        {
          durationMinutes: blockDuration,
          reason: blockReason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowBlockModal(false);
      setBlockReason("");
      await fetchUsers();
      alert("Użytkownik został zablokowany");
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Błąd podczas blokowania użytkownika");
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/unblock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
      alert("Użytkownik został odblokowany");
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Błąd podczas odblokowywania użytkownika");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nigdy";
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL");
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Nigdy";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Przed chwilą";
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`;
    return date.toLocaleDateString("pl-PL");
  };

  //funkcja sprawdzajaca czy uzytkownik jest zablokowany
  const isUserBlocked = (user: UserModeration): boolean => {
    if (!user.blocked) return false;
    if (!user.blockedUntil) return true;
    const now = new Date();
    const blockedUntil = new Date(user.blockedUntil);
    return blockedUntil > now;
  };

  const roleFilteredUsers = users.filter((user) => {
    if (isAdmin) {
      // Admin widzi wszystkich, ale może filtrować po roli
      if (roleFilter === "ALL") return true;
      return user.role === roleFilter;
    }
    if (isStaff) return user.role === "USER";
    return false;
  });

  const filteredUsers = roleFilteredUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
                          className="w-full text-left text-white hover:bg-purple-700 flex items-center gap-3 px-4 py-3 transition-colors"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/admin");
                          }}
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
                        onClick={() => {
                          localStorage.removeItem("token");
                          window.location.href = "/";
                        }}
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
          <div className="max-w-7xl mx-auto">
            {/* Header z ikoną Users */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-4 rounded-full">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Moderacja Użytkowników
                  </h1>
                  <p className="text-gray-300">
                    Zarządzaj użytkownikami systemu
                  </p>
                </div>
              </div>
            </div>

            {/* Wyszukiwarka i filtr roli */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj użytkowników..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
                />
              </div>

              {/* Filtr roli - tylko dla adminów */}
              {isAdmin && (
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700 appearance-none cursor-pointer"
                  >
                    <option value="ALL">Wszystkie role</option>
                    <option value="USER">USER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                <p className="mt-4 text-gray-300">Ładowanie użytkowników...</p>
              </div>
            )}

            {/* Users list */}
            {!loading && (
              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">
                      Brak użytkowników do wyświetlenia
                    </p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border border-gray-700"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {user.firstName} {user.lastName}
                              </h3>
                              <div className="text-sm text-gray-300">
                                {user.email}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {isAdmin && (
                                <span
                                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    user.role === "ADMIN"
                                      ? "bg-red-900/50 text-red-300"
                                      : user.role === "STAFF"
                                      ? "bg-orange-900/50 text-orange-300"
                                      : "bg-blue-900/50 text-blue-300"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              )}
                              {isUserBlocked(user) ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-900/50 text-red-300 flex items-center gap-1">
                                  <Ban className="w-3 h-3" />
                                  Zablokowany
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-900/50 text-green-300">
                                  Aktywny
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300 mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-400" />
                              <span>
                                {formatRelativeTime(user.lastActivity)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-400" />
                              <span>{user.advertisementCount} ogłoszeń</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => fetchUserDetails(user.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Podgląd/Edycja profilu"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Podgląd</span>
                            </button>
                            {isUserBlocked(user) ? (
                              <button
                                onClick={() => handleUnblockUser(user.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Odblokuj"
                              >
                                <Unlock className="w-4 h-4" />
                                <span>Odblokuj</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowBlockModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Zablokuj"
                              >
                                <Ban className="w-4 h-4" />
                                <span>Zablokuj</span>
                              </button>
                            )}
                            <button
                              onClick={() => fetchUserActivities(user.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              title="Aktywność"
                            >
                              <Activity className="w-4 h-4" />
                              <span>Aktywność</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal - Szczegóły/Edycja użytkownika */}
        {showDetailsModal && userDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-600 shadow-2xl">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? "Edycja użytkownika" : "Szczegóły użytkownika"}
                </h2>
                <div className="flex gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                      title="Edytuj"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setIsEditing(false);
                      setUserDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Typ konta */}
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-300">
                    Typ konta:{" "}
                    {userDetails.accountType === "business"
                      ? "Firmowe"
                      : "Prywatne"}
                  </p>
                </div>

                {/* Dane podstawowe */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Dane podstawowe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Typ konta */}
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4" />
                        Typ konta
                      </label>
                      {isEditing ? (
                        <select
                          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={editForm.accountType}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              accountType: e.target.value,
                            })
                          }
                        >
                          <option value="private">Konto prywatne</option>
                          <option value="business">Konto firmowe</option>
                        </select>
                      ) : (
                        <p className="font-medium text-gray-200">
                          {userDetails.accountType === "business"
                            ? "Konto firmowe"
                            : "Konto prywatne"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        Imię
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={editForm.firstName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              firstName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-200">
                          {userDetails.firstName || "Brak"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        Nazwisko
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={editForm.lastName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              lastName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-200">
                          {userDetails.lastName || "Brak"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </label>
                      <p className="font-medium text-gray-200">
                        {userDetails.email}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4" />
                        Telefon
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={editForm.phone}
                          onChange={(e) =>
                            setEditForm({ ...editForm, phone: e.target.value })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-200">
                          {userDetails.phone || "Brak"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dane firmowe - pokazuj gdy edytujemy i wybrano "business" LUB gdy nie edytujemy i użytkownik ma "business" */}
                {(isEditing
                  ? editForm.accountType === "business"
                  : userDetails.accountType === "business") && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-400" />
                      Dane firmowe
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4" />
                          Nazwa firmy
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={editForm.companyName}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                companyName: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="font-medium text-gray-200">
                            {userDetails.companyName || "Brak"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4" />
                          NIP
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={editForm.nip}
                            onChange={(e) =>
                              setEditForm({ ...editForm, nip: e.target.value })
                            }
                          />
                        ) : (
                          <p className="font-medium text-gray-200">
                            {userDetails.nip || "Brak"}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4" />
                          REGON
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={editForm.regon}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                regon: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="font-medium text-gray-200">
                            {userDetails.regon || "Brak"}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4" />
                          Adres
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={editForm.address}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                address: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="font-medium text-gray-200">
                            {userDetails.address || "Brak"}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4" />
                          Strona www
                        </label>
                        {isEditing ? (
                          <input
                            type="url"
                            className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={editForm.website}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                website: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="font-medium text-gray-200">
                            {userDetails.website ? (
                              <a
                                href={userDetails.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300 hover:underline"
                              >
                                {userDetails.website}
                              </a>
                            ) : (
                              "Brak"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Informacje systemowe */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Informacje systemowe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isAdmin && (
                      <div>
                        <label className="text-sm text-gray-400">Rola</label>
                        <p className="font-medium text-gray-200">
                          {userDetails.role}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Data rejestracji
                      </label>
                      <p className="font-medium text-gray-200">
                        {formatDate(userDetails.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Ostatnia aktywność
                      </label>
                      <p className="font-medium text-gray-200">
                        {formatRelativeTime(userDetails.lastActivity)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">
                        Liczba ogłoszeń
                      </label>
                      <p className="font-medium text-gray-200">
                        {userDetails.advertisementCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status blokady */}
                {userDetails.blocked && (
                  <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-300">
                      Konto zablokowane
                    </p>
                    <p className="text-sm text-red-400">
                      Do: {formatDate(userDetails.blockedUntil)}
                    </p>
                    <p className="text-sm text-red-400 mt-2">
                      Powód: {userDetails.blockReason}
                    </p>
                  </div>
                )}

                {/* Przyciski akcji */}
                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={handleSaveUserDetails}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Zapisz zmiany
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          firstName: userDetails.firstName || "",
                          lastName: userDetails.lastName || "",
                          phone: userDetails.phone || "",
                          email: userDetails.email || "",
                          accountType: userDetails.accountType || "private",
                          companyName: userDetails.companyName || "",
                          nip: userDetails.nip || "",
                          regon: userDetails.regon || "",
                          address: userDetails.address || "",
                          website: userDetails.website || "",
                        });
                      }}
                      className="flex-1 bg-gray-700 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      Anuluj
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal - Blokowanie */}
        {showBlockModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Zablokuj użytkownika
                </h2>
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason("");
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">
                  Zablokuj użytkownika: {selectedUser.email}
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Czas blokady
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={blockDuration}
                    onChange={(e) => setBlockDuration(parseInt(e.target.value))}
                  >
                    <option value={15}>15 minut</option>
                    <option value={1440}>24 godziny</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Powód blokady
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Opisz powód blokady..."
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleBlockUser}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    disabled={!blockReason.trim()}
                  >
                    Zablokuj
                  </button>
                  <button
                    onClick={() => {
                      setShowBlockModal(false);
                      setBlockReason("");
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Anuluj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal - Aktywność */}
        {showActivityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-600 shadow-2xl">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800">
                <h2 className="text-2xl font-bold text-white">
                  Historia aktywności
                </h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {userActivities.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    Brak aktywności użytkownika
                  </p>
                ) : (
                  <div className="space-y-3">
                    {userActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border border-gray-700 bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {activity.message}
                            </p>
                            {activity.details && (
                              <p className="text-sm text-gray-400 mt-1">
                                {activity.details}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Czarna stopka */}
        <footer className="bg-black text-white py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <a
                href="/jak-dziala-moblix"
                className="hover:text-purple-400 transition-colors"
              >
                Jak działa MobliX
              </a>
              <a
                href="/polityka-cookies"
                className="hover:text-purple-400 transition-colors"
              >
                Polityka cookies
              </a>
              <a
                href="/regulamin"
                className="hover:text-purple-400 transition-colors"
              >
                Regulamin
              </a>
              <a
                href="/zasady-bezpieczenstwa"
                className="hover:text-purple-400 transition-colors"
              >
                Zasady bezpieczeństwa
              </a>
            </div>
            <div className="text-center mt-4 text-gray-400 text-xs">
              © 2024 MobliX. Wszystkie prawa zastrzeżone.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ModeracjaUzytkownikow;
