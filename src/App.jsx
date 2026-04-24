import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import DeviceForm from './components/DeviceForm';
import CPCBFetch from './components/CPCBFetch';
import DeviceList from './components/DeviceList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('manual');
  const [stats, setStats] = useState({ total: 0, active: 0 });

  const handleDeviceAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const updateStats = (devices) => {
    const total = devices.length;
    const active = devices.filter(d => d.data_sending_enabled).length;
    setStats({ total, active });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000, iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error: { duration: 4000, iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />
      
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Random Data App
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">Device Management System</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  activeTab === 'manual'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Manual Form
              </button>
              <button
                onClick={() => setActiveTab('cpcb')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  activeTab === 'cpcb'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔄 Fetch from CPCB
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {activeTab === 'manual' ? (
            <DeviceForm onDeviceAdded={handleDeviceAdded} />
          ) : (
            <CPCBFetch onDeviceAdded={handleDeviceAdded} />
          )}
          
          {/* Stats Section - Responsive */}
          <div className="card bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">📊 Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur">
                <p className="text-xs sm:text-sm opacity-90">Total Devices</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3 sm:p-4 backdrop-blur">
                <p className="text-xs sm:text-sm opacity-90">Active Devices</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats.active}</p>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm opacity-90 space-y-1">
              <p>✅ Data sending active: {stats.active}</p>
              <p>⏸️ Data sending inactive: {stats.total - stats.active}</p>
              <p className="mt-1 sm:mt-2">⏰ Data sent at :00, :15, :30, :45 minutes</p>
            </div>
          </div>
        </div>

        {/* Device List Section */}
        <DeviceList refreshTrigger={refreshTrigger} onStatsUpdate={updateStats} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 py-3 sm:py-4 text-center text-gray-600 text-xs sm:text-sm">
          <p>© 2024 Random Data App - Device Management System</p>
        </div>
      </footer>
    </div>
  );
}

export default App;