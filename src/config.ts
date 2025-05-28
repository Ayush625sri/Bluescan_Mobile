// Development environment
const DEV_API_URL = ' https://1046-2405-201-6009-9813-d95-ae22-d4b6-ab30.ngrok-free.app/api/v1';
const DEV_SOCKET_URL = ' https://1046-2405-201-6009-9813-d95-ae22-d4b6-ab30.ngrok-free.app';

// Production environment
const PROD_API_URL = 'https://api.bluescan.com/api';
const PROD_SOCKET_URL = 'https://api.bluescan.com';

// Set environment based on ENV variable or default to development
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const API_URL = IS_PRODUCTION ? PROD_API_URL : DEV_API_URL;
export const SOCKET_URL = IS_PRODUCTION ? PROD_SOCKET_URL : DEV_SOCKET_URL;

export const APP_CONFIG = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  imageQuality: 0.7,
  maxUploadRetries: 3,
  uploadTimeout: 30000, // 30 seconds
  locationAccuracy: 'high',
};