import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { deviceAPI } from '../api';

const CPCBFetch = ({ onDeviceAdded }) => {
  const [RTUserialNumber, setRTUserialNumber] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [responseDetails, setResponseDetails] = useState(null);

  // Get CPCB API URL from environment variables
  const CPCB_API_URL = import.meta.env.VITE_CPCB_API_URL;
  
  // Create axios instance for external CPCB API
  const cpcbApi = axios.create({
    baseURL: CPCB_API_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000
  });

  const handleFetch = async (e) => {
    e.preventDefault();

    if (!RTUserialNumber.trim()) {
      toast.error('Please enter RTUserialNumber');
      return;
    }

    setIsFetching(true);
    setResponseDetails(null);

    try {
      // Direct GET call to external CPCB API
      console.log(`📡 Fetching from: ${CPCB_API_URL}/device?search=${RTUserialNumber}`);
      
      const response = await cpcbApi.get('/device', {
        params: {
          search: RTUserialNumber,
          list: true
        }
      });

      const data = response.data;
      const statusCode = response.status;

      setResponseDetails({
        statusCode: statusCode,
        status: "Success",
        message: "Data fetched successfully from CPCB API"
      });

      if (data && data.stations && data.stations.length > 0) {
        const station = data.stations[0];
        
        // Prepare device data from CPCB response
        const deviceData = {
          RTUserialNumber: station.RTUserialNumber,
          companyName: station.companyName,
          industryId: station.industryId,
          deviceId: station.deviceId,
          deviceName: station.deviceName,
          stationId: station.stationId,
          stationName: station.stationName,
          qes_Sno: station.qes_Sno,
          tokenId: station.tokenId,
          publicKey: station.publicKey,
          latitude: station.latitude,
          longitude: station.longitude,
          devices: station.devices,
          data_sending_enabled: true,
          cpcb_status: "Success",
          cpcb_status_code: statusCode,
          cpcb_message: "Data fetched from CPCB API"
        };

        // Send to your backend to store in MongoDB
        const storeResponse = await deviceAPI.storeCPCBDevice(deviceData);
        const storeData = storeResponse.data;

        if (storeData.success) {
          toast.success(storeData.message || 'Device fetched and stored successfully!');
          setRTUserialNumber('');
          onDeviceAdded();
        } else {
          toast.error(storeData.error || 'Failed to store device');
          setResponseDetails({
            statusCode: statusCode,
            status: "Partial",
            message: storeData.error || 'Data fetched but storage failed'
          });
        }
      } else {
        toast.error('No data found for the given RTUserialNumber');
        setResponseDetails({
          statusCode: 404,
          status: "Failed",
          message: "No stations found in CPCB response"
        });
      }
    } catch (error) {
      console.error('CPCB API Error:', error);
      
      let statusCode = error.response?.status || 500;
      let errorMessage = error.response?.data?.message || error.message || "Failed to fetch from CPCB API";
      
      setResponseDetails({
        statusCode: statusCode,
        status: "Failed",
        message: errorMessage
      });
      
      toast.error(`CPCB API Error: ${errorMessage}`);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">🔄 Fetch from CPCB API</h2>
      <form onSubmit={handleFetch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RTUserialNumber *
          </label>
          <input
            type="text"
            value={RTUserialNumber}
            onChange={(e) => setRTUserialNumber(e.target.value)}
            placeholder="Enter RTUserialNumber (e.g., DEM0426_01)"
            required
            className="input-field"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Enter RTUserialNumber to fetch device data from CPCB API
          </p>
        </div>

        <button
          type="submit"
          disabled={isFetching}
          className="btn-primary w-full"
        >
          {isFetching ? '⏳ Fetching from CPCB...' : '🔍 Fetch from CPCB API'}
        </button>
      </form>

      {responseDetails && (
        <div className={`mt-4 p-3 rounded-lg ${
          responseDetails.status === 'Success' 
            ? 'bg-green-50 border border-green-200' 
            : responseDetails.status === 'Partial'
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            responseDetails.status === 'Success' 
              ? 'text-green-800' 
              : responseDetails.status === 'Partial'
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            <strong>CPCB API Response:</strong><br />
            Status: {responseDetails.status}<br />
            HTTP Code: {responseDetails.statusCode}<br />
            Message: {responseDetails.message}
          </p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>📌 Note:</strong> This makes a GET request to:<br />
          <code className="text-xs break-all">{CPCB_API_URL}/device?search={'{RTUserialNumber}'}&list=true</code><br />
          The response from CPCB API is then stored in your database.
        </p>
      </div>
    </div>
  );
};

export default CPCBFetch;