export interface PricingData {
  payAsYouGo: {
    vcpuUnitPrice: string;
    minimumCharge: string;
  };
  fixedRate: {
    oneYear: {
      contractAmount: string;
      includedAllocation: string;
    };
    threeYear: {
      contractAmount: string;
      includedAllocation: string;
    };
    fiveYear: {
      contractAmount: string;
      includedAllocation: string;
    };
  };
}

export interface Reseller {
  id: string;
  name: string;
  resellerId: string;
  country: string;
  businessRegNo: string;
  ceo: string;
  customerCount: number;
  contractCount: number;
  invitationStatus: 'Accepted' | 'Pending' | 'Expired' | 'Canceled' | 'N/A';
  invitationSentAt?: string | null; // 초대 이메일 발송 날짜 (YYYY. MM. DD 형식)
  contactPerson: string;
  contactEmail: string;
  createdAt: string;
  billingEmails?: string[];
  note: string | null;
  pricing?: Record<string, PricingData>; // Service name -> pricing data
}

export const mockResellers: Reseller[] = [
  {
    id: '1',
    name: 'Megazone',
    resellerId: 'IDIDMDIDMDK',
    country: 'South Korea',
    businessRegNo: '123-456789',
    ceo: 'Jamik Tashpulatov',
    customerCount: 2,
    contractCount: 2,
    invitationStatus: 'Accepted',
    invitationSentAt: '2023. 12. 05',
    contactPerson: 'Eddie Lake',
    contactEmail: 'Eddie@leading.net',
    createdAt: '2023. 12. 11',
    billingEmails: ['aaddie@leadingpoint.net', 'eddeww@leadingpoint.net'],
    note: 'The customer, blah blah blah, the customer, blah blah blah, the customer, blah blah blah.The customer, blah blah blah, the customer, blah blah blah, the customer, blah blah blah.',
    pricing: {
      'Skuber⁺ Management': {
        payAsYouGo: {
          vcpuUnitPrice: '0.50',
          minimumCharge: '100.00',
        },
        fixedRate: {
          oneYear: {
            contractAmount: '10000.00',
            includedAllocation: '1000',
          },
          threeYear: {
            contractAmount: '28000.00',
            includedAllocation: '3200',
          },
          fiveYear: {
            contractAmount: '45000.00',
            includedAllocation: '5500',
          },
        },
      },
      'Skuber⁺ Optimization': {
        payAsYouGo: {
          vcpuUnitPrice: '0.30',
          minimumCharge: '50.00',
        },
        fixedRate: {
          oneYear: {
            contractAmount: '5000.00',
            includedAllocation: '800',
          },
          threeYear: {
            contractAmount: '14000.00',
            includedAllocation: '2500',
          },
          fiveYear: {
            contractAmount: '22000.00',
            includedAllocation: '4200',
          },
        },
      },
    },
  },
  {
    id: '2',
    name: 'Table of contents',
    resellerId: 'RES-20240102',
    country: 'South Korea',
    businessRegNo: '234-567890',
    ceo: 'Kim Manager',
    customerCount: 46,
    contractCount: 50,
    invitationStatus: 'Pending',
    invitationSentAt: '2025. 11. 04',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 01. 15',
    billingEmails: ['billing@tableofcontents.com'],
    note: 'blah blah blah, blah blah blah blah',
    pricing: {
      'Skuber⁺ Management': {
        payAsYouGo: {
          vcpuUnitPrice: '0.45',
          minimumCharge: '80.00',
        },
        fixedRate: {
          oneYear: {
            contractAmount: '8000.00',
            includedAllocation: '900',
          },
          threeYear: {
            contractAmount: '22000.00',
            includedAllocation: '2800',
          },
          fiveYear: {
            contractAmount: '35000.00',
            includedAllocation: '4800',
          },
        },
      },
    },
  },
  {
    id: '3',
    name: 'Executive summary',
    resellerId: 'RES-20240103',
    country: 'Japan',
    businessRegNo: '345-678901',
    ceo: 'Tanaka Ichiro',
    customerCount: 5,
    contractCount: 12,
    invitationStatus: 'Expired',
    invitationSentAt: '2025. 10. 25',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 02. 20',
    billingEmails: ['contact@executive.jp'],
    note: 'blah blah blah, blah blah blah blah',
    pricing: {
      'Skuber⁺ Optimization': {
        payAsYouGo: {
          vcpuUnitPrice: '0.35',
          minimumCharge: '60.00',
        },
        fixedRate: {
          oneYear: {
            contractAmount: '6000.00',
            includedAllocation: '850',
          },
          threeYear: {
            contractAmount: '16000.00',
            includedAllocation: '2600',
          },
          fiveYear: {
            contractAmount: '25000.00',
            includedAllocation: '4500',
          },
        },
      },
    },
  },
  {
    id: '4',
    name: 'Technical approach',
    resellerId: 'RES-20240104',
    country: 'United States',
    businessRegNo: '456-789012',
    ceo: 'John Smith',
    customerCount: 5,
    contractCount: 8,
    invitationStatus: 'N/A',
    invitationSentAt: null,
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 03. 10',
    note: null,
  },
  {
    id: '5',
    name: 'Design',
    resellerId: 'RES-20240105',
    country: 'South Korea',
    businessRegNo: '567-890123',
    ceo: 'Park Designer',
    customerCount: 48,
    contractCount: 45,
    invitationStatus: 'Accepted',
    invitationSentAt: '2024. 04. 01',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 04. 05',
    billingEmails: ['info@design.kr'],
    note: 'blah blah blah, blah blah blah blah',
  },
  {
    id: '6',
    name: 'Capabilities',
    resellerId: 'RES-20240106',
    country: 'South Korea',
    businessRegNo: '678-901234',
    ceo: 'Lee Capability',
    customerCount: 36,
    contractCount: 38,
    invitationStatus: 'Accepted',
    invitationSentAt: '2024. 05. 08',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 05. 12',
    billingEmails: ['support@capabilities.com'],
    note: 'blah blah blah, blah blah blah blah',
  },
  {
    id: '7',
    name: 'Integration with existing systems',
    resellerId: 'RES-20240107',
    country: 'South Korea',
    businessRegNo: '789-012345',
    ceo: 'Choi Integration',
    customerCount: 46,
    contractCount: 58,
    invitationStatus: 'Pending',
    invitationSentAt: '2025. 11. 06',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 06. 18',
    billingEmails: ['sales@integration.kr'],
    note: 'blah blah blah, blah blah blah blah',
  },
  {
    id: '8',
    name: 'Innovation and Advanced Technologies',
    resellerId: 'RES-20240108',
    country: 'South Korea',
    businessRegNo: '890-123456',
    ceo: 'Jung Innovation',
    customerCount: 55,
    contractCount: 22,
    invitationStatus: 'Accepted',
    invitationSentAt: '2024. 07. 20',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 07. 25',
    billingEmails: ['tech@innovation.com'],
    note: 'blah blah blah, blah blah blah blah',
  },
  {
    id: '9',
    name: "Overview of EMR's Integration",
    resellerId: 'RES-20240109',
    country: 'South Korea',
    businessRegNo: '901-234567',
    ceo: 'Kang EMR',
    customerCount: 1,
    contractCount: 1,
    invitationStatus: 'Pending',
    invitationSentAt: '2025. 11. 05',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 08. 30',
    billingEmails: ['contact@emr.kr'],
    note: 'blah blah blah, blah blah blah blah',
  },
  {
    id: '10',
    name: 'Advanced Algorithms and Analytics',
    resellerId: 'RES-20240110',
    country: 'South Korea',
    businessRegNo: '012-345678',
    ceo: 'Yoon Algorithm',
    customerCount: 2,
    contractCount: 2,
    invitationStatus: 'Accepted',
    invitationSentAt: '2024. 09. 10',
    contactPerson: '김영업',
    contactEmail: 'partner@mega.com',
    createdAt: '2024. 09. 15',
    billingEmails: ['analytics@advanced.com'],
    note: 'blah blah blah, blah blah blah blah',
  },
];
