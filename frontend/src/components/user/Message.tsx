import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/MobileResponsive.css";

type AdItem = { id: number; title: string; owner: "me" | "user" };

const EditAd: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data; replace later with API
  const [filter, setFilter] = useState<"me" | "user" | "all">("me");
  const [ads] = useState<AdItem[]>([
    // Moje ogłoszenia (rozmowy o moich ogłoszeniach)
    {
      id: 1,
      title: "iPhone 13 128GB - rozmowa z Janem Kowalskim",
      owner: "me",
    },
    { id: 2, title: "MacBook Pro 2021 - rozmowa z Anną Nowak", owner: "me" },
    // Ogłoszenia innych (wiadomości wysłane do sprzedawców)
    {
      id: 3,
      title: "Samsung S22 Ultra - rozmowa z Piotrem Zielińskim",
      owner: "user",
    },
    {
      id: 4,
      title: "Dell XPS 15 - rozmowa z Martą Lewandowską",
      owner: "user",
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Mock conversation data for each ad
  const conversations: Record<
    number,
    { sender: string; text: string; time: string }[]
  > = {
    1: [
      {
        sender: "Jan Kowalski",
        text: "Dzień dobry, czy iPhone jest jeszcze dostępny?",
        time: "10:01",
      },
      { sender: "Ja", text: "Tak, jest dostępny.", time: "10:02" },
      {
        sender: "Jan Kowalski",
        text: "Czy cena jest do negocjacji?",
        time: "10:03",
      },
      { sender: "Ja", text: "Możemy się dogadać.", time: "10:04" },
    ],
    2: [
      {
        sender: "Anna Nowak",
        text: "Witam, czy MacBook ma gwarancję?",
        time: "09:15",
      },
      { sender: "Ja", text: "Tak, jeszcze rok.", time: "09:16" },
    ],
    3: [
      {
        sender: "Ja",
        text: "Dzień dobry, interesuje mnie Samsung S22 Ultra.",
        time: "11:20",
      },
      {
        sender: "Piotr Zieliński",
        text: "Zapraszam do zakupu!",
        time: "11:21",
      },
    ],
    4: [
      {
        sender: "Ja",
        text: "Czy Dell XPS 15 ma dedykowaną kartę graficzną?",
        time: "12:00",
      },
      {
        sender: "Marta Lewandowska",
        text: "Tak, posiada RTX 3050.",
        time: "12:01",
      },
    ],
  };

  const visibleAds = ads.filter((a) =>
    filter === "all" ? true : a.owner === filter
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setIsDropdownOpen(false);
  };

  const handleEdit = (id: number) => {
    alert(`Edytuj ogłoszenie ID: ${id}`);
  };
  const handleDelete = (id: number) => {
    const confirmed = confirm("Na pewno usunąć ogłoszenie?");
    if (confirmed) alert(`Usunięto ogłoszenie ID: ${id}`);
  };

  return (
    <div className="panel-layout flex flex-col min-h-screen max-w-full overflow-x-hidden">
      {/* Header like AdminPanel */}
      <div className="panel-header px-2 sm:px-4 flex justify-between items-center w-full">
        <div className="panel-logo text-lg sm:text-xl md:text-2xl font-bold">
          MobliX
        </div>
        <div className="panel-buttons">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="account-dropdown-button"
            >
              Twoje konto
              <svg
                className={`w-4 h-4 transition-transform ${
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
                  <a href="#" className="dropdown-item">
                    Ogłoszenia
                  </a>
                  <a href="#" className="dropdown-item">
                    Czat
                  </a>
                  <a href="#" className="dropdown-item">
                    Oceny
                  </a>
                  <button
                    className="dropdown-item w-full text-left bg-white text-black"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate("/user/personaldetails");
                    }}
                  >
                    Profil
                  </button>
                  <button onClick={handleLogout} className="dropdown-logout">
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
        <div className="container mx-auto px-4 relative pt-12 pb-12 max-w-5xl">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10 w-full flex flex-col gap-6 min-h-[300px]">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Wiadomości
            </h2>
            {/* Tabs for message type */}
            <div className="flex justify-center mt-4 mb-6">
              <button
                className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${
                  filter === "me"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setFilter("me")}
              >
                Moje ogłoszenia
              </button>
              <button
                className={`px-6 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${
                  filter === "user"
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setFilter("user")}
              >
                Ogłoszenia
              </button>
            </div>
            {/* Tab content - two-column layout */}
            <div className="mt-2 flex flex-col md:flex-row gap-4 min-h-[300px]">
              {/* Left: list of conversations */}
              <div className="w-full md:w-1/3 border-r border-gray-200 pr-0 md:pr-4">
                <p className="mb-2 font-medium text-center md:text-left">
                  {filter === "me"
                    ? "Rozmowy dotyczące Twoich ogłoszeń:"
                    : "Wiadomości wysłane do sprzedawców:"}
                </p>
                {ads.filter((a) => a.owner === filter).length === 0 ? (
                  <p className="text-gray-400 text-center md:text-left">
                    Brak rozmów.
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {ads
                      .filter((a) => a.owner === filter)
                      .map((a) => (
                        <li
                          key={a.id}
                          className={`py-2 px-2 cursor-pointer rounded transition-colors flex items-center justify-between ${
                            selectedId === a.id
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => setSelectedId(a.id)}
                        >
                          <span className="truncate max-w-[140px] md:max-w-[180px] text-gray-800">
                            {a.title}
                          </span>
                          {selectedId === a.id && (
                            <span className="ml-2 text-xs text-blue-500">
                              Wybrane
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              {/* Right: conversation details */}
              <div className="w-full md:w-2/3 flex flex-col items-center justify-center min-h-[200px]">
                {selectedId && conversations[selectedId] ? (
                  <div className="w-full max-w-xl mx-auto">
                    <div className="mb-2 font-semibold text-lg text-center md:text-left">
                      Szczegóły rozmowy
                    </div>
                    <div className="bg-gray-50 rounded p-4 shadow-inner min-h-[120px]">
                      {conversations[selectedId].map((msg, idx) => (
                        <div
                          key={idx}
                          className="mb-2 flex flex-col items-start"
                        >
                          <span className="text-xs text-gray-500">
                            {msg.sender}{" "}
                            <span className="ml-2">{msg.time}</span>
                          </span>
                          <span className="text-base text-gray-800 ml-2">
                            {msg.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    Wybierz rozmowę z listy po lewej stronie.
                  </div>
                )}
              </div>
            </div>
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

export default EditAd;
