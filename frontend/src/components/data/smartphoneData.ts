export interface SmartphoneData {
  id: number;
  title: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  location: string;
  condition: string;
  images: string[];
  seller: string;
  sellerPhone: string;
  sellerEmail: string;
  dateAdded: string;
  views: number;
  likes: number;
  description: string;
  specifications: {
    brand: string;
    model: string;
    storage: string;
    ram: string;
    color: string;
    batteryCapacity: string;
    screenSize: string;
    cameraMP: string;
    osType: string;
    osVersion: string;
    frontCamera: string;
    displayTech: string;
    wifi: string;
    bluetooth: string;
    ipRating?: string;
    fastCharging?: string;
    wirelessCharging?: string;
    processor?: string;
    gpu?: string;
    screenResolution?: string;
    refreshRate?: string;
  };
  additionalInfo: {
    warranty: string;
    includesCharger: boolean;
  };
}

// Rozszerzone dane smartfonów
export const smartphones: SmartphoneData[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max 256GB Titan Natural",
    brand: "Apple",
    model: "iPhone 15 Pro Max",
    price: 5299,
    originalPrice: 5999,
    location: "Warszawa, Mokotów",
    condition: "NEW",
    images: [
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Front",
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Back",
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Side",
      "https://dummyimage.com/600x700/007acc/fff&text=iPhone+15+Pro+Box",
    ],
    seller: "TechStore Warszawa",
    sellerPhone: "+48 123 456 789",
    sellerEmail: "contact@techstore.pl",
    dateAdded: "2024-09-20",
    views: 1247,
    likes: 89,
    description:
      "Nowy iPhone 15 Pro Max w kolorze Titan Natural. Oryginalny, nieużywany, z pełną gwarancją Apple. Telefon jest fabrycznie nowy, w oryginalnym opakowaniu. Wszystkie akcesoria dołączone. Możliwość sprawdzenia przed zakupem w naszym sklepie stacjonarnym. Gwarancja producenta 2 lata.",
    specifications: {
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      storage: "256GB",
      ram: "8GB",
      color: "Titan Natural",
      batteryCapacity: "4441mAh",
      screenSize: '6.7"',
      cameraMP: "48MP",
      osType: "iOS",
      osVersion: "17.0",
      frontCamera: "12MP",
      displayTech: "Super Retina XDR",
      wifi: "Wi-Fi 6E",
      bluetooth: "5.3",
      ipRating: "IP68",
      fastCharging: "27W",
      wirelessCharging: "15W MagSafe",
      processor: "Apple A17 Pro",
      gpu: "Apple GPU 6-core",
      screenResolution: "2796 x 1290",
      refreshRate: "120Hz",
    },
    additionalInfo: {
      warranty: "24 miesiące",
      includesCharger: true,
    },
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra 512GB Black",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    price: 4899,
    location: "Kraków, Stare Miasto",
    condition: "LIKE_NEW",
    images: [
      "https://dummyimage.com/600x700/1f2937/fff&text=Galaxy+S24+Front",
      "https://dummyimage.com/600x700/1f2937/fff&text=Galaxy+S24+Back",
      "https://dummyimage.com/600x700/1f2937/fff&text=Galaxy+S24+SPen",
    ],
    seller: "MobileTech Kraków",
    sellerPhone: "+48 987 654 321",
    sellerEmail: "info@mobiletech.pl",
    dateAdded: "2024-09-19",
    views: 892,
    likes: 67,
    description:
      "Samsung Galaxy S24 Ultra z S Pen. Najnowszy model 2024. Telefon fabrycznie nowy, w oryginalnym opakowaniu z wszystkimi akcesoriami.",
    specifications: {
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      storage: "512GB",
      ram: "12GB",
      color: "Phantom Black",
      batteryCapacity: "5000mAh",
      screenSize: '6.8"',
      cameraMP: "200MP",
      osType: "Android",
      osVersion: "14",
      frontCamera: "12MP",
      displayTech: "Dynamic AMOLED 2X",
      wifi: "Wi-Fi 7",
      bluetooth: "5.3",
      ipRating: "IP68",
      fastCharging: "45W",
      wirelessCharging: "15W",
      processor: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      screenResolution: "3120 x 1440",
      refreshRate: "120Hz",
    },
    additionalInfo: {
      warranty: "24 miesiące",
      includesCharger: true,
    },
  },
  {
    id: 3,
    title: "Xiaomi 14 Ultra 512GB White",
    brand: "Xiaomi",
    model: "14 Ultra",
    price: 3299,
    originalPrice: 3699,
    location: "Gdańsk, Śródmieście",
    condition: "VERY_GOOD",
    images: [
      "https://dummyimage.com/600x700/f59e0b/fff&text=Xiaomi+14+Front",
      "https://dummyimage.com/600x700/f59e0b/fff&text=Xiaomi+14+Back",
    ],
    seller: "Anna K.",
    sellerPhone: "+48 555 123 456",
    sellerEmail: "anna.k@email.com",
    dateAdded: "2024-09-18",
    views: 534,
    likes: 34,
    description:
      "Xiaomi 14 Ultra w idealnym stanie. Używany 2 miesiące, bez uszkodzeń. Telefon zawsze w etui i z folią ochronną.",
    specifications: {
      brand: "Xiaomi",
      model: "14 Ultra",
      storage: "512GB",
      ram: "16GB",
      color: "White",
      batteryCapacity: "5300mAh",
      screenSize: '6.73"',
      cameraMP: "50MP",
      osType: "Android",
      osVersion: "14",
      frontCamera: "32MP",
      displayTech: "LTPO AMOLED",
      wifi: "Wi-Fi 7",
      bluetooth: "5.4",
      ipRating: "IP68",
      fastCharging: "90W",
      wirelessCharging: "50W",
      processor: "Snapdragon 8 Gen 3",
      gpu: "Adreno 750",
      screenResolution: "3200 x 1440",
      refreshRate: "120Hz",
    },
    additionalInfo: {
      warranty: "22 miesiące",
      includesCharger: true,
    },
  },
];
