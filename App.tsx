import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from './components/Header';
import SalesDataTable from './components/SalesDataTable';
import SettingsPage from './components/SettingsPage';
import SummaryPage from './components/SummaryPage';
import { User, Role, Page, SalesRecord, CommissionSettings } from './types';
import { USERS, INITIAL_SALES_RECORDS, INITIAL_COMMISSION_SETTINGS } from './constants';
import { calculateNetCommission, recalculateAllMonthlyCounts } from './utils/commissionUtils';

export const AppContext = React.createContext<{
  currentUser: User;
  setCurrentUser: (user: User) => void;
  salesRecords: SalesRecord[];
  addSale: (sale: Omit<SalesRecord, 'id' | 'salespersonMonthlyCarCount' | 'status' | 'netCommission' | 'processingFeeDeduction' | 'carCommission' | 'isPaid' | 'paymentDate'>) => void;
  updateSale: (sale: SalesRecord) => void;
  settings: CommissionSettings;
  updateSettings: (settings: CommissionSettings) => void;
} | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]);
  const [currentPage, setCurrentPage] = useState<Page>('dataEntry');
  
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() => {
    const savedRecords = localStorage.getItem('salesRecords');
    if (savedRecords) {
      return JSON.parse(savedRecords);
    }
    // On first load, ensure initial data has correct counts
    return recalculateAllMonthlyCounts(INITIAL_SALES_RECORDS);
  });

  const [settings, setSettings] = useState<CommissionSettings>(() => {
    const savedSettings = localStorage.getItem('commissionSettings');
    return savedSettings ? JSON.parse(savedSettings) : INITIAL_COMMISSION_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
  }, [salesRecords]);

  useEffect(() => {
    localStorage.setItem('commissionSettings', JSON.stringify(settings));
  }, [settings]);

  const addSale = useCallback((newSaleData: Omit<SalesRecord, 'id' | 'salespersonMonthlyCarCount' | 'status' | 'netCommission' | 'processingFeeDeduction' | 'carCommission' | 'isPaid' | 'paymentDate'>) => {
    setSalesRecords(prevRecords => {
      const newRecordTemp: SalesRecord = {
        ...newSaleData,
        id: Date.now(),
        salespersonMonthlyCarCount: 0, // Placeholder, will be recalculated
        status: 'Pending Admin',
        isPaid: false,
        paymentDate: null,
        ...calculateNetCommission(newSaleData, settings)
      };
      const allRecords = [...prevRecords, newRecordTemp];
      return recalculateAllMonthlyCounts(allRecords);
    });
  }, [settings]);

  const updateSale = useCallback((updatedSale: SalesRecord) => {
    setSalesRecords(prevRecords => {
       const originalRecord = prevRecords.find(r => r.id === updatedSale.id);
       const needsRecalculation = originalRecord && (originalRecord.deliveryDate !== updatedSale.deliveryDate || originalRecord.salespersonName !== updatedSale.salespersonName);

       const updatedRecords = prevRecords.map(r => 
        r.id === updatedSale.id 
          ? { ...updatedSale, ...calculateNetCommission(updatedSale, settings) }
          : r
      );

      if (needsRecalculation) {
        return recalculateAllMonthlyCounts(updatedRecords);
      }
      return updatedRecords;
    });
  }, [settings]);
  
  const updateSettings = useCallback((newSettings: CommissionSettings) => {
    setSettings(newSettings);
    // Recalculate commissions for all non-finalized records
    setSalesRecords(prevRecords => 
      prevRecords.map(record => {
        if (record.status !== 'Finalized') {
          return { ...record, ...calculateNetCommission(record, newSettings) };
        }
        return record;
      })
    );
  }, []);

  const contextValue = useMemo(() => ({
    currentUser,
    setCurrentUser,
    salesRecords,
    addSale,
    updateSale,
    settings,
    updateSettings
  }), [currentUser, salesRecords, addSale, updateSale, settings, updateSettings]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Header activePage={currentPage} setActivePage={setCurrentPage} />
        <main className="p-4 md:p-8">
          {currentPage === 'dataEntry' && <SalesDataTable />}
          {currentPage === 'settings' && <SettingsPage />}
          {currentPage === 'summary' && <SummaryPage />}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;