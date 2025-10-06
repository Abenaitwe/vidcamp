/**
 * Export Configuration
 * 
 * To use the export functionality, you need to run the backend server.
 * 
 * Setup:
 * 1. Clone the backend repo: https://github.com/Abenaitwe/vidcamp-backend
 * 2. Install Python dependencies: pip install -r requirements.txt
 * 3. Make sure FFMPEG is installed on your system
 * 4. Run the server: python main.py (or uvicorn main:app --reload)
 * 5. The server should run on http://127.0.0.1:8000
 * 
 * You can change the backend URL below if needed:
 */

export const EXPORT_CONFIG = {
  // Backend server URL - change this if your backend runs on a different port or host
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000",
  
  // Export endpoint
  EXPORT_ENDPOINT: "/process",
  
  // Maximum file size warning (in MB)
  MAX_SIZE_WARNING: 100,
};

export const getExportUrl = () => {
  return `${EXPORT_CONFIG.BACKEND_URL}${EXPORT_CONFIG.EXPORT_ENDPOINT}`;
};
