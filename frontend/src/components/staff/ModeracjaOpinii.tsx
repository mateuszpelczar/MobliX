import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import {
  MessageSquare,
  ShoppingBag,
  Star,
  User,
  Shield,
  Users,
  LogOut,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Calendar,
  StarHalf,
  Filter,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface Opinion {
  id: number;
  userId: number;
  advertisementId: number;
  userName: string;
  rating: number;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  advertisementTitle: string;
}

const ModeracjaOpinii: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("wszystkie"); // Default: wszystkie
  const dropdownRef = useRef<HTMLDivElement>(null);

  // API state
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [allOpinions, setAllOpinions] = useState<Opinion[]>([]); // Store all opinions for counting
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOpinion, setSelectedOpinion] = useState<Opinion | null>(null);
  const [predefinedReason, setPredefinedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const token = localStorage.getItem("token");
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  // Fetch opinions from API based on selected filter
  const fetchOpinions = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Najpierw pobierz wszystkie opinie dla liczników
      const pendingRes = await axios.get<Opinion[]>(
        "http://localhost:8080/api/opinions/pending",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const approvedRes = await axios.get<Opinion[]>(
        "http://localhost:8080/api/opinions/status/APPROVED",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rejectedRes = await axios.get<Opinion[]>(
        "http://localhost:8080/api/opinions/status/REJECTED",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const allOpinionsData = [
        ...pendingRes.data,
        ...approvedRes.data,
        ...rejectedRes.data,
      ];
      setAllOpinions(allOpinionsData);

      // Teraz ustaw wyświetlane opinie według filtra
      if (selectedFilter === "wszystkie") {
        setOpinions(allOpinionsData);
      } else if (selectedFilter === "pending") {
        setOpinions(pendingRes.data);
      } else if (selectedFilter === "approved") {
        setOpinions(approvedRes.data);
      } else if (selectedFilter === "rejected") {
        setOpinions(rejectedRes.data);
      }
    } catch (err) {
      console.error("Error fetching opinions:", err);
      setError("Nie udało się pobrać opinii");
    } finally {
      setLoading(false);
    }
  };

  // Legacy function for backward compatibility
  const fetchPendingOpinions = () => fetchOpinions();

  // Approve opinion
  const handleApprove = async (opinionId: number) => {
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:8080/api/opinions/${opinionId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh the list after approval
      await fetchPendingOpinions();
    } catch (err) {
      console.error("Error approving opinion:", err);
      alert("Nie udało się zatwierdzić opinii");
    }
  };

  // Open reject modal
  const handleRejectClick = (opinion: Opinion) => {
    setSelectedOpinion(opinion);
    setShowRejectModal(true);
    setPredefinedReason("");
    setCustomReason("");
  };

  // Submit rejection
  const handleRejectSubmit = async () => {
    if (!selectedOpinion || !token) return;

    const finalReason =
      predefinedReason === "Inne" ? customReason.trim() : predefinedReason;

    if (!finalReason) {
      alert("Wybierz powód odrzucenia");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/opinions/${selectedOpinion.id}/reject`,
        { rejectionReason: finalReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Refresh the list after rejection
      await fetchPendingOpinions();
      setShowRejectModal(false);
      setSelectedOpinion(null);
    } catch (err) {
      console.error("Error rejecting opinion:", err);
      alert("Nie udało się odrzucić opinii");
    }
  };

  // Fetch opinions on component mount and when filter changes
  useEffect(() => {
    if (isAdmin || isStaff) {
      fetchOpinions();
    }
  }, [isAdmin, isStaff, selectedFilter]);

  const predefinedReasons = [
    "Spam",
    "Wulgarne treści",
    "Niewłaściwe treści",
    "Treści obraźliwe",
    "Nieprawdziwe informacje",
    "Inne",
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <StarHalf
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  // Get status badge for opinion
  const getStatusBadge = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "PENDING":
        return (
          <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            Oczekuje
          </div>
        );
      case "APPROVED":
        return (
          <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Zaakceptowane
          </div>
        );
      case "REJECTED":
        return (
          <div className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            Odrzucone
          </div>
        );
    }
  };

  // Filter opinions based on search
  const filteredOpinions = opinions.filter((opinion) => {
    const matchesSearch =
      opinion.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opinion.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opinion.advertisementTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header like AdminPanel */}
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
              className="account-dropdown-button flex items-center gap-2"
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
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
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
                  <button
                    onClick={handleLogout}
                    className="dropdown-item w-full text-left bg-white text-black flex items-center gap-3 px-4 py-2"
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

      {/* Content*/}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div
          className="container mx-auto px-4 relative pt-12 pb-12 max-w-6xl"
          style={{ paddingTop: "550px" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Star className="w-8 h-8 text-orange-600" />
                  Moderacja opinii
                </h2>
                <p className="text-gray-600 mt-2">
                  Zarządzaj i moderuj opinie użytkowników
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-600">
                    {loading
                      ? "..."
                      : allOpinions.filter((op) => op.status === "PENDING")
                          .length}
                  </div>
                  <div className="text-xs text-yellow-500">Oczekujące</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <div className="text-lg font-bold text-green-600">
                    {loading
                      ? "..."
                      : allOpinions.filter((op) => op.status === "APPROVED")
                          .length}
                  </div>
                  <div className="text-xs text-green-500">Zaakceptowane</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                  <div className="text-lg font-bold text-gray-600">
                    {loading
                      ? "..."
                      : allOpinions.filter((op) => op.status === "REJECTED")
                          .length}
                  </div>
                  <div className="text-xs text-gray-500">Odrzucone</div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                >
                  <option value="wszystkie" className="text-black">
                    Wszystkie [{allOpinions.length}]
                  </option>
                  <option value="pending" className="text-black">
                    Oczekujące [
                    {allOpinions.filter((op) => op.status === "PENDING").length}
                    ]
                  </option>
                  <option value="approved" className="text-black">
                    Zaakceptowane [
                    {
                      allOpinions.filter((op) => op.status === "APPROVED")
                        .length
                    }
                    ]
                  </option>
                  <option value="rejected" className="text-black">
                    Odrzucone [
                    {
                      allOpinions.filter((op) => op.status === "REJECTED")
                        .length
                    }
                    ]
                  </option>
                </select>
              </div>

              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Szukaj opinii, użytkowników..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Reviews List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Ładowanie opinii...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOpinions.map((opinion) => (
                  <div
                    key={opinion.id}
                    onClick={() =>
                      navigate(`/smartfon/${opinion.advertisementId}#opinie`)
                    }
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-orange-400"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Opinion Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                {renderStars(opinion.rating)}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {opinion.rating}/5
                              </span>
                            </div>
                            <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-orange-600 transition-colors">
                              {opinion.advertisementTitle}
                            </h3>
                          </div>
                          {getStatusBadge(opinion.status)}
                        </div>

                        {/* Opinion Comment */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-gray-700">{opinion.comment}</p>
                        </div>

                        {/* Rejection Reason (if rejected) */}
                        {opinion.status === "REJECTED" &&
                          opinion.rejectionReason && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-3">
                              <p className="text-sm font-medium text-red-800 mb-1">
                                Powód odrzucenia:
                              </p>
                              <p className="text-sm text-red-700">
                                {opinion.rejectionReason}
                              </p>
                            </div>
                          )}

                        {/* Opinion Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              Użytkownik:
                            </span>{" "}
                            {opinion.userName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(opinion.createdAt).toLocaleDateString(
                              "pl-PL"
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions - PENDING: Zatwierdź + Odrzuć, APPROVED: tylko Odrzuć */}
                      {(opinion.status === "PENDING" ||
                        opinion.status === "APPROVED") && (
                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                          {opinion.status === "PENDING" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(opinion.id);
                              }}
                              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Zatwierdź
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectClick(opinion);
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Odrzuć
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredOpinions.length === 0 && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {selectedFilter === "wszystkie" && "Brak opinii"}
                  {selectedFilter === "pending" && "Brak oczekujących opinii"}
                  {selectedFilter === "approved" &&
                    "Brak zaakceptowanych opinii"}
                  {selectedFilter === "rejected" && "Brak odrzuconych opinii"}
                </h3>
                <p className="text-gray-500">
                  {selectedFilter === "wszystkie" &&
                    "Nie ma jeszcze żadnych opinii w systemie."}
                  {selectedFilter === "pending" &&
                    "Wszystkie opinie zostały już zmoderowane."}
                  {selectedFilter === "approved" &&
                    "Nie ma jeszcze zaakceptowanych opinii."}
                  {selectedFilter === "rejected" &&
                    "Nie ma jeszcze odrzuconych opinii."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedOpinion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                Odrzuć opinię
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Opinia dla:{" "}
                  <span className="font-medium">
                    {selectedOpinion.advertisementTitle}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Użytkownik:{" "}
                  <span className="font-medium">
                    {selectedOpinion.userName}
                  </span>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Powód odrzucenia:
                </label>
                <select
                  value={predefinedReason}
                  onChange={(e) => setPredefinedReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Wybierz powód...</option>
                  {predefinedReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {predefinedReason === "Inne" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Własny powód (max 500 znaków):
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Wpisz powód odrzucenia..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {customReason.length}/500 znaków
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedOpinion(null);
                    setPredefinedReason("");
                    setCustomReason("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Potwierdź odrzucenie
                </button>
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
    </div>
  );
};

export default ModeracjaOpinii;
