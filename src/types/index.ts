export interface LandData {
  address: string;
  usage: string;
  siteArea: number;
}

export interface LandInfo {
  zoneType: string;
  volumeRatio: string;
  buildingCoverageRatio: string;
  firePreventionArea: string;
  frontRoadWidth: string;
}

export interface ApplicationCard {
  id: string;
  title: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  estimatedDays: number;
  documents: string[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  duration: number;
  startDate: Date;
  endDate: Date;
  dependencies?: string[];
  application?: string;
}

export interface AppState {
  currentStep: number;
  landData: LandData | null;
  landInfo: LandInfo | null;
  selectedApplications: ApplicationCard[];
  selectedPhase: string;
  projectSchedule: ProjectPhase[];
}