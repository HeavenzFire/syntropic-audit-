

import { ContractData } from './types';

// Seeded with high-fidelity narrative data representing real-world surveillance capitalism vectors.
// These entries mimic actual federal procurement descriptions for high-risk technologies.
export const MOCK_DATA: Omit<ContractData, 'id' | 'status' | 'confidenceScore' | 'provenance'>[] = [
  {
    recipient: "PALANTIR USG INC.",
    amount: 480000000.00,
    description: "MAVEN SMART SYSTEM: GEOINT AI INTEGRATION FOR REAL-TIME TARGET ACQUISITION & PATTERN OF LIFE ANALYSIS",
    category: "ARTIFICIAL INTELLIGENCE",
    timestamp: "2024-05-12T14:20:00"
  },
  {
    recipient: "CLEARVIEW AI",
    amount: 4200000.00,
    description: "UNLIMITED LICENSE: FACIAL RECOGNITION DATABASE ACCESS FOR DHS/ICE - 30 BILLION IMAGE INDEX",
    category: "FACIAL RECOGNITION",
    timestamp: "2024-04-10T09:15:00"
  },
  {
    recipient: "ANDURIL INDUSTRIES",
    amount: 98000000.00,
    description: "DIVR SYSTEM: AUTONOMOUS BORDER SENTRY TOWERS WITH INFRARED/THERMAL HUMAN DETECTION & TRACKING",
    category: "AUTONOMOUS WEAPON",
    timestamp: "2024-05-28T10:00:00"
  },
  {
    recipient: "LEIDOS INC",
    amount: 24000000.00,
    description: "BIOMETRIC IDENTIFICATION SYSTEM (IDENT) MODERNIZATION: IRIS/FINGERPRINT/FACE FUSION FOR FBI",
    category: "BIOMETRIC",
    timestamp: "2024-03-22T16:30:00"
  },
  {
    recipient: "GENERAL ATOMICS AERONAUTICAL",
    amount: 175000000.00,
    description: "MQ-9 REAPER AI UPGRADE: AUTONOMOUS FLIGHT & TARGET RECOGNITION MODULES FOR URBAN ENVIRONMENTS",
    category: "DRONE",
    timestamp: "2024-06-01T11:45:00"
  },
  {
    recipient: "LEXISNEXIS SPECIAL SERVICES",
    amount: 16500000.00,
    description: "ACCURINT VIRTUAL CRIME CENTER: AGGREGATED SOCIAL MEDIA & UTILITY DATA FOR PREDICTIVE POLICING",
    category: "MASS DATA COLLECTION",
    timestamp: "2024-02-15T13:20:00"
  },
  {
    recipient: "DATAMINR INC",
    amount: 12000000.00,
    description: "FIRST ALERT: REAL-TIME SOCIAL MEDIA MONITORING FOR CIVIL UNREST & DISSENT TRACKING",
    category: "SURVEILLANCE",
    timestamp: "2024-04-05T08:50:00"
  },
  {
    recipient: "CELLEBRITE INC",
    amount: 8500000.00,
    description: "UNIVERSAL FORENSIC EXTRACTION DEVICE (UFED) FOR MOBILE DEVICE ENCRYPTION BYPASS",
    category: "SURVEILLANCE",
    timestamp: "2024-01-12T12:00:00"
  },
  {
    recipient: "SHOTSPOTTER (SOUNDTHINKING)",
    amount: 5400000.00,
    description: "ACOUSTIC GUNSHOT DETECTION NETWORK: URBAN SENSORS WITH ALWAYS-ON AUDIO CAPTURE",
    category: "SURVEILLANCE",
    timestamp: "2024-06-10T04:15:00"
  },
  {
    recipient: "IDEMIA IDENTITY & SECURITY",
    amount: 32000000.00,
    description: "NGI (NEXT GENERATION IDENTIFICATION): RAPID DNA PROFILING AND FACIAL MATCHING AT SCALE",
    category: "BIOMETRIC",
    timestamp: "2024-05-05T10:30:00"
  },
  {
    recipient: "GABRIEL GABRIEL",
    amount: 1500000.00,
    description: "PREDICTIVE BEHAVIORAL ANALYTICS SUITE FOR INSIDER THREAT DETECTION",
    category: "BEHAVIORAL PREDICTION",
    timestamp: "2024-06-12T09:00:00"
  },
  {
    recipient: "BANJO (UBICQUITY)",
    amount: 21000000.00,
    description: "EVENT DETECTION ENGINE: INTEGRATING CCTV, TRAFFIC CAMS, AND 911 CALLS FOR REAL-TIME SURVEILLANCE",
    category: "MASS DATA COLLECTION",
    timestamp: "2024-03-01T14:00:00"
  }
];

export const TARGET_KEYWORDS = [
  "SURVEILLANCE",
  "BIOMETRIC",
  "FACIAL RECOGNITION",
  "DRONE",
  "ARTIFICIAL INTELLIGENCE",
  "AUTONOMOUS WEAPON",
  "BEHAVIORAL PREDICTION",
  "PSYOP",
  "MASS DATA COLLECTION",
  "SOCIAL CREDIT",
  "NEURO-MARKETING",
  "PREDICTIVE POLICING",
  "GEOINT",
  "SIGINT"
];

export const COMPLEX_DATASETS = [
    "Global Financial Transaction Ledger (10PB)",
    "Dark Web Market Topology Graph",
    "Real-time Satellite GEOINT Stream",
    "Encrypted State Actor Comms (Decrypted)",
    "Genome Sequence of Biometric Targets",
    "Global IoT Sentinel Telemetry",
    "High-Frequency Trading Algorithms (Reverse Engineered)"
];