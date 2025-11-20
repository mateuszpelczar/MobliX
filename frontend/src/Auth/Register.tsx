import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Building2, User } from "lucide-react";
import "../styles/Auth.css";

const Register: React.FC = () => {
  const navigate = useNavigate();

  // Typ konta
  const [accountType, setAccountType] = useState<"personal" | "business">(
    "personal"
  );

  // Podstawowe dane
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dane osobowe (dla obu typów kont)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // Dane firmowe (tylko dla konta business)
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [regon, setRegon] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const registrationData = {
        username,
        email,
        password,
        accountType,
        firstName,
        lastName,
        phone,
        ...(accountType === "business" && {
          companyName,
          nip,
          regon,
          address,
          website,
        }),
      };

      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        registrationData
      );
      localStorage.setItem("token", String(res.data));
      navigate("/login");
    } catch (err) {
      alert("Rejestracja nie powiodła się");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Tło z MainPanel (rozmazane) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Formularz rejestracji */}
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Rejestracja</h2>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Wybór typu konta */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Typ konta
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAccountType("personal")}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                accountType === "personal"
                  ? "border-purple-500 bg-purple-600/20 text-purple-300"
                  : "border-gray-600 hover:border-purple-500 text-gray-300"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Konto prywatne</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("business")}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                accountType === "business"
                  ? "border-purple-500 bg-purple-600/20 text-purple-300"
                  : "border-gray-600 hover:border-purple-500 text-gray-300"
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span className="font-medium">Konto firmowe</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* Dane logowania */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nazwa użytkownika *
              </label>
              <input
                type="text"
                placeholder="Nazwa użytkownika"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="email@przykład.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Hasło *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-10 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dane osobowe */}
          <div className="border-t border-gray-700 pt-4 mt-2">
            <h3 className="text-lg font-semibold text-white mb-3">
              Dane{" "}
              {accountType === "business" ? "osoby kontaktowej" : "osobowe"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Imię *
                </label>
                <input
                  type="text"
                  placeholder="Imię"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nazwisko *
                </label>
                <input
                  type="text"
                  placeholder="Nazwisko"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Numer telefonu *
              </label>
              <input
                type="tel"
                placeholder="+48 123 456 789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Dane firmowe (tylko dla konta business) */}
          {accountType === "business" && (
            <div className="border-t border-gray-700 pt-4 mt-2">
              <h3 className="text-lg font-semibold text-white mb-3">
                Dane firmowe
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nazwa firmy *
                  </label>
                  <input
                    type="text"
                    placeholder="Nazwa firmy"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={accountType === "business"}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      NIP *
                    </label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      required={accountType === "business"}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      REGON
                    </label>
                    <input
                      type="text"
                      placeholder="123456789"
                      value={regon}
                      onChange={(e) => setRegon(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Adres firmy *
                  </label>
                  <input
                    type="text"
                    placeholder="ul. Przykładowa 1, 00-000 Warszawa"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required={accountType === "business"}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Strona internetowa
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.przykład.pl"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium text-lg shadow-lg transition-colors w-full mt-4"
          >
            Zarejestruj się
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-6">
          Masz już konto?{" "}
          <Link
            to="/login"
            className="text-purple-400 hover:text-purple-300 hover:underline font-medium"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
