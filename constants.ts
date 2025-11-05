import { User, Role, Branch, FilmType, PaymentMethod, FilmStatus, SalesRecord, CommissionSettings } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Admin User', role: Role.Admin },
  { id: 2, name: 'Manager User', role: Role.Manager },
  { id: 3, name: 'Executive User', role: Role.Executive },
];

export const BRANCHES: Branch[] = ['Mahasarakham', 'Kalasin'];

export const CAR_MODELS: string[] = [
  'Dolphin standard', 'Dolphin Extended', 'Atto 3 MY23', 'Atto 3 MY 24',
  'M6 Standard', 'M6 Premium', 'Seal dynamic', 'Seal Premium',
  'Seal Performance', 'Sealion 6 DMi dynamic', 'Sealion 6 DMi premium',
  'Sealion 6 Dmi Force Edge', 'Sealion 7 Premium', 'Sealion 7 Performance',
  'Seal 5 Dmi Premium'
];

export const FILM_TYPES: FilmType[] = ['XUD MAX II', 'Lamina CM-one', 'X-tra cole', 'None'];
export const FILM_STATUSES: FilmStatus[] = ['ติดตั้งแล้ว', 'รอติด'];
export const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'TTB', 'KL', 'AY'];

export const LAMINA_FILM_ACCESSORY_ID = 999;

export const INITIAL_COMMISSION_SETTINGS: CommissionSettings = {
  carModelCommissions: CAR_MODELS.map(model => ({ modelName: model, commission: 5000 })),
  processingFeePercentage: 3,
  stepBonuses: [
    { carCount: 5, bonusAmount: 5000 },
    { carCount: 8, bonusAmount: 10000 },
    { carCount: 10, bonusAmount: 15000 },
  ],
  accessories: [
    { id: LAMINA_FILM_ACCESSORY_ID, name: 'Lamina Film', commissionType: 'percentage', commissionValue: 20 },
    { id: 1, name: 'Premium Floor Mats', commissionType: 'percentage', commissionValue: 10 },
    { id: 2, name: 'Body Kit', commissionType: 'percentage', commissionValue: 5 },
    { id: 3, name: 'Extended Warranty', commissionType: 'fixed', commissionValue: 500 },
    { id: 4, name: 'Paint Protection', commissionType: 'percentage', commissionValue: 10 },
  ],
  salespeople: [
    'Alice', 'Bob', 'Charlie', 'David', 'Eve',
    'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy',
    'Mallory', 'Niaj', 'Olivia', 'Peggy', 'Rupert',
    'Sybil', 'Trent', 'Ulysses', 'Victor', 'Walter'
  ],
};

// Mock data to start with
export const INITIAL_SALES_RECORDS: SalesRecord[] = [
  {
    id: 1,
    salespersonMonthlyCarCount: 1,
    deliveryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    branch: 'Mahasarakham',
    salespersonName: 'Alice',
    customerName: 'John Doe',
    carModel: 'Atto 3 MY 24',
    carColor: 'White',
    stockLocation: 'Mahasarakham',
    filmType: 'XUD MAX II',
    filmStatus: 'ติดตั้งแล้ว',
    freebies: 'Floor mats, key cover',
    paymentMethod: 'TTB',
    notes: 'Customer wants delivery in the morning.',
    accessories: [
        { accessoryId: LAMINA_FILM_ACCESSORY_ID, price: 5000 },
        { accessoryId: 1, price: 3000 }, 
        { accessoryId: 3, price: 10000 }
    ],
    status: 'Pending Manager Approval',
    carCommission: 5000,
    processingFeeDeduction: 150,
    netCommission: 6150, // 5000 - 150 + (5000*0.2) + (3000*0.1) + 500
    isPaid: false,
    paymentDate: null,
  },
  {
    id: 2,
    salespersonMonthlyCarCount: 2,
    deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    branch: 'Kalasin',
    salespersonName: 'Alice',
    customerName: 'Jane Smith',
    carModel: 'Seal Performance',
    carColor: 'Blue',
    stockLocation: 'Kalasin',
    filmType: 'None',
    filmStatus: 'รอติด',
    freebies: '',
    paymentMethod: 'Cash',
    notes: '',
    accessories: [],
    status: 'Pending Executive Finalization',
    carCommission: 5000,
    processingFeeDeduction: 150,
    netCommission: 4850,
    isPaid: false,
    paymentDate: null,
  },
  {
    id: 3,
    salespersonMonthlyCarCount: 1,
    deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Future date
    branch: 'Mahasarakham',
    salespersonName: 'Bob',
    customerName: 'Peter Jones',
    carModel: 'Dolphin Extended',
    carColor: 'Grey',
    stockLocation: 'Mahasarakham',
    filmType: 'Lamina CM-one',
    filmStatus: 'รอติด',
    freebies: 'Charger',
    paymentMethod: 'AY',
    notes: 'Delivery date is tentative.',
    accessories: [],
    status: 'Pending Admin',
    carCommission: 5000,
    processingFeeDeduction: 150,
    netCommission: 4850,
    isPaid: false,
    paymentDate: null,
  },
];