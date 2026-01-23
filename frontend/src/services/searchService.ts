import axios from "axios";

const API_URL = "http://localhost:8080";

/**
 * Interfejsy dla PostgreSQL Full-Text Search
 */

export interface SearchSuggestion {
  id: number;
  name: string;
  brand?: string;
  categoryName?: string;
  imageUrl?: string;
  price: number;
  rank: number;
  suggestionType: string;
}

export interface CategorySuggestion {
  id: number;
  name: string;
  productCount: number;
}

export interface SuggestionsResponse {
  products: SearchSuggestion[];
  brands: string[];
  categories: CategorySuggestion[];
}

export interface SearchResult {
  id: number;
  title: string;
  description?: string;
  price: number;
  brand?: string;
  model?: string;
  rank?: number;
}

/**
 * Serwis wyszukiwania wykorzystujący PostgreSQL Full-Text Search
 *
 * Funkcjonalności:
 * - tsvector i tsquery dla pełnotekstowego wyszukiwania
 * - Indeksy GIN dla szybkiego wyszukiwania
 * - Trigram similarity dla tolerancji błędów pisowni
 * - Prefix matching dla autouzupełniania
 * - Ranking wyników według trafności
 */
export const searchService = {
  /**
   * Pobiera proste sugestie tekstowe (kompatybilne z istniejącym SearchBar)
   * GET /api/search/suggestions?q=samsung&limit=5
   */
  getSuggestions: async (
    query: string,
    limit: number = 5,
  ): Promise<string[]> => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await axios.get<string[]>(
        `${API_URL}/api/search/suggestions`,
        { params: { q: query, limit } },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      return [];
    }
  },

  /**
   * Pobiera pełne sugestie (produkty, marki, kategorie) z Full-Text Search
   * GET /api/search/suggestions/full?q=samsung
   */
  getFullSuggestions: async (query: string): Promise<SuggestionsResponse> => {
    if (!query || query.length < 2) {
      return { products: [], brands: [], categories: [] };
    }

    try {
      const response = await axios.get<SuggestionsResponse>(
        `${API_URL}/api/search/suggestions/full`,
        { params: { q: query } },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching full suggestions:", error);
      return { products: [], brands: [], categories: [] };
    }
  },

  /**
   * Pobiera sugestie marek
   * GET /api/search/brands?q=sam&limit=5
   */
  getBrandSuggestions: async (
    query: string,
    limit: number = 5,
  ): Promise<string[]> => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await axios.get<string[]>(
        `${API_URL}/api/search/brands`,
        { params: { q: query, limit } },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching brand suggestions:", error);
      return [];
    }
  },

  /**
   * Pobiera sugestie modeli (opcjonalnie dla konkretnej marki)
   * GET /api/search/models?q=galaxy&brand=Samsung&limit=5
   */
  getModelSuggestions: async (
    query: string,
    brand?: string,
    limit: number = 5,
  ): Promise<string[]> => {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      const response = await axios.get<string[]>(
        `${API_URL}/api/search/models`,
        { params: { q: query, brand, limit } },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching model suggestions:", error);
      return [];
    }
  },

  /**
   * Pobiera sugestie kategorii
   * GET /api/search/categories?q=smart&limit=5
   */
  getCategorySuggestions: async (
    query: string,
    limit: number = 5,
  ): Promise<CategorySuggestion[]> => {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await axios.get<CategorySuggestion[]>(
        `${API_URL}/api/search/categories`,
        { params: { q: query, limit } },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching category suggestions:", error);
      return [];
    }
  },

  /**
   * Wyszukuje ogłoszenia z rankingiem Full-Text Search
   * GET /api/search?q=samsung&limit=10
   */
  search: async (
    query: string,
    limit: number = 10,
  ): Promise<SearchResult[]> => {
    if (!query || query.trim() === "") {
      return [];
    }

    try {
      const response = await axios.get<SearchResult[]>(
        `${API_URL}/api/search`,
        { params: { q: query, limit } },
      );
      return response.data;
    } catch (error) {
      console.error("Error searching:", error);
      return [];
    }
  },
};

export default searchService;
