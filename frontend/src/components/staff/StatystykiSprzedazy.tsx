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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download,
  RefreshCw,
  Target,
  Award,
  Smartphone,
} from "lucide-react";

type JwtPayLoad = {
  sub: string;
  role: string;
  exp: number;
};

const StatystkiSprzedazy: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7dni");
  const [selectedBrand, setSelectedBrand] = useState("wszystkie");
  const [customBrand, setCustomBrand] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Przykładowe dane sprzedaży
  const mockSalesData = {
    summary: {
      totalRevenue: 45750,
      totalSales: 128,
      averageOrderValue: 357.42,
      conversionRate: 12.5,
      revenueChange: 8.2,
      salesChange: -3.1,
      avgOrderChange: 15.7,
      conversionChange: 2.3,
    },
    recentSales: [
      {
        id: 1,
        product: "iPhone 14 Pro Max 256GB",
        buyer: "Anna Kowalska",
        seller: "Jan Nowak",
        price: 4200,
        date: "2024-09-08",
        status: "completed",
        category: "premium",
      },
      {
        id: 2,
        product: "Samsung Galaxy S23 Ultra",
        buyer: "Michał Wiśniewski",
        seller: "Maria Kowalczyk",
        price: 3800,
        date: "2024-09-08",
        status: "pending",
        category: "premium",
      },
      {
        id: 3,
        product: "Google Pixel 7 Pro",
        buyer: "Katarzyna Nowak",
        seller: "Piotr Jankowski",
        price: 2100,
        date: "2024-09-07",
        status: "completed",
        category: "standard",
      },
      {
        id: 4,
        product: "iPhone 13 128GB",
        buyer: "Andrzej Kowalski",
        seller: "Agnieszka Nowacka",
        price: 2800,
        date: "2024-09-07",
        status: "completed",
        category: "standard",
      },
      {
        id: 5,
        product: "Xiaomi 13 Pro",
        buyer: "Tomasz Wójcik",
        seller: "Karolina Lewandowska",
        price: 1650,
        date: "2024-09-06",
        status: "cancelled",
        category: "budget",
      },
    ],
    brands: [
      { name: "Apple", sales: 45, revenue: 189000, growth: 15.2 },
      { name: "Samsung", sales: 38, revenue: 144400, growth: 8.7 },
      { name: "Google", sales: 22, revenue: 46200, growth: -3.1 },
      { name: "Xiaomi", sales: 18, revenue: 29700, growth: -12.4 },
      { name: "OnePlus", sales: 5, revenue: 11500, growth: 22.1 },
    ],
    topProducts: [
      { name: "iPhone 14 Pro Max", sales: 23, revenue: 96600 },
      { name: "Samsung Galaxy S23 Ultra", sales: 18, revenue: 68400 },
      { name: "Google Pixel 7 Pro", sales: 15, revenue: 31500 },
      { name: "iPhone 13", sales: 19, revenue: 53200 },
      { name: "Xiaomi 13 Pro", sales: 12, revenue: 19800 },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "premium":
        return <Award className="w-4 h-4 text-yellow-600" />;
      case "standard":
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case "budget":
        return <Package className="w-4 h-4 text-green-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case "apple":
        return <Smartphone className="w-4 h-4 text-gray-800" />;
      case "samsung":
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case "google":
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case "xiaomi":
        return <Smartphone className="w-4 h-4 text-orange-600" />;
      case "oneplus":
        return <Smartphone className="w-4 h-4 text-red-600" />;
      case "huawei":
        return <Smartphone className="w-4 h-4 text-purple-600" />;
      case "oppo":
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case "vivo":
        return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case "realme":
        return <Smartphone className="w-4 h-4 text-yellow-600" />;
      case "sony":
        return <Smartphone className="w-4 h-4 text-pink-600" />;
      default:
        return <Smartphone className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

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
      {/* Main content area */}
      <main className="panel-content flex-grow w-full overflow-y-auto">
        <div
          className="container mx-auto px-4 relative pt-12 pb-12 max-w-6xl"
          style={{ paddingTop: "900px" }}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 min-h-[300px]">
            {/* Nagłówek */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Statystyki Sprzedaży
                  </h1>
                  <p className="text-sm text-gray-600">
                    Analiza wyników sprzedaży na platformie
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Eksportuj
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Odśwież
                </button>
              </div>
            </div>

            {/* Filtry */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7dni">Ostatnie 7 dni</option>
                  <option value="30dni">Ostatnie 30 dni</option>
                  <option value="90dni">Ostatnie 90 dni</option>
                  <option value="rok">Ostatni rok</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setShowCustomBrand(e.target.value === "inne");
                    if (e.target.value !== "inne") {
                      setCustomBrand("");
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="wszystkie">Wszystkie marki</option>
                  <option value="apple">Apple</option>
                  <option value="samsung">Samsung</option>
                  <option value="google">Google</option>
                  <option value="xiaomi">Xiaomi</option>
                  <option value="huawei">Huawei</option>
                  <option value="oneplus">OnePlus</option>
                  <option value="oppo">Oppo</option>
                  <option value="vivo">Vivo</option>
                  <option value="realme">Realme</option>
                  <option value="sony">Sony</option>
                  <option value="inne">Inne...</option>
                </select>
              </div>

              {/* Pole dla custom marki */}
              {showCustomBrand && (
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Wpisz nazwę marki..."
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[180px]"
                  />
                </div>
              )}
            </div>

            {/* Główne metryki */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Przychód całkowity
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(mockSalesData.summary.totalRevenue)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {mockSalesData.summary.revenueChange >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${
                          mockSalesData.summary.revenueChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercentage(mockSalesData.summary.revenueChange)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-200 rounded-full">
                    <DollarSign className="w-6 h-6 text-green-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Liczba sprzedaży
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {mockSalesData.summary.totalSales}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {mockSalesData.summary.salesChange >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${
                          mockSalesData.summary.salesChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercentage(mockSalesData.summary.salesChange)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-full">
                    <ShoppingBag className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">
                      Średnia wartość
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(mockSalesData.summary.averageOrderValue)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {mockSalesData.summary.avgOrderChange >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm ${
                          mockSalesData.summary.avgOrderChange >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatPercentage(mockSalesData.summary.avgOrderChange)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Target className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sekcja z wykresami */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top produkty */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Top Produkty
                  </h3>
                </div>
                <div className="space-y-3">
                  {mockSalesData.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smartphone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {product.sales} sprzedaży
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sprzedaż według marek */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Sprzedaż według marek
                  </h3>
                </div>
                <div className="space-y-3">
                  {mockSalesData.brands.map((brand, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          {getBrandIcon(brand.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {brand.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {brand.sales} transakcji
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(brand.revenue)}
                        </p>
                        <div className="flex items-center gap-1">
                          {brand.growth >= 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span
                            className={`text-xs ${
                              brand.growth >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatPercentage(brand.growth)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ostatnie transakcje */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Ostatnie Transakcje
                  </h3>
                </div>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                  <Eye className="w-4 h-4" />
                  Zobacz wszystkie
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Produkt
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Kupujący
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Sprzedający
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Cena
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">
                        Data
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockSalesData.recentSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-100 hover:bg-white transition-colors"
                      >
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Smartphone className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {sale.product}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-gray-700">{sale.buyer}</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-gray-700">{sale.seller}</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(sale.price)}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              sale.status
                            )}`}
                          >
                            {getStatusIcon(sale.status)}
                            {sale.status === "completed" && "Zakończona"}
                            {sale.status === "pending" && "Oczekuje"}
                            {sale.status === "cancelled" && "Anulowana"}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-gray-600">{sale.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* White footer bar at bottom */}
      <div className="panel-footer w-full py-2 mt-auto">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center h-full gap-x-1 gap-y-2 sm:gap-4 md:gap-6 lg:gap-8 text-xxs xs:text-xs sm:text-sm px-1 sm:px-2">
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

export default StatystkiSprzedazy;
