import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  companyName: string;
  taxId: string;
  profilePublic: boolean;
  showContactInAds: boolean;
  preferredContactMethod: string;
  newsletterSubscription: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  companyName: string;
  taxId: string;
  profilePublic: boolean;
  showContactInAds: boolean;
  preferredContactMethod: string;
  newsletterSubscription: boolean;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<UserProfileRequest>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    companyName: "",
    taxId: "",
    profilePublic: false,
    showContactInAds: true,
    preferredContactMethod: "email",
    newsletterSubscription: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get<UserProfile>("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        phoneNumber: response.data.phoneNumber || "",
        dateOfBirth: response.data.dateOfBirth || "",
        street: response.data.street || "",
        city: response.data.city || "",
        postalCode: response.data.postalCode || "",
        country: response.data.country || "",
        companyName: response.data.companyName || "",
        taxId: response.data.taxId || "",
        profilePublic: response.data.profilePublic || false,
        showContactInAds: response.data.showContactInAds !== false,
        preferredContactMethod: response.data.preferredContactMethod || "email",
        newsletterSubscription: response.data.newsletterSubscription || false
      });
      setLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: 'error', text: 'Błąd podczas ładowania profilu' });
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: 'success', text: 'Profil został zaktualizowany pomyślnie' });
      loadProfile(); // Reload profile data
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: 'error', text: 'Błąd podczas zapisywania profilu' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dane profilowe</h1>
            <button
              onClick={() => navigate("/userpanel")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Powrót do panelu
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 
            'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informacje o profilu</h2>
            <p className="mt-1 text-sm text-gray-600">
              Zarządzaj swoimi danymi osobowymi i preferencjami
            </p>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Basic Account Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa użytkownika
                </label>
                <input
                  type="text"
                  value={profile?.username || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            {/* Personal Data */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dane osobowe</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imię
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numer telefonu
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data urodzenia
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Address Data */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adres</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ulica i numer
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Miasto
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kod pocztowy
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kraj
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Data */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dane firmowe (opcjonalnie)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa firmy
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIP
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Privacy & Preferences */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Prywatność i preferencje</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferowany sposób kontaktu
                  </label>
                  <select
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Telefon</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="profilePublic"
                      checked={formData.profilePublic}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Profil publiczny (inne osoby mogą zobaczyć podstawowe informacje)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="showContactInAds"
                      checked={formData.showContactInAds}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Pokazuj dane kontaktowe w ogłoszeniach
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="newsletterSubscription"
                      checked={formData.newsletterSubscription}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Subskrybuj newsletter z ofertami i nowościami
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={saving}
                className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${
                  saving 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </button>
            </div>

            {/* Account Info */}
            {profile && (
              <div className="border-t pt-6 text-sm text-gray-500">
                <p>Konto utworzone: {new Date(profile.createdAt).toLocaleDateString('pl-PL')}</p>
                {profile.updatedAt && (
                  <p>Ostatnia aktualizacja: {new Date(profile.updatedAt).toLocaleDateString('pl-PL')}</p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;