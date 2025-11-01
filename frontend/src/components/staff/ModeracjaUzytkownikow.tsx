import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
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
  Star,
  Save,
  Edit,
  Globe,
  MapPin,
  FileText,
  Hash,
} from "lucide-react";
import "../../styles/MobileResponsive.css";
import "../../styles/UserPanel.css";

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
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token:", token);
      console.log("User role:", getUserRole());
      const response = await axios.get<UserModeration[]>(
        "http://localhost:8080/api/admin/users/moderation",
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
        `http://localhost:8080/api/admin/users/${userId}/details`,
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
        `http://localhost:8080/api/admin/users/${userDetails.id}`,
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
        `http://localhost:8080/api/admin/users/${userId}/activity-logs?limit=4`,
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
        `http://localhost:8080/api/admin/users/${selectedUser.id}/block`,
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
        `http://localhost:8080/api/admin/users/${userId}/unblock`,
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
    if (isAdmin) return true;
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
              <User className="w-4 h-4" />
              Twoje konto
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="py-1">
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
                      navigate("/user/your-opinions");
                    }}
                  >
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                    Twoje opinie
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
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/admin");
                      }}
                    >
                      <Shield className="w-4 h-4 text-red-600" />
                      Panel administratora
                    </button>
                  )}
                  {(isAdmin || isStaff) && (
                    <button
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/staffpanel");
                      }}
                    >
                      <Users className="w-4 h-4 text-orange-600" />
                      Panel pracownika
                    </button>
                  )}
                  {(isAdmin || isStaff || isUser) && (
                    <button
                      className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/userpanel");
                      }}
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      Panel użytkownika
                    </button>
                  )}
                  <div className="border-t my-1"></div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/";
                    }}
                    className="dropdown-logout flex items-center gap-3 px-4 py-2"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    Wyloguj
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-[80px] sm:pt-[100px] pb-16 max-w-6xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Moderacja Użytkowników
                  </h1>
                  <p className="text-blue-100">
                    {isAdmin
                      ? "Zarządzaj wszystkimi użytkownikami systemu"
                      : "Moderuj użytkowników z rolą USER"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Szukaj użytkownika..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">Ładowanie użytkowników...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">
                      Brak użytkowników do wyświetlenia
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Użytkownik
                          </th>
                          {isAdmin && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rola
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ostatnia aktywność
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Akcje
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            {isAdmin && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.role === "ADMIN"
                                      ? "bg-red-100 text-red-800"
                                      : user.role === "STAFF"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatRelativeTime(user.lastActivity)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isUserBlocked(user) ? (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                                  <Ban className="w-3 h-3" />
                                  Zablokowany
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  Aktywny
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => fetchUserDetails(user.id)}
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                                title="Podgląd/Edycja profilu"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {isUserBlocked(user) ? (
                                <button
                                  onClick={() => handleUnblockUser(user.id)}
                                  className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                                  title="Odblokuj"
                                >
                                  <Unlock className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowBlockModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                                  title="Zablokuj"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => fetchUserActivities(user.id)}
                                className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1"
                                title="Aktywność"
                              >
                                <Activity className="w-4 h-4" />
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
      </div>

      {/* Modal - Szczegóły/Edycja użytkownika */}
      {showDetailsModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Edycja użytkownika" : "Szczegóły użytkownika"}
              </h2>
              <div className="flex gap-2">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-800 p-2"
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
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Typ konta */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-800">
                  Typ konta:{" "}
                  {userDetails.accountType === "business"
                    ? "Firmowe"
                    : "Prywatne"}
                </p>
              </div>

              {/* Dane podstawowe */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Dane podstawowe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Typ konta */}
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4" />
                      Typ konta
                    </label>
                    {isEditing ? (
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                      <p className="font-medium text-gray-900">
                        {userDetails.accountType === "business"
                          ? "Konto firmowe"
                          : "Konto prywatne"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      Imię
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            firstName: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {userDetails.firstName || "Brak"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      Nazwisko
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lastName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
                        {userDetails.lastName || "Brak"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <p className="font-medium text-gray-900">
                      {userDetails.email}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4" />
                      Telefon
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium text-gray-900">
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    Dane firmowe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4" />
                        Nazwa firmy
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={editForm.companyName}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              companyName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {userDetails.companyName || "Brak"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <Hash className="w-4 h-4" />
                        NIP
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={editForm.nip}
                          onChange={(e) =>
                            setEditForm({ ...editForm, nip: e.target.value })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {userDetails.nip || "Brak"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        REGON
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={editForm.regon}
                          onChange={(e) =>
                            setEditForm({ ...editForm, regon: e.target.value })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {userDetails.regon || "Brak"}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4" />
                        Adres
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={editForm.address}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              address: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {userDetails.address || "Brak"}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4" />
                        Strona www
                      </label>
                      {isEditing ? (
                        <input
                          type="url"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          value={editForm.website}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              website: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="font-medium text-gray-900">
                          {userDetails.website ? (
                            <a
                              href={userDetails.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Informacje systemowe
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isAdmin && (
                    <div>
                      <label className="text-sm text-gray-500">Rola</label>
                      <p className="font-medium text-gray-900">
                        {userDetails.role}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data rejestracji
                    </label>
                    <p className="font-medium text-gray-900">
                      {formatDate(userDetails.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Ostatnia aktywność
                    </label>
                    <p className="font-medium text-gray-900">
                      {formatRelativeTime(userDetails.lastActivity)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Liczba ogłoszeń
                    </label>
                    <p className="font-medium text-gray-900">
                      {userDetails.advertisementCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status blokady */}
              {userDetails.blocked && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800">
                    Konto zablokowane
                  </p>
                  <p className="text-sm text-red-600">
                    Do: {formatDate(userDetails.blockedUntil)}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Powód: {userDetails.blockReason}
                  </p>
                </div>
              )}

              {/* Przyciski akcji */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={handleSaveUserDetails}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
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
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                Historia aktywności
              </h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {userActivities.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Brak aktywności użytkownika
                </p>
              ) : (
                <div className="space-y-3">
                  {userActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {activity.message}
                          </p>
                          {activity.details && (
                            <p className="text-sm text-gray-500 mt-1">
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

export default ModeracjaUzytkownikow;
