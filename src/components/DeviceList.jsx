import React, { useState, useEffect, useMemo } from 'react';
import DeviceCard from './DeviceCard';
import toast from 'react-hot-toast';
import { deviceAPI } from '../../api/api';

const DeviceList = ({ refreshTrigger, onStatsUpdate }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sendingData, setSendingData] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, [refreshTrigger]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceAPI.getAllDevices();
      const data = response.data;

      if (data.success) {
        setDevices(data.devices);
        if (onStatsUpdate) {
          onStatsUpdate(data.devices);
        }
      } else {
        toast.error('Failed to fetch devices');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Error fetching devices');
    } finally {
      setLoading(false);
    }
  };

  const handleManualDataSend = async () => {
    setSendingData(true);
    try {
      const response = await deviceAPI.triggerScheduler();
      const data = response.data;
      if (data.success) {
        toast.success(data.message || 'Data sent successfully!');
      } else {
        toast.error(data.error || 'Failed to send data');
      }
    } catch (error) {
      toast.error('Error sending data');
    } finally {
      setSendingData(false);
    }
  };

  const handleToggle = (deviceId, newStatus) => {
    const updatedDevices = devices.map(device =>
      device._id === deviceId ? { ...device, data_sending_enabled: newStatus } : device
    );
    setDevices(updatedDevices);
    if (onStatsUpdate) {
      onStatsUpdate(updatedDevices);
    }
  };

  const handleDelete = (deviceId) => {
    const updatedDevices = devices.filter(device => device._id !== deviceId);
    setDevices(updatedDevices);
    if (onStatsUpdate) {
      onStatsUpdate(updatedDevices);
    }
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      if (filter === 'active') return device.data_sending_enabled === true;
      if (filter === 'inactive') return device.data_sending_enabled === false;
      return true;
    });
  }, [devices, filter]);

  const activeCount = devices.filter(d => d.data_sending_enabled).length;
  const inactiveCount = devices.filter(d => !d.data_sending_enabled).length;

  if (loading) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">📱 Registered Devices</h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleManualDataSend}
            disabled={sendingData}
            className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            {sendingData ? '⏳ Sending...' : '🚀 Send Data Now'}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({devices.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs sm:text-sm text-blue-800">
          <strong>⏰ Data Schedule:</strong> Data is automatically sent at :00, :15, :30, :45 minutes past each hour.
          Use the toggle switch on each device to enable/disable data sending.
        </p>
      </div>

      {filteredDevices.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No devices found</p>
          <p className="text-sm text-gray-400 mt-2">Add a device using the form above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDevices.map(device => (
            <DeviceCard
              key={device._id}
              device={device}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onRefresh={fetchDevices}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceList;