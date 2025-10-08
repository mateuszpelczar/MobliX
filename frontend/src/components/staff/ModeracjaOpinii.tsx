import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Flag,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  StarHalf,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const ModeracjaOpinii: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("wszystkie");
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Przykładowe dane opinii
  const mockReviews = [
    {
      id: 1,
      reviewer: "Anna Kowalska",
      reviewee: "Jan Nowak",
      adTitle: "iPhone 14 Pro Max 256GB",
      adId: 1,
      rating: 5,
      comment:
        "Bardzo dobra transakcja! Telefon zgodny z opisem, szybka wysyłka. Polecam tego sprzedawcę!",
      date: "2024-09-03",
      status: "pending",
      reports: 0,
      type: "positive",
    },
    {
      id: 2,
      reviewer: "Michał Wiśniewski",
      reviewee: "Maria Kowalczyk",
      adTitle: "Samsung Galaxy S23 Ultra",
      adId: 2,
      rating: 1,
      comment:
        "OSZUST! Nie wysłał telefonu mimo otrzymania pieniędzy. Unikajcie tego sprzedawcy!",
      date: "2024-09-03",
      status: "flagged",
      reports: 5,
      type: "negative",
    },
    {
      id: 3,
      reviewer: "Katarzyna Nowak",
      reviewee: "Piotr Jankowski",
      adTitle: "Google Pixel 8 Pro",
      adId: 3,
      rating: 4,
      comment:
        "Telefon w dobrym stanie, drobne ślady użytkowania. Sprzedawca kulturalny i pomocny.",
      date: "2024-09-02",
      status: "approved",
      reports: 0,
      type: "positive",
    },
    {
      id: 4,
      reviewer: "Spam Bot",
      reviewee: "Andrzej Kowalski",
      adTitle: "iPhone 13 128GB",
      adId: 4,
      rating: 5,
      comment:
        "Najlepszy sprzedawca! Kup teraz! Sprawdź mój profil na www.podejrzana-strona.com",
      date: "2024-09-01",
      status: "rejected",
      reports: 3,
      type: "spam",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "flagged":
        return "bg-red-100 text-red-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "flagged":
        return <AlertTriangle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Oczekuje";
      case "approved":
        return "Zatwierdzona";
      case "flagged":
        return "Zgłoszona";
      case "rejected":
        return "Odrzucona";
      default:
        return "Nieznany";
    }
  };

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

  const filteredReviews = mockReviews.filter((review) => {
    const matchesFilter =
      selectedFilter === "wszystkie" || review.status === selectedFilter;
    const matchesSearch =
      review.reviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-yellow-50 p-3 rounded-lg text-center border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-600">1</div>
                  <div className="text-xs text-yellow-500">Oczekujące</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center border border-red-200">
                  <div className="text-lg font-bold text-red-600">1</div>
                  <div className="text-xs text-red-500">Zgłoszone</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-center border border-green-200">
                  <div className="text-lg font-bold text-green-600">12</div>
                  <div className="text-xs text-green-500">Zatwierdzone</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-200">
                  <div className="text-lg font-bold text-gray-600">3</div>
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
                    Wszystkie
                  </option>
                  <option value="pending" className="text-black">
                    Oczekujące
                  </option>
                  <option value="flagged" className="text-black">
                    Zgłoszone
                  </option>
                  <option value="approved" className="text-black">
                    Zatwierdzone
                  </option>
                  <option value="rejected" className="text-black">
                    Odrzucone
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
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() =>
                    navigate(`/smartfon/${review.adId}?reviewId=${review.id}`)
                  }
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Review Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {review.rating}/5
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            Opinia dla ogłoszenia: {review.adTitle}
                          </h3>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                            review.status
                          )}`}
                        >
                          {getStatusIcon(review.status)}
                          {getStatusText(review.status)}
                        </div>
                      </div>

                      {/* Review Comment */}
                      <div className="bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-gray-700">{review.comment}</p>
                      </div>

                      {/* Review Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Od:</span>{" "}
                          {review.reviewer}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Dla:</span>{" "}
                          {review.reviewee}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {review.date}
                        </div>
                        {review.reports > 0 && (
                          <div className="flex items-center gap-1 text-red-500">
                            <Flag className="w-4 h-4" />
                            {review.reports} zgłoszeń
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          {review.type === "positive" ? (
                            <ThumbsUp className="w-4 h-4 text-green-500" />
                          ) : review.type === "negative" ? (
                            <ThumbsDown className="w-4 h-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          )}
                          <span className="capitalize">
                            {review.type === "positive"
                              ? "Pozytywna"
                              : review.type === "negative"
                              ? "Negatywna"
                              : "Spam"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-32">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add approve logic here
                        }}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Zatwierdź
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add reject logic here
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Odrzuć
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Brak opinii
                </h3>
                <p className="text-gray-500">
                  Nie znaleziono opinii spełniających kryteria wyszukiwania.
                </p>
              </div>
            )}
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
    </div>
  );
};

export default ModeracjaOpinii;
