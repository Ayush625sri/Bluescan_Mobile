import api from './api';
import { PollutionData, PollutionType } from '../types';

export const uploadPollutionImage = async (
  imageUri: string, 
  location: { latitude: number; longitude: number },
  pollutionTypes: PollutionType[],
  notes?: string
) => {
  // Create form data for image upload
  const formData = new FormData();
  
  // Append image file
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type,
  } as any);
  
  // Append metadata
  formData.append('latitude', location.latitude.toString());
  formData.append('longitude', location.longitude.toString());
  formData.append('pollutionTypes', JSON.stringify(pollutionTypes));
  
  if (notes) {
    formData.append('notes', notes);
  }
  
  const response = await api.post('/pollution/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const getPollutionTrends = async (timeframe: 'week' | 'month' | 'year') => {
  // For now, this is mocked data
  // In a real application, this would make an API call
  const response = await api.get(`/pollution/trends?timeframe=${timeframe}`);
  
  // Simulated response
  const mockData = {
    week: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ data: [65, 59, 80, 81, 56, 55, 40] }]
    },
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{ data: [63, 58, 45, 70] }]
    },
    year: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ data: [30, 45, 53, 60, 65, 68, 72, 73, 70, 55, 40, 35] }]
    }
  };
  
  return mockData[timeframe];
};

export const getUserContributions = async () => {
  const response = await api.get('/user/contributions');
  return response.data;
};

export const getRecentUploads = async (limit = 10) => {
  const response = await api.get(`/pollution/recent?limit=${limit}`);
  return response.data.items;
};