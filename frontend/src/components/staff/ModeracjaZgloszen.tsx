import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../../styles/MobileResponsive.css";
import "../../styles/StaffPanel.css";
import {
  MessageSquare,
  ShoppingBag,
  Star,
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
  ChevronUp,
  Trash2,
  AlertOctagon,
  FileText,
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  }, []);

  useEffect(() => {
    filterReports();
  }, [activeTab, reports, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get<AdvertisementReport[]>(
        "http://localhost:8080/api/reports",
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

  const toggleRow = (reportId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedRows(newExpanded);
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
        `http://localhost:8080/api/reports/${selectedReport.id}/review`,
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
        `http://localhost:8080/api/reports/${selectedReport.id}/review`,
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
        `http://localhost:8080/api/reports/${reportId}/reject`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

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

      {/* Content */}
      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-32 pb-12 max-w-6xl">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6">
            {/* Nagłówek */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-7 h-7 text-orange-600" />
                Moderacja zgłoszeń
              </h1>
              <p className="text-gray-600">
                Zarządzaj zgłoszeniami dotyczącymi ogłoszeń
              </p>
            </div>

            {/* Search */}
            <div className="relative flex-grow mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Szukaj zgłoszeń..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "ALL"
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Wszystkie ({getTabCount("ALL")})
                </button>
                <button
                  onClick={() => setActiveTab("PENDING")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "PENDING"
                      ? "border-b-2 border-yellow-600 text-yellow-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Oczekujące ({getTabCount("PENDING")})
                </button>
                <button
                  onClick={() => setActiveTab("ACCEPTED")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "ACCEPTED"
                      ? "border-b-2 border-green-600 text-green-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Rozwiązane ({getTabCount("ACCEPTED")})
                </button>
                <button
                  onClick={() => setActiveTab("REJECTED")}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === "REJECTED"
                      ? "border-b-2 border-red-600 text-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Odrzucone ({getTabCount("REJECTED")})
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={fetchReports}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Spróbuj ponownie
                </button>
              </div>
            )}

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Brak zgłoszeń w tej kategorii</p>
                </div>
              ) : (
                <div className="reports-table-container overflow-x-auto max-h-[450px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Data zgłoszenia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Tytuł ogłoszenia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Zgłoszono przez
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Właściciel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Powód
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                          Akcje
                        </th>
                        <th className="px-6 py-3 bg-gray-50"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReports.map((report) => (
                        <React.Fragment key={report.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {new Date(report.createdAt).toLocaleDateString(
                                  "pl-PL"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-purple-600" />
                                {report.advertisementTitle}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                {report.reporterName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600" />
                                {report.ownerName}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                {report.reasonLabel}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(report.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {report.status === "PENDING" && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptClick(report)}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Akceptuj
                                  </button>
                                  <button
                                    onClick={() => handleReject(report.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Odrzuć
                                  </button>
                                </div>
                              )}
                              {report.status !== "PENDING" &&
                                report.reviewedByName && (
                                  <span className="text-gray-500 text-xs">
                                    Przez: {report.reviewedByName}
                                  </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => toggleRow(report.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedRows.has(report.id) ? (
                                  <ChevronUp className="w-5 h-5" />
                                ) : (
                                  <ChevronDown className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(report.id) && (
                            <tr className="bg-gray-50">
                              <td colSpan={8} className="px-6 py-4">
                                <div className="space-y-3">
                                  {report.comment && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Komentarz zgłaszającego:
                                      </p>
                                      <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                                        {report.comment}
                                      </p>
                                    </div>
                                  )}
                                  {report.moderatorNote && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Notatka moderatora:
                                      </p>
                                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                                        {report.moderatorNote}
                                      </p>
                                    </div>
                                  )}
                                  {report.reviewedAt && (
                                    <div className="text-xs text-gray-500">
                                      Rozpatrzone:{" "}
                                      {new Date(
                                        report.reviewedAt
                                      ).toLocaleString("pl-PL")}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Wybierz akcję
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">
                <strong>Ogłoszenie:</strong> {selectedReport.advertisementTitle}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Powód:</strong> {selectedReport.reasonLabel}
              </p>
            </div>

            <div className="space-y-4">
              {/* Delete Action */}
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Usuń ogłoszenie
                </h4>
                <p className="text-sm text-red-700 mb-3">
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
              <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5" />
                  Wyślij ostrzeżenie
                </h4>
                <p className="text-sm text-yellow-700 mb-3">
                  Właściciel otrzyma ostrzeżenie. Ogłoszenie pozostanie aktywne.
                </p>
                <textarea
                  value={warningText}
                  onChange={(e) => setWarningText(e.target.value)}
                  placeholder="Wpisz treść ostrzeżenia dla właściciela..."
                  className="w-full px-3 py-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-3"
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
              className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
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
