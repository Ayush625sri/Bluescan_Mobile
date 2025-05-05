export interface PollutionType {
    id: string;
    name: string;
    color: string;
  }
  
  export interface PollutionData {
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    latitude: number;
    longitude: number;
    pollutionTypes: PollutionType[];
    severity: number;
    timestamp: string;
    userId: string;
    status: 'pending' | 'analyzed' | 'verified';
  }
  
  export interface User {
    id: string;
    username: string;
    email: string;
    profilePicture?: string;
    contributionPoints: number;
    contributionCount: number;
    createdAt: string;
  }
  
  export interface ContributionStats {
    total: number;
    thisWeek: number;
    thisMonth: number;
    byType: {
      [key: string]: number;
    };
  }