import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}`;

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


export const searchService = {
  //pobieranie sugestii
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

  //pobieranie pelnych sugestii
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

  //pobieranie sugestii marek
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

  //pobieranie sugestii modeli
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

  //pobieranie sugestii kategorii
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

  //wyszukiwanie ogłoszen
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
