import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../../styles/MobileResponsive.css";

type OsType = "Android" | "iOS";

const AddAdvertisement: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Basic fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Images (max 3) + image link
  const [images, setImages] = useState<File[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Wyświetlacz
  const [displaySize, setDisplaySize] = useState(""); // np. 6.5"
  const [displayResolution, setDisplayResolution] = useState(""); // np. Full HD+ 2400×1080
  const [displayTech, setDisplayTech] = useState(""); // LCD, OLED, AMOLED, LTPO
  const [displayRefresh, setDisplayRefresh] = useState(""); // np. 60 Hz, 120 Hz

  // Procesor (CPU) i grafika (GPU)
  const [cpuModel, setCpuModel] = useState(""); // np. Snapdragon 8 Gen 3
  const [cpuCores, setCpuCores] = useState(""); // np. 8 rdzeni
  const [cpuClock, setCpuClock] = useState(""); // np. 3.2 GHz
  const [gpuModel, setGpuModel] = useState("");

  // Pamięć
  const [ram, setRam] = useState(""); // np. 8 GB
  const [storage, setStorage] = useState(""); // np. 128 GB
  const [microSD, setMicroSD] = useState<boolean>(false);

  // Aparaty
  const [rearCameras, setRearCameras] = useState(""); // np. 50 MP + 12 MP + 8 MP
  const [frontCamera, setFrontCamera] = useState(""); // np. 32 MP
  const [videoRecording, setVideoRecording] = useState(""); // np. 4K 60 FPS, 8K

  // Bateria
  const [batteryCapacity, setBatteryCapacity] = useState(""); // np. 5000 mAh
  const [fastCharging, setFastCharging] = useState(""); // np. 67 W
  const [wirelessCharging, setWirelessCharging] = useState(""); // np. 15 W

  // Łączność
  const [networks, setNetworks] = useState(""); // 4G, 5G
  const [wifi, setWifi] = useState(""); // Wi‑Fi 6E
  const [bluetooth, setBluetooth] = useState(""); // 5.3
  const [nfc, setNfc] = useState<boolean>(false);
  const [navigation, setNavigation] = useState(""); // GPS, GLONASS, Galileo

  // System operacyjny
  const [osType, setOsType] = useState<OsType>("Android");
  const [osVersion, setOsVersion] = useState(""); // np. Android 14

  // Inne
  const [ipRating, setIpRating] = useState(""); // IP67, IP68
  const [fingerprint, setFingerprint] = useState(""); // optyczny/ultradźwiękowy/boczny

  // Waga i wymiary + materiały
  const [weight, setWeight] = useState(""); // np. 189 g
  const [dimW, setDimW] = useState("");
  const [dimH, setDimH] = useState("");
  const [dimD, setDimD] = useState("");
  const [materials, setMaterials] = useState(""); // plastik, szkło, aluminium

  const onSelectImages = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const next = [...images, ...list].slice(0, 3);
    setImages(next);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Musisz być zalogowany.");
        return;
      }
      const userId = localStorage.getItem("userId") || "0"; // TODO: set real userId after /me wiring
      const priceValue =
        Number.parseFloat((price || "").replace(/[^0-9.]/g, "")) || 0;

      // Only send minimal fields to backend (no backend changes requested)
      const body = {
        title,
        description,
        price: priceValue,
      };

      await axios.post(
        `http://localhost:8088/api/user/${userId}/ogloszenia`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Ogłoszenie dodane.");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Nie udało się dodać ogłoszenia.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleGoToAdminPanel = () => {
    navigate("/admin");
    setIsDropdownOpen(false);
  };

  const token = localStorage.getItem("token");
  type JwtPayLoad = { sub: string; role: string; exp: number };
  let isAdmin = false;
  let isUser = false;
  let isStaff = false;
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayLoad>(token);
      isAdmin = decoded.role === "ADMIN" || decoded.role === "ROLE_ADMIN";
      isUser = decoded.role === "USER" || decoded.role === "ROLE_USER";
      isStaff = decoded.role === "STAFF" || decoded.role === "ROLE_STAFF";
    } catch (err) {
      console.error("Nieprawidłowy token JWT", err);
    }
  }

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div className="panel-logo text-lg sm:text-xl md:text-2xl font-bold">
          MobliX
        </div>
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button text-sm sm:text-base whitespace-nowrap px-2 sm:px-4"
            >
              Twoje konto
              <svg
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ml-1 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu right-0 w-48 sm:w-56 z-50">
                <div className="py-1">
                  {token ? (
                    <>
                      <a href="#" className="dropdown-item">
                        Ogłoszenia
                      </a>
                      <a href="#" className="dropdown-item">
                        Czat
                      </a>
                      <a href="#" className="dropdown-item">
                        Oceny
                      </a>
                      <a href="#" className="dropdown-item">
                        <button
                          className="dropdown-item w-full text-left bg-white text-black"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/user/personaldetails");
                          }}
                        >
                          Profil
                        </button>
                      </a>
                      {isAdmin && (
                        <button
                          onClick={handleGoToAdminPanel}
                          className="dropdown-button"
                        >
                          Panel administratora
                        </button>
                      )}
                      {isUser && (
                        <button
                          className="dropdown-item w-full text-left bg-white text-black"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate("/userpanel");
                          }}
                        >
                          Panel użytkownika
                        </button>
                      )}
                      {isStaff && (
                        <a href="#" className="dropdown-item">
                          Panel pracownika
                        </a>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="dropdown-logout"
                      >
                        Wyloguj
                      </button>
                    </>
                  ) : (
                    <button
                      className="dropdown-logout w-full text-left"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/login");
                      }}
                    >
                      Zaloguj się
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel-content flex-grow w-full overflow-y-auto">
        <div className="container mx-auto px-4 relative pt-12 pb-12 max-w-5xl">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dodaj ogłoszenie
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Tytuł, Cena, Opis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tytuł
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Np. iPhone 15 Pro 256 GB"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena (PLN)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="np. 4299"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Zdjęcia lub link do zdjęcia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zdjęcia (max 3)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => onSelectImages(e.target.files)}
                  />
                  {images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {images.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative border rounded-lg p-2"
                        >
                          <div className="text-xs text-gray-600 truncate">
                            {file.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 text-xs text-red-600"
                          >
                            Usuń
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link do zdjęcia
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  {imageUrl && (
                    <div className="mt-3">
                      <img
                        src={imageUrl}
                        alt="Podgląd"
                        className="w-full max-h-60 object-contain rounded border"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Parametry: Wyświetlacz */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Wyświetlacz
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rozmiar (cale)
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={displaySize}
                      onChange={(e) => setDisplaySize(e.target.value)}
                      placeholder='np. 6.5"'
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rozdzielczość
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={displayResolution}
                      onChange={(e) => setDisplayResolution(e.target.value)}
                      placeholder="Full HD+ 2400×1080"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologia
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={displayTech}
                      onChange={(e) => setDisplayTech(e.target.value)}
                    >
                      <option value="">Wybierz</option>
                      <option>LCD</option>
                      <option>OLED</option>
                      <option>AMOLED</option>
                      <option>LTPO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odświeżanie
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={displayRefresh}
                      onChange={(e) => setDisplayRefresh(e.target.value)}
                      placeholder="np. 120 Hz"
                    />
                  </div>
                </div>
              </div>

              {/* Parametry: CPU/GPU */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Procesor (CPU) i grafika (GPU)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model procesora
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={cpuModel}
                      onChange={(e) => setCpuModel(e.target.value)}
                      placeholder="np. Snapdragon 8 Gen 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Liczba rdzeni
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={cpuCores}
                      onChange={(e) => setCpuCores(e.target.value)}
                      placeholder="np. 8 rdzeni"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taktowanie
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={cpuClock}
                      onChange={(e) => setCpuClock(e.target.value)}
                      placeholder="np. 3.2 GHz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model GPU
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={gpuModel}
                      onChange={(e) => setGpuModel(e.target.value)}
                      placeholder="np. Adreno 750"
                    />
                  </div>
                </div>
              </div>

              {/* Parametry: Pamięć */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pamięć
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      RAM
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={ram}
                      onChange={(e) => setRam(e.target.value)}
                      placeholder="np. 8 GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pamięć wewnętrzna
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={storage}
                      onChange={(e) => setStorage(e.target.value)}
                      placeholder="np. 256 GB"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="microsd"
                      type="checkbox"
                      checked={microSD}
                      onChange={(e) => setMicroSD(e.target.checked)}
                    />
                    <label
                      htmlFor="microsd"
                      className="text-sm font-medium text-gray-700"
                    >
                      Obsługa kart microSD
                    </label>
                  </div>
                </div>
              </div>

              {/* Parametry: Aparaty */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Aparaty
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tylny
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={rearCameras}
                      onChange={(e) => setRearCameras(e.target.value)}
                      placeholder="np. 50 MP + 12 MP + 8 MP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Przedni
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={frontCamera}
                      onChange={(e) => setFrontCamera(e.target.value)}
                      placeholder="np. 32 MP"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Możliwości nagrywania wideo
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={videoRecording}
                      onChange={(e) => setVideoRecording(e.target.value)}
                      placeholder="np. 4K 60 FPS, 8K"
                    />
                  </div>
                </div>
              </div>

              {/* Parametry: Bateria */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bateria
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pojemność
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={batteryCapacity}
                      onChange={(e) => setBatteryCapacity(e.target.value)}
                      placeholder="np. 5000 mAh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Szybkie ładowanie
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={fastCharging}
                      onChange={(e) => setFastCharging(e.target.value)}
                      placeholder="np. 67 W"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ładowanie bezprzewodowe
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={wirelessCharging}
                      onChange={(e) => setWirelessCharging(e.target.value)}
                      placeholder="np. 15 W"
                    />
                  </div>
                </div>
              </div>

              {/* Parametry: Łączność */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Łączność
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sieci
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={networks}
                      onChange={(e) => setNetworks(e.target.value)}
                      placeholder="np. 5G"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wi‑Fi
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={wifi}
                      onChange={(e) => setWifi(e.target.value)}
                      placeholder="np. Wi‑Fi 6E"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bluetooth
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={bluetooth}
                      onChange={(e) => setBluetooth(e.target.value)}
                      placeholder="np. 5.3"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="nfc"
                      type="checkbox"
                      checked={nfc}
                      onChange={(e) => setNfc(e.target.checked)}
                    />
                    <label
                      htmlFor="nfc"
                      className="text-sm font-medium text-gray-700"
                    >
                      NFC
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GPS, GLONASS, Galileo
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={navigation}
                      onChange={(e) => setNavigation(e.target.value)}
                      placeholder="np. GPS, GLONASS, Galileo"
                    />
                  </div>
                </div>
              </div>

              {/* Parametry: System operacyjny */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  System operacyjny
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System
                    </label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={osType}
                      onChange={(e) => setOsType(e.target.value as OsType)}
                    >
                      <option>Android</option>
                      <option>iOS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wersja systemu
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={osVersion}
                      onChange={(e) => setOsVersion(e.target.value)}
                      placeholder="np. Android 14"
                    />
                  </div>
                </div>
              </div>

              {/* Parametry: Inne */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Inne
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odporność na wodę/pył
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={ipRating}
                      onChange={(e) => setIpRating(e.target.value)}
                      placeholder="np. IP68"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Czytnik linii papilarnych
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={fingerprint}
                      onChange={(e) => setFingerprint(e.target.value)}
                      placeholder="optyczny / ultradźwiękowy / boczny"
                    />
                  </div>
                </div>
              </div>

              {/* Waga i wymiary, materiały */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Waga i wymiary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waga
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="np. 189 g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Szerokość (mm)
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={dimW}
                      onChange={(e) => setDimW(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wysokość (mm)
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={dimH}
                      onChange={(e) => setDimH(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Głębokość (mm)
                    </label>
                    <input
                      className="w-full px-4 py-2 rounded-lg border border-gray-300"
                      value={dimD}
                      onChange={(e) => setDimD(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materiały obudowy
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="np. szkło, aluminium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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

export default AddAdvertisement;
