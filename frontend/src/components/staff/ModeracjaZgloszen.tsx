import React, { useState, useEffect, useRef } from "react";
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
  Flag,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Trash2,
  AlertOctagon,
  FileText,
  Bell,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

interface AdvertisementReport {
  id: number;
  advertisementId: number;
  advertisementTitle: string;
  reporterName: string;
  reporterEmail: string;
  ownerName: string;
  ownerEmail: string;
  reason: string;
  reasonLabel: string;
  comment: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  moderatorNote?: string;
  reviewedByName?: string;
  createdAt: string;
  reviewedAt?: string;
}

type TabType = "ALL" | "PENDING" | "ACCEPTED" | "REJECTED";

const ModeracjaZgloszen: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [reports, setReports] = useState<AdvertisementReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AdvertisementReport[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;

  // Modal states
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<AdvertisementReport | null>(null);
  const [warningText, setWarningText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Check user role from JWT token
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

  useEffect(() => {
    fetchReports();
    fetchFavoriteCount();
  }, []);

  useEffect(() => {
    filterReports();
  }, [activeTab, reports, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const fetchFavoriteCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/favorites`, {
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
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      searchTerm.trim()
        ? `/smartfony?search=${searchTerm.trim()}`
        : "/smartfony"
    );
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get<AdvertisementReport[]>(
        `${import.meta.env.VITE_API_URL}/api/reports`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReports(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Nie udało się pobrać zgłoszeń");
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by tab
    if (activeTab !== "ALL") {
      filtered = filtered.filter((r) => r.status === activeTab);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.advertisementTitle.toLowerCase().includes(search) ||
          r.reporterName.toLowerCase().includes(search) ||
          r.ownerName.toLowerCase().includes(search) ||
          r.reasonLabel.toLowerCase().includes(search) ||
          r.comment.toLowerCase().includes(search)
      );
    }

    setFilteredReports(filtered);
  };

  const handleAcceptClick = (report: AdvertisementReport) => {
    setSelectedReport(report);
    setWarningText("");
    setShowActionModal(true);
  };

  const handleDeleteAction = async () => {
    if (!selectedReport) return;

    if (
      !window.confirm(
        `Czy na pewno chcesz USUNĄĆ ogłoszenie "${selectedReport.advertisementTitle}"? Ta operacja jest nieodwracalna.`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports/${selectedReport.id}/review`,
        {
          action: "DELETE",
          moderatorNote: "Ogłoszenie usunięte przez moderatora",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Ogłoszenie zostało usunięte. Właściciel otrzymał powiadomienie.");
      setShowActionModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      console.error("Error deleting advertisement:", err);
      alert(err.response?.data || "Błąd podczas usuwania ogłoszenia");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWarningAction = async () => {
    if (!selectedReport) return;

    if (!warningText.trim()) {
      alert("Proszę wpisać treść ostrzeżenia");
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports/${selectedReport.id}/review`,
        {
          action: "WARNING",
          moderatorNote: warningText,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Ostrzeżenie zostało wysłane do właściciela ogłoszenia.");
      setShowActionModal(false);
      setSelectedReport(null);
      setWarningText("");
      fetchReports();
    } catch (err: any) {
      console.error("Error sending warning:", err);
      alert(err.response?.data || "Błąd podczas wysyłania ostrzeżenia");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reportId: number) => {
    if (!window.confirm("Czy na pewno chcesz odrzucić to zgłoszenie?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reports/${reportId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Zgłoszenie zostało odrzucone");
      fetchReports();
    } catch (err: any) {
      console.error("Error rejecting report:", err);
      alert(err.response?.data || "Błąd podczas odrzucania zgłoszenia");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Oczekujące
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Rozwiązane
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            Odrzucone
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
            {status}
          </span>
        );
    }
  };

  const getTabCount = (tab: TabType) => {
    if (tab === "ALL") return reports.length;
    return reports.filter((r) => r.status === tab).length;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="text-center">
          <Flag className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Ładowanie zgłoszeń...</p>
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
        <div className="max-w-7xl mx-auto">
          {/* Header z ikoną Flag */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-600 p-4 rounded-full">
                <Flag className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Moderacja zgłoszeń
                </h1>
                <p className="text-gray-300">
                  Zarządzaj zgłoszeniami dotyczącymi ogłoszeń
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800 rounded-lg shadow-lg mb-6 border border-gray-700">
            <div className="flex flex-wrap border-b border-gray-700">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "ALL"
                    ? "border-b-2 border-purple-500 text-purple-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Wszystkie ({getTabCount("ALL")})
              </button>
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "PENDING"
                    ? "border-b-2 border-yellow-500 text-yellow-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Oczekujące ({getTabCount("PENDING")})
              </button>
              <button
                onClick={() => setActiveTab("ACCEPTED")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "ACCEPTED"
                    ? "border-b-2 border-green-500 text-green-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Rozwiązane ({getTabCount("ACCEPTED")})
              </button>
              <button
                onClick={() => setActiveTab("REJECTED")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "REJECTED"
                    ? "border-b-2 border-red-500 text-red-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Odrzucone ({getTabCount("REJECTED")})
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-300">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}

          {/* Reports Cards */}
          {currentReports.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">
                Brak zgłoszeń w tej kategorii
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {currentReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-purple-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-purple-400" />
                        <h3 className="text-lg font-semibold text-white">
                          {report.advertisementTitle}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400 mt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(report.createdAt).toLocaleDateString(
                              "pl-PL"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Zgłosił: {report.reporterName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-400" />
                          <span>Właściciel: {report.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="w-4 h-4 text-orange-400" />
                          <span className="px-2 py-1 bg-orange-900/30 border border-orange-700 text-orange-300 rounded text-xs">
                            {report.reasonLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">{getStatusBadge(report.status)}</div>
                  </div>

                  {report.comment && (
                    <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Komentarz zgłaszającego:
                      </p>
                      <p className="text-sm text-gray-400">{report.comment}</p>
                    </div>
                  )}

                  {report.moderatorNote && (
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-300 mb-1">
                        Notatka moderatora:
                      </p>
                      <p className="text-sm text-blue-400">
                        {report.moderatorNote}
                      </p>
                    </div>
                  )}

                  {report.status === "PENDING" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAcceptClick(report)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Akceptuj
                      </button>
                      <button
                        onClick={() => handleReject(report.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Odrzuć
                      </button>
                    </div>
                  )}

                  {report.status !== "PENDING" && report.reviewedByName && (
                    <div className="text-xs text-gray-500 mt-3">
                      Rozpatrzone przez: {report.reviewedByName}
                      {report.reviewedAt && (
                        <span className="ml-2">
                          •{" "}
                          {new Date(report.reviewedAt).toLocaleString("pl-PL")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-gray-300 px-4">
                Strona {currentPage} z {totalPages}
              </span>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1)
                    return true;
                  return false;
                })
                .map((page, index, array) => {
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="text-gray-500">...</span>
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg transition-colors border ${
                            currentPage === page
                              ? "bg-purple-600 text-white border-purple-500"
                              : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors border ${
                        currentPage === page
                          ? "bg-purple-600 text-white border-purple-500"
                          : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Czarna stopka jak w MainPanel */}
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

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 border-4 border-purple-600">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Wybierz akcję
            </h3>

            <div className="mb-4 p-3 bg-gray-700 rounded">
              <p className="text-sm text-gray-300">
                <strong className="text-white">Ogłoszenie:</strong>{" "}
                {selectedReport.advertisementTitle}
              </p>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Powód:</strong>{" "}
                {selectedReport.reasonLabel}
              </p>
            </div>

            <div className="space-y-4">
              {/* Delete Action */}
              <div className="border border-red-700 rounded-lg p-4 bg-red-900/30">
                <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Usuń ogłoszenie
                </h4>
                <p className="text-sm text-red-400 mb-3">
                  Ogłoszenie zostanie trwale usunięte. Właściciel otrzyma
                  powiadomienie.
                </p>
                <button
                  onClick={handleDeleteAction}
                  disabled={actionLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Usuwanie..." : "Usuń ogłoszenie"}
                </button>
              </div>

              {/* Warning Action */}
              <div className="border border-yellow-700 rounded-lg p-4 bg-yellow-900/30">
                <h4 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" />
                  Wyślij ostrzeżenie
                </h4>
                <p className="text-sm text-yellow-400 mb-3">
                  Właściciel otrzyma ostrzeżenie. Ogłoszenie pozostanie aktywne.
                </p>
                <textarea
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  placeholder="Wpisz treść ostrzeżenia dla właściciela..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-3"
                  rows={4}
                />
                <button
                  onClick={handleWarningAction}
                  disabled={actionLoading || !warningText.trim()}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Wysyłanie..." : "Wyślij ostrzeżenie"}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowActionModal(false);
                setSelectedReport(null);
                setWarningText("");
              }}
              className="w-full mt-4 px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors"
              disabled={actionLoading}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeracjaZgloszen;
