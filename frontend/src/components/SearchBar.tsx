import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import { jwtDecode } from "jwt-decode";

interface JwtPayLoad {
  sub?: string;
  email: string;
  role: string;
}

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  // Pobierz sugestie z OpenSearch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get<string[]>(
          `http://localhost:8080/api/search/suggestions`,
          {
            params: { q: searchQuery, limit: 5 },
          }
        );
        setSuggestions(response.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

        await axios.post("/api/search-logs", {
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
          type="text"
          placeholder="Szukaj smartfonów..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
          className="w-full px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />

        {/* Sugestie dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
