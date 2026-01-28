import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [taxSettings, setTaxSettings] = useState({
    taxEnabled: true,
    taxRate: 0.08,
    taxLabel: 'Sales Tax'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/settings/tax`);
        if (response.ok) {
          const data = await response.json();
          setTaxSettings(data);
        }
      } catch (error) {
        console.error('Failed to load tax settings:', error);
      }
      setLoading(false);
    };
    loadTaxSettings();
  }, []);

  const calculateTax = (subtotal) => {
    if (!taxSettings.taxEnabled) return 0;
    return subtotal * taxSettings.taxRate;
  };

  const calculateTotal = (subtotal) => {
    return subtotal + calculateTax(subtotal);
  };

  const formatTaxRate = () => {
    return `${(taxSettings.taxRate * 100).toFixed(1)}%`;
  };

  return (
    <SettingsContext.Provider
      value={{
        taxSettings,
        setTaxSettings,
        calculateTax,
        calculateTotal,
        formatTaxRate,
        loading
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
