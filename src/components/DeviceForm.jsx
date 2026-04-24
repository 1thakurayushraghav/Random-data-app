import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { deviceAPI } from '../api/api';

const DeviceForm = ({ onDeviceAdded }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    industryId: '',
    deviceId: '',
    deviceName: '',
    stationId: '',
    stationName: '',
    tokenId: '',
    publicKey: '',
    latitude: '',
    longitude: '',
    devices: [{
      deviceId: '',
      params: [{ parameter: '', unit: '', min: '', max: '', precision: 1, random: true }]
    }],
    data_sending_enabled: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeviceChange = (deviceIndex, field, value) => {
    const updatedDevices = [...formData.devices];
    updatedDevices[deviceIndex][field] = value;
    setFormData(prev => ({ ...prev, devices: updatedDevices }));
  };

  const handleParameterChange = (deviceIndex, paramIndex, field, value) => {
    const updatedDevices = [...formData.devices];
    updatedDevices[deviceIndex].params[paramIndex][field] = value;
    setFormData(prev => ({ ...prev, devices: updatedDevices }));
  };

  const addDevice = () => {
    setFormData(prev => ({
      ...prev,
      devices: [...prev.devices, {
        deviceId: '',
        params: [{ parameter: '', unit: '', min: '', max: '', precision: 1, random: true }]
      }]
    }));
  };

  const removeDevice = (deviceIndex) => {
    if (formData.devices.length > 1) {
      setFormData(prev => ({
        ...prev,
        devices: prev.devices.filter((_, i) => i !== deviceIndex)
      }));
    }
  };

  const addParameter = (deviceIndex) => {
    const updatedDevices = [...formData.devices];
    updatedDevices[deviceIndex].params.push({ parameter: '', unit: '', min: '', max: '', precision: 1, random: true });
    setFormData(prev => ({ ...prev, devices: updatedDevices }));
  };

  const removeParameter = (deviceIndex, paramIndex) => {
    const updatedDevices = [...formData.devices];
    if (updatedDevices[deviceIndex].params.length > 1) {
      updatedDevices[deviceIndex].params = updatedDevices[deviceIndex].params.filter((_, i) => i !== paramIndex);
      setFormData(prev => ({ ...prev, devices: updatedDevices }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await deviceAPI.addDevice(formData);
      const data = response.data;

      if (data.success) {
        toast.success('Device added successfully!');

        setFormData({
          companyName: '',
          industryId: '',
          deviceId: '',
          deviceName: '',
          stationId: '',
          stationName: '',
          tokenId: '',
          publicKey: '',
          latitude: '',
          longitude: '',
          devices: [{
            deviceId: '',
            params: [{ parameter: '', unit: '', min: '', max: '', precision: 1, random: true }]
          }],
          data_sending_enabled: true
        });

        onDeviceAdded?.();
      } else {
        toast.error(data.error || 'Failed to add device');
      }

    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.message ||
        "Server error";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">📝 Manual Device Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry ID *</label>
            <input type="text" name="industryId" value={formData.industryId} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device ID *</label>
            <input type="text" name="deviceId" value={formData.deviceId} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Name *</label>
            <input type="text" name="deviceName" value={formData.deviceName} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Station ID *</label>
            <input type="text" name="stationId" value={formData.stationId} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Station Name *</label>
            <input type="text" name="stationName" value={formData.stationName} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token ID *</label>
            <input type="text" name="tokenId" value={formData.tokenId} onChange={handleInputChange} required className="input-field" />
          </div>
          
          {/* ✅ UPDATED: Public Key field - Now resizable textarea */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Key * 
              <span className="text-xs text-gray-500 ml-2">(PEM format - resizable)</span>
            </label>
            <textarea
              name="publicKey"
              value={formData.publicKey}
              onChange={handleInputChange}
              required
              rows={4}
              className="input-field font-mono text-xs resize-y min-h-[100px]"
              placeholder="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Tip: You can drag the bottom-right corner to resize this field
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
            <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleInputChange} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
            <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleInputChange} required className="input-field" />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">📱 Devices & Parameters</h3>
            <button type="button" onClick={addDevice} className="btn-primary text-sm px-3 py-1">
              + Add Device
            </button>
          </div>

          {formData.devices.map((device, deviceIndex) => (
            <div key={deviceIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700">Device {deviceIndex + 1}</h4>
                {formData.devices.length > 1 && (
                  <button type="button" onClick={() => removeDevice(deviceIndex)} className="text-red-600 hover:text-red-800 text-sm">
                    Remove Device
                  </button>
                )}
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Device ID *</label>
                <input
                  type="text"
                  value={device.deviceId}
                  onChange={(e) => handleDeviceChange(deviceIndex, 'deviceId', e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="flex justify-between items-center mb-3">
                <h5 className="text-sm font-medium text-gray-600">Parameters</h5>
                <button type="button" onClick={() => addParameter(deviceIndex)} className="text-blue-600 text-sm hover:text-blue-800">
                  + Add Parameter
                </button>
              </div>

              {device.params.map((param, paramIndex) => (
                <div key={paramIndex} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 mb-2">
                  <input type="text" placeholder="Parameter" value={param.parameter} onChange={(e) => handleParameterChange(deviceIndex, paramIndex, 'parameter', e.target.value)} required className="input-field text-sm" />
                  <input type="text" placeholder="Unit" value={param.unit} onChange={(e) => handleParameterChange(deviceIndex, paramIndex, 'unit', e.target.value)} required className="input-field text-sm" />
                  <input type="number" step="any" placeholder="Min" value={param.min} onChange={(e) => handleParameterChange(deviceIndex, paramIndex, 'min', e.target.value)} required className="input-field text-sm" />
                  <input type="number" step="any" placeholder="Max" value={param.max} onChange={(e) => handleParameterChange(deviceIndex, paramIndex, 'max', e.target.value)} required className="input-field text-sm" />
                  <input type="number" placeholder="Precision" value={param.precision} onChange={(e) => handleParameterChange(deviceIndex, paramIndex, 'precision', e.target.value)} className="input-field text-sm" />
                  {device.params.length > 1 && (
                    <button type="button" onClick={() => removeParameter(deviceIndex, paramIndex)} className="btn-danger text-sm px-2 py-1">
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            id="data_sending"
            checked={formData.data_sending_enabled}
            onChange={(e) => setFormData(prev => ({ ...prev, data_sending_enabled: e.target.checked }))}
            className="w-4 h-4"
          />
          <label htmlFor="data_sending" className="text-sm font-medium text-gray-700">
            Enable Data Sending (Data will be sent at :00, :15, :30, :45 minutes)
          </label>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Adding Device...' : '➕ Add Device'}
        </button>
      </form>
    </div>
  );
};

export default DeviceForm;