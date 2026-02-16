import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, X, Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface JwtPayLoad {
  sub?: string;
  email: string;
  role: string;
}

// Typy dla rozszerzonych sugestii Full-Text Search
interface SearchSuggestion {
  id: number;
  name: string;
  brand?: string;
  categoryName?: string;
  imageUrl?: string;
  price: number;
  rank: number;
  suggestionType: string;
}

interface CategorySuggestion {
  id: number;
  name: string;
  productCount: number;
}

interface FullSuggestionsResponse {
  products: SearchSuggestion[];
  brands: string[];
  categories: CategorySuggestion[];
}

const API_URL = `${import.meta.env.VITE_API_URL}`;

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fullSuggestions, setFullSuggestions] =
    useState<FullSuggestionsResponse | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [useFullSuggestions, setUseFullSuggestions] = useState(false); // Toggle między prostymi a pełnymi sugestiami
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Zamknij sugestie po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch suggestions - PostgreSQL Full-Text Search
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setFullSuggestions(null);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);

      try {
        if (useFullSuggestions) {
          // Pobierz pełne sugestie (produkty, marki, kategorie)
          const response = await axios.get<FullSuggestionsResponse>(
            `${API_URL}/api/search/suggestions/full`,
            { params: { q: query } },
          );
          setFullSuggestions(response.data);
          setSuggestions([]);
        } else {
          // Pobierz proste sugestie tekstowe
          const response = await axios.get<string[]>(
            `${API_URL}/api/search/suggestions`,
            { params: { q: query, limit: 8 } },
          );
          setSuggestions(response.data);
          setFullSuggestions(null);
        }
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setFullSuggestions(null);
      } finally {
        setIsLoading(false);
      }
    },
    [useFullSuggestions],
  );

  // Debounce effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchSuggestions]);

  // Obsługa klawiatury
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems =
      useFullSuggestions && fullSuggestions
        ? fullSuggestions.products.length +
          fullSuggestions.brands.length +
          fullSuggestions.categories.length
        : suggestions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectByIndex(selectedIndex);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Wybór sugestii po indeksie (dla nawigacji klawiaturą)
  const handleSelectByIndex = (index: number) => {
    if (useFullSuggestions && fullSuggestions) {
      const productCount = fullSuggestions.products.length;
      const brandCount = fullSuggestions.brands.length;

      if (index < productCount) {
        const product = fullSuggestions.products[index];
        navigate(`/ogloszenie/${product.id}`);
      } else if (index < productCount + brandCount) {
        const brand = fullSuggestions.brands[index - productCount];
        handleSearch(brand);
      } else {
        const category =
          fullSuggestions.categories[index - productCount - brandCount];
        navigate(`/smartfony?category=${category.id}`);
      }
    } else if (suggestions[index]) {
      handleSuggestionClick(suggestions[index]);
    }
    setShowSuggestions(false);
  };

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim();

    if (searchTerm) {
      // Log search from navbar
      try {
        const token = localStorage.getItem("token");
        let userId = null;

        if (token) {
          try {
            const decoded = jwtDecode<JwtPayLoad>(token);
            userId = decoded.sub ? parseInt(decoded.sub) : null;
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        }

        await axios.post(`${API_URL}/api/search-logs`, {
          searchQuery: searchTerm,
          brand: null,
          model: null,
          minPrice: null,
          maxPrice: null,
          userId: userId,
          sessionId: null,
          resultsCount: null,
          searchSource: "navbar",
        });
      } catch (error) {
        console.error("Error logging search:", error);
      }

      navigate(`/smartfony?search=${encodeURIComponent(searchTerm)}`);
      setShowSuggestions(false);
    } else {
      navigate("/smartfony");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/ogloszenie/${productId}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleBrandClick = (brand: string) => {
    handleSearch(brand);
  };

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/smartfony?category=${categoryId}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setFullSuggestions(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  // Oblicz czy dany indeks jest wybrany (dla pełnych sugestii)
  const isSelected = (
    type: "product" | "brand" | "category",
    index: number,
  ): boolean => {
    if (!fullSuggestions) return false;

    const productCount = fullSuggestions.products.length;
    const brandCount = fullSuggestions.brands.length;

    switch (type) {
      case "product":
        return selectedIndex === index;
      case "brand":
        return selectedIndex === productCount + index;
      case "category":
        return selectedIndex === productCount + brandCount + index;
      default:
        return false;
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
      className="flex-1 max-w-3xl"
    >
      <div className="relative" ref={wrapperRef}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Szukaj smartfonów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 pl-10 pr-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

        {/* Loading indicator */}
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
        )}

        {/* Clear button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Sugestie dropdown - proste tekstowe */}
        {showSuggestions && !useFullSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full text-left px-4 py-3 text-white transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center gap-3 ${
                  selectedIndex === index
                    ? "bg-purple-600"
                    : "hover:bg-gray-700"
                }`}
              >
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}

            {/* Pokaż wszystkie wyniki */}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="w-full text-left px-4 py-3 text-purple-400 hover:bg-gray-700 transition-colors border-t border-gray-700"
            >
              Zobacz wszystkie wyniki dla "{searchQuery}"
            </button>
          </div>
        )}

        {/* Sugestie dropdown - pełne (produkty, marki, kategorie) */}
        {showSuggestions && useFullSuggestions && fullSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {/* Produkty */}
            {fullSuggestions.products.length > 0 && (
              <div className="p-2">
                <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ogłoszenia
                </h3>
                {fullSuggestions.products.map((product, index) => (
                  <button
                    key={`product-${product.id}`}
                    type="button"
                    onClick={() => handleProductClick(product.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                      isSelected("product", index)
                        ? "bg-purple-600 text-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-md mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-600 rounded-md mr-3 flex items-center justify-center">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {product.brand && `${product.brand} • `}
                        {product.categoryName}
                      </p>
                    </div>
                    <span className="text-sm font-semibold ml-2">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Marki */}
            {fullSuggestions.brands.length > 0 && (
              <div className="p-2 border-t border-gray-700">
                <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Marki
                </h3>
                <div className="flex flex-wrap gap-2 px-3 py-1">
                  {fullSuggestions.brands.map((brand, index) => (
                    <button
                      key={`brand-${brand}`}
                      type="button"
                      onClick={() => handleBrandClick(brand)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        isSelected("brand", index)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Kategorie */}
            {fullSuggestions.categories.length > 0 && (
              <div className="p-2 border-t border-gray-700">
                <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kategorie
                </h3>
                {fullSuggestions.categories.map((category, index) => (
                  <button
                    key={`category-${category.id}`}
                    type="button"
                    onClick={() => handleCategoryClick(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                      isSelected("category", index)
                        ? "bg-purple-600 text-white"
                        : "text-white hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs text-gray-400">
                      {category.productCount} ogłoszeń
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Brak wyników */}
            {fullSuggestions.products.length === 0 &&
              fullSuggestions.brands.length === 0 &&
              fullSuggestions.categories.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  Nie znaleziono wyników dla "{searchQuery}"
                </div>
              )}

            {/* Pokaż wszystkie wyniki */}
            <div className="p-2 border-t border-gray-700">
              <button
                type="button"
                onClick={() => handleSearch()}
                className="w-full px-3 py-2 text-sm text-purple-400 hover:bg-gray-700 rounded-md transition-colors text-left"
              >
                Zobacz wszystkie wyniki dla "{searchQuery}"
              </button>
            </div>
          </div>
        )}

        {/* Brak wyników */}
        {showSuggestions &&
          !isLoading &&
          searchQuery.length >= 2 &&
          suggestions.length === 0 &&
          (!fullSuggestions ||
            (fullSuggestions.products.length === 0 &&
              fullSuggestions.brands.length === 0 &&
              fullSuggestions.categories.length === 0)) && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4">
              <p className="text-gray-400 text-center">
                Nie znaleziono wyników dla "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={() => handleSearch()}
                className="w-full mt-2 px-3 py-2 text-sm text-purple-400 hover:bg-gray-700 rounded-md transition-colors"
              >
                Szukaj mimo to
              </button>
            </div>
          )}
      </div>
    </form>
  );
};

export default SearchBar;
