import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { deviceAPI } from '../../api/api';

const DeviceCard = ({ device, onToggle, onDelete, onRefresh }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const response = await deviceAPI.toggleDataSending(device._id);
      const data = response.data;

      if (data.success) {
        toast.success(data.message);
        onToggle(device._id, data.data_sending_enabled);
      } else {
        toast.error(data.error || 'Failed to toggle data sending');
      }
    } catch (error) {
      toast.error('Error toggling data sending');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete device "${device.companyName || device.deviceName}"?`)) {
      setIsDeleting(true);
      try {
        const response = await deviceAPI.deleteDevice(device._id);
        const data = response.data;

        if (data.success) {
          toast.success('Device deleted successfully');
          onDelete(device._id);
        } else {
          toast.error(data.error || 'Failed to delete device');
        }
      } catch (error) {
        toast.error('Error deleting device');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const fetchLogs = async () => {
    if (!showLogs) {
      setLoadingLogs(true);
      try {
        const response = await deviceAPI.getDataLogs(device.deviceId);
        const data = response.data;
        if (data.success) {
          setLogs(data.logs);
        }
      } catch (error) {
        toast.error('Error fetching logs');
      } finally {
        setLoadingLogs(false);
      }
    }
    setShowLogs(!showLogs);
  };

  const getStatusColor = () => {
    if (device.data_sending_enabled) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-red-100 text-red-800';
  };

  const getCPCBStatusColor = () => {
    if (!device.cpcb_status) return 'bg-gray-100 text-gray-600';
    if (device.cpcb_status === 'Success') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  // Extract params from devices array (handle both structures)
  const allParams = device.devices?.flatMap(dev => dev.params || []) || device.params || [];

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
        <div className="w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 break-words">
            {device.deviceName || device.companyName}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">Device ID: {device.deviceId}</p>
          {device.RTUserialNumber && (
            <p className="text-xs text-gray-500 mt-1">RTU: {device.RTUserialNumber}</p>
          )}
          {device.qes_Sno && (
            <p className="text-xs text-gray-500">QES: {device.qes_Sno}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor()}`}>
            {device.data_sending_enabled ? '📡 Sending' : '⏸️ Off'}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-xs sm:text-sm">
        <p><span className="font-medium">🏭 Station:</span> {device.stationName || device.stationId}</p>
        <p><span className="font-medium">📍 Location:</span> {device.latitude}, {device.longitude}</p>
        <p><span className="font-medium">🔑 Token:</span> {device.tokenId ? `${device.tokenId.substring(0, 15)}...` : 'N/A'}</p>

        {allParams.length > 0 && (
          <div className="mt-3">
            <p className="font-medium mb-2">📊 Parameters:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allParams.map((param, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-2">
                  <p className="font-medium text-xs sm:text-sm">{param.parameter}</p>
                  <p className="text-xs text-gray-600">
                    Range: {param.min} - {param.max} {param.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(device.cpcb_status || device.cpcb_status_code) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between gap-1">
              <span className="font-medium">🌐 CPCB Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-center sm:text-left ${getCPCBStatusColor()}`}>
                {device.cpcb_status || 'N/A'} {device.cpcb_status_code && `(${device.cpcb_status_code})`}
              </span>
            </div>
            {device.cpcb_message && (
              <p className="text-xs text-gray-600 mt-1 break-words">
                <span className="font-medium">Message:</span> {device.cpcb_message}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex-1 px-3 py-2 rounded-lg transition-colors duration-200 text-sm ${device.data_sending_enabled
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-green-600 text-white hover:bg-green-700'
            }`}
        >
          {isToggling ? '⏳...' : (device.data_sending_enabled ? '⏸️ Disable' : '▶️ Enable')}
        </button>
        <button
          onClick={fetchLogs}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          📊 {showLogs ? 'Hide' : 'View'} Logs
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 btn-danger text-sm"
        >
          {isDeleting ? '⏳...' : '🗑️ Delete'}
        </button>
      </div>

      {showLogs && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2 text-sm">Recent Data Logs</h4>
          {loadingLogs ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No data logs available</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="bg-gray-50 rounded p-3 text-xs border">

                  <p className="text-gray-500 mb-2">
                    🕒 {new Date(log.timestamp).toLocaleString()}
                  </p>

                  {/* Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-2">
                    {log.parameters?.map((param, pIdx) => (
                      <p key={pIdx} className="text-sm">
                        {param.parameter}: {param.value} {param.unit}
                      </p>
                    ))}
                  </div>

                  {/* CPCB Response */}
                  {(log.cpcb_status || log.cpcb_status_code) && (
                    <div className="mt-2 pt-2 border-t">
                      <p>
                        <span className="font-medium">🌐 CPCB Status:</span>{" "}
                        {log.cpcb_status || "N/A"}
                      </p>

                      {log.cpcb_status_code && (
                        <p>
                          <span className="font-medium">Code:</span> {log.cpcb_status_code}
                        </p>
                      )}

                      {log.cpcb_message && (
                        <p className="text-red-600 break-words">
                          <span className="font-medium">Message:</span> {log.cpcb_message}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceCard;