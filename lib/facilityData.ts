/**
 * Ontario Pediatric Facility Database & Postal Code Proximity Helper
 */

import { TriageCategory } from './aboutKidsHealthLogic';

export interface FacilityCoordinates {
  latitude: number;
  longitude: number;
}

export interface PediatricFacility {
  id: string;
  name: string;
  shortName: string;
  city: string;
  address: string;
  postalCode: string;
  fsaPrefix: string; // First 3 chars of postal code (e.g. M5G)
  phone: string;
  emergencyPhone: string;
  pediatricLevel: 'Level 1 Pediatric Trauma' | 'Level 2 Specialized Pediatric ER' | 'Pediatric Emergency & Urgent Care';
  waitTimeMinutes: number; // Mock live wait time
  is247: boolean;
  capabilities: string[];
  coordinates: FacilityCoordinates;
  websiteUrl: string;
}

export const ONTARIO_PEDIATRIC_FACILITIES: PediatricFacility[] = [
  {
    id: 'sickkids',
    name: 'The Hospital for Sick Children (SickKids)',
    shortName: 'SickKids Toronto',
    city: 'Toronto',
    address: '555 University Avenue, Toronto, ON',
    postalCode: 'M5G 1X8',
    fsaPrefix: 'M5G',
    phone: '(416) 813-1500',
    emergencyPhone: '(416) 813-6900',
    pediatricLevel: 'Level 1 Pediatric Trauma',
    waitTimeMinutes: 14,
    is247: true,
    capabilities: [
      'Pediatric Emergency & Trauma',
      'Comprehensive Pediatric Surgery',
      'Pediatric ICU (PICU) & Neonatal ICU (NICU)',
      'Poison & Toxicology Center',
    ],
    coordinates: { latitude: 43.6577, longitude: -79.3887 },
    websiteUrl: 'https://www.sickkids.ca',
  },
  {
    id: 'cheo',
    name: "Children's Hospital of Eastern Ontario (CHEO)",
    shortName: 'CHEO Ottawa',
    city: 'Ottawa',
    address: '401 Smyth Road, Ottawa, ON',
    postalCode: 'K1H 8L1',
    fsaPrefix: 'K1H',
    phone: '(613) 737-7600',
    emergencyPhone: '(613) 737-7600 x0',
    pediatricLevel: 'Level 1 Pediatric Trauma',
    waitTimeMinutes: 18,
    is247: true,
    capabilities: [
      'Regional Pediatric Emergency',
      'Eastern Ontario Child Crisis Centre',
      'Pediatric ICU & Resuscitation',
    ],
    coordinates: { latitude: 45.4014, longitude: -75.6517 },
    websiteUrl: 'https://www.cheo.on.ca',
  },
  {
    id: 'mcmaster',
    name: "McMaster Children's Hospital",
    shortName: 'McMaster Hamilton',
    city: 'Hamilton',
    address: '1200 Main Street West, Hamilton, ON',
    postalCode: 'L8N 3Z5',
    fsaPrefix: 'L8N',
    phone: '(905) 521-2100',
    emergencyPhone: '(905) 521-2100 x72000',
    pediatricLevel: 'Level 1 Pediatric Trauma',
    waitTimeMinutes: 11,
    is247: true,
    capabilities: [
      'Regional Pediatric Trauma Unit',
      'Children’s Mental Health Emergency',
      'Pediatric Critical Care Unit',
    ],
    coordinates: { latitude: 43.2609, longitude: -79.9192 },
    websiteUrl: 'https://www.hamiltonhealthsciences.ca/mcmaster-childrens-hospital/',
  },
  {
    id: 'lhsc',
    name: "Children's Hospital at London Health Sciences Centre",
    shortName: 'Children’s Hospital LHSC London',
    city: 'London',
    address: '800 Commissioners Road East, London, ON',
    postalCode: 'N6A 5W9',
    fsaPrefix: 'N6A',
    phone: '(519) 685-8500',
    emergencyPhone: '(519) 685-8141',
    pediatricLevel: 'Level 1 Pediatric Trauma',
    waitTimeMinutes: 15,
    is247: true,
    capabilities: [
      'Southwestern Ontario Regional Peds ER',
      'Paediatric Critical Care Unit',
      'Neonatal Transport & Intensive Care',
    ],
    coordinates: { latitude: 42.9592, longitude: -81.2255 },
    websiteUrl: 'https://www.lhsc.on.ca/childrens-hospital',
  },
  {
    id: 'markham_stouffville',
    name: 'Oak Valley Health - Markham Stouffville Hospital',
    shortName: 'Markham Stouffville Peds ER',
    city: 'Markham',
    address: '381 Church Street, Markham, ON',
    postalCode: 'L3P 7P3',
    fsaPrefix: 'L3P',
    phone: '(905) 472-7000',
    emergencyPhone: '(905) 472-7000 x6100',
    pediatricLevel: 'Level 2 Specialized Pediatric ER',
    waitTimeMinutes: 9,
    is247: true,
    capabilities: [
      'Dedicated Pediatric Emergency Zone',
      'Child-Friendly Waiting Area',
      'Rapid Pediatric Assessment Clinic',
    ],
    coordinates: { latitude: 43.8821, longitude: -79.2483 },
    websiteUrl: 'https://www.oakvalleyhealth.ca',
  },
  {
    id: 'humber_river',
    name: 'Humber River Health Pediatric Emergency',
    shortName: 'Humber River Toronto',
    city: 'Toronto',
    address: '1235 Wilson Avenue, Toronto, ON',
    postalCode: 'M3M 0B2',
    fsaPrefix: 'M3M',
    phone: '(416) 242-1000',
    emergencyPhone: '(416) 242-1000 x51000',
    pediatricLevel: 'Level 2 Specialized Pediatric ER',
    waitTimeMinutes: 16,
    is247: true,
    capabilities: [
      'Digital Pediatric ER',
      'Paediatric Urgent Clinic',
      'Pediatric Inpatient Unit',
    ],
    coordinates: { latitude: 43.7251, longitude: -79.4996 },
    websiteUrl: 'https://www.hrh.ca',
  },
  {
    id: 'credit_valley',
    name: 'Trillium Health Partners - Credit Valley Hospital',
    shortName: 'Credit Valley Mississauga',
    city: 'Mississauga',
    address: '2200 Eglinton Avenue West, Mississauga, ON',
    postalCode: 'L5M 2N1',
    fsaPrefix: 'L5M',
    phone: '(905) 813-2200',
    emergencyPhone: '(905) 813-2200 x4000',
    pediatricLevel: 'Level 2 Specialized Pediatric ER',
    waitTimeMinutes: 13,
    is247: true,
    capabilities: [
      'Pediatric Emergency Assessment',
      'Child Life Specialist Support',
      'Short Stay Paediatric Unit',
    ],
    coordinates: { latitude: 43.5574, longitude: -79.7042 },
    websiteUrl: 'https://www.trilliumhealthpartners.ca',
  },
  {
    id: 'north_york_general',
    name: 'North York General Hospital Pediatric Emergency',
    shortName: 'North York General Toronto',
    city: 'Toronto',
    address: '4001 Leslie Street, Toronto, ON',
    postalCode: 'M2K 1E1',
    fsaPrefix: 'M2K',
    phone: '(416) 756-6000',
    emergencyPhone: '(416) 756-6000 x3000',
    pediatricLevel: 'Pediatric Emergency & Urgent Care',
    waitTimeMinutes: 10,
    is247: true,
    capabilities: [
      'Pediatric Emergency Department',
      'Child & Teen Urgent Assessment',
      'Pediatric Outpatient Care',
    ],
    coordinates: { latitude: 43.7694, longitude: -79.3638 },
    websiteUrl: 'https://www.nygh.on.ca',
  },
];

export const ONTARIO_URGENT_CARE_CLINICS: PediatricFacility[] = [
  {
    id: 'toronto_peds_uc',
    name: 'KidCare Pediatric Urgent Care Clinic',
    shortName: 'KidCare Toronto',
    city: 'Toronto',
    address: '150 Eglinton Avenue East, Toronto, ON',
    postalCode: 'M4P 1E8',
    fsaPrefix: 'M4P',
    phone: '(416) 488-5437',
    emergencyPhone: '(416) 488-5437',
    pediatricLevel: 'Pediatric Emergency & Urgent Care',
    waitTimeMinutes: 25,
    is247: false,
    capabilities: [
      'Minor Illness Assessment',
      'Stitches & Laceration Care',
      'Mild Asthma Treatment',
      'On-site X-Ray & Splinting',
    ],
    coordinates: { latitude: 43.7067, longitude: -79.3948 },
    websiteUrl: 'https://www.kidcareurgentcare.ca',
  },
  {
    id: 'mississauga_peds_uc',
    name: 'Peel Pediatric Urgent Care Clinic',
    shortName: 'Peel UC Mississauga',
    city: 'Mississauga',
    address: '100 City Centre Drive, Mississauga, ON',
    postalCode: 'L5B 2C9',
    fsaPrefix: 'L5B',
    phone: '(905) 896-1234',
    emergencyPhone: '(905) 896-1234',
    pediatricLevel: 'Pediatric Emergency & Urgent Care',
    waitTimeMinutes: 15,
    is247: false,
    capabilities: [
      'Pediatric Walk-in Clinic',
      'Dehydration & Rehydration Therapy',
      'Mild Allergy Management',
    ],
    coordinates: { latitude: 43.5930, longitude: -79.6425 },
    websiteUrl: 'https://www.peelpediatricurgentcare.ca',
  },
  {
    id: 'ottawa_peds_uc',
    name: 'Ottawa East Pediatric Urgent Care',
    shortName: 'Ottawa East UC',
    city: 'Ottawa',
    address: '1910 St. Laurent Boulevard, Ottawa, ON',
    postalCode: 'K1G 1A4',
    fsaPrefix: 'K1G',
    phone: '(613) 523-9876',
    emergencyPhone: '(613) 523-9876',
    pediatricLevel: 'Pediatric Emergency & Urgent Care',
    waitTimeMinutes: 20,
    is247: false,
    capabilities: [
      'Urgent Pediatric Consultations',
      'Minor Sports Injuries',
      'Fever & Ear Infection Care',
    ],
    coordinates: { latitude: 45.3854, longitude: -75.6321 },
    websiteUrl: 'https://www.ottawapedsurgentcare.ca',
  },
];

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Simple FSA coordinate mapper for Ontario postal code prefixes.
 */
const ONTARIO_FSA_COORDINATES: Record<string, FacilityCoordinates> = {
  // Toronto / GTA
  M5G: { latitude: 43.6577, longitude: -79.3887 },
  M3M: { latitude: 43.7251, longitude: -79.4996 },
  M2K: { latitude: 43.7694, longitude: -79.3638 },
  M4W: { latitude: 43.6777, longitude: -79.3828 },
  M5T: { latitude: 43.6532, longitude: -79.3980 },
  L3P: { latitude: 43.8821, longitude: -79.2483 },
  L5M: { latitude: 43.5574, longitude: -79.7042 },
  L5N: { latitude: 43.59, longitude: -79.78 },
  L4B: { latitude: 43.8491, longitude: -79.3875 },
  L4J: { latitude: 43.8052, longitude: -79.4512 },
  // Hamilton / Niagara
  L8N: { latitude: 43.2609, longitude: -79.9192 },
  L8P: { latitude: 43.2557, longitude: -79.8711 },
  // Ottawa / Eastern ON
  K1H: { latitude: 45.4014, longitude: -75.6517 },
  K1P: { latitude: 45.4215, longitude: -75.6972 },
  // London / Western ON
  N6A: { latitude: 42.9592, longitude: -81.2255 },
  N6G: { latitude: 43.0033, longitude: -81.2764 },
};

export interface FacilityWithDistance extends PediatricFacility {
  distanceKm: number;
}

/**
 * Resolves any Canadian postal code prefix to coordinates.
 */
export function getCoordinatesForPostalCode(postal: string): FacilityCoordinates {
  const clean = postal.toUpperCase().replace(/\s+/g, '');
  if (clean.length < 3) return { latitude: 43.65, longitude: -79.40 };

  const fsa = clean.substring(0, 3);
  if (ONTARIO_FSA_COORDINATES[fsa]) {
    return ONTARIO_FSA_COORDINATES[fsa];
  }

  const fsaPrefix2 = clean.substring(0, 2);
  const twoCharMappings: Record<string, FacilityCoordinates> = {
    // Toronto
    'M1': { latitude: 43.7764, longitude: -79.2318 },
    'M2': { latitude: 43.7680, longitude: -79.4130 },
    'M3': { latitude: 43.7251, longitude: -79.4996 },
    'M4': { latitude: 43.6864, longitude: -79.3762 },
    'M5': { latitude: 43.6577, longitude: -79.3887 },
    'M6': { latitude: 43.6601, longitude: -79.4589 },
    'M8': { latitude: 43.6229, longitude: -79.5061 },
    'M9': { latitude: 43.6878, longitude: -79.5828 },
    
    // GTA / Central
    'L1': { latitude: 43.8971, longitude: -78.8658 },
    'L2': { latitude: 43.1594, longitude: -79.2449 },
    'L3': { latitude: 43.8561, longitude: -79.3370 },
    'L4': { latitude: 43.8012, longitude: -79.5369 },
    'L5': { latitude: 43.5890, longitude: -79.6441 },
    'L6': { latitude: 43.6853, longitude: -79.7599 },
    'L7': { latitude: 43.3248, longitude: -79.7969 },
    'L8': { latitude: 43.2557, longitude: -79.8711 },
    'L9': { latitude: 44.3894, longitude: -79.6903 },
    
    // Ottawa / Eastern
    'K1': { latitude: 45.4215, longitude: -75.6972 },
    'K2': { latitude: 45.3483, longitude: -75.7583 },
    'K7': { latitude: 44.2312, longitude: -76.4860 },
    
    // Southwestern
    'N1': { latitude: 43.5448, longitude: -80.2476 },
    'N2': { latitude: 43.4516, longitude: -80.4925 },
    'N3': { latitude: 43.1394, longitude: -80.2644 },
    'N5': { latitude: 42.9849, longitude: -81.2453 },
    'N6': { latitude: 42.9849, longitude: -81.2453 },
    'N8': { latitude: 42.3149, longitude: -83.0364 },
    
    // Northern
    'P3': { latitude: 46.4917, longitude: -81.0123 },
    'P7': { latitude: 48.3809, longitude: -89.2477 },
  };

  if (twoCharMappings[fsaPrefix2]) {
    return twoCharMappings[fsaPrefix2];
  }

  const regionChar = clean.charAt(0);
  if (regionChar === 'K') {
    return { latitude: 45.43, longitude: -75.72 };
  } else if (regionChar === 'L') {
    return { latitude: 43.65, longitude: -79.75 };
  } else if (regionChar === 'N') {
    return { latitude: 42.99, longitude: -81.20 };
  } else if (regionChar === 'P') {
    return { latitude: 46.50, longitude: -81.00 };
  }

  return { latitude: 43.65, longitude: -79.40 };
}

/**
 * Lookup helper returning pediatric facilities sorted by proximity to a postal code.
 */
export function findNearestFacilities(
  userPostalCode?: string,
  category?: TriageCategory
): FacilityWithDistance[] {
  const userCoord = getCoordinatesForPostalCode(userPostalCode || 'M5G 1X8');

  let facilitiesSource = ONTARIO_PEDIATRIC_FACILITIES;
  if (category === 'MODERATE_URGENT_CARE') {
    facilitiesSource = ONTARIO_URGENT_CARE_CLINICS;
  } else if (category === 'LOW_PRIMARY_CARE') {
    return [];
  }

  const listWithDistance = facilitiesSource.map((facility) => {
    const distanceKm = calculateHaversineDistance(
      userCoord.latitude,
      userCoord.longitude,
      facility.coordinates.latitude,
      facility.coordinates.longitude
    );
    return {
      ...facility,
      distanceKm,
    };
  });

  // Sort by distance ascending
  listWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return listWithDistance;
}
