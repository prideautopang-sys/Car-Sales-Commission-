import { SalesRecord, CommissionSettings, SelectedAccessory } from '../types';

type SaleInput = Omit<SalesRecord, 'id' | 'salespersonMonthlyCarCount' | 'status' | 'netCommission' | 'processingFeeDeduction' | 'carCommission' | 'isPaid' | 'paymentDate'> | SalesRecord;

export const calculateNetCommission = (sale: SaleInput, settings: CommissionSettings) => {
  const modelCommissionRule = settings.carModelCommissions.find(c => c.modelName === sale.carModel);
  const carCommission = modelCommissionRule ? modelCommissionRule.commission : 0;
  
  const processingFeeDeduction = carCommission * (settings.processingFeePercentage / 100);

  const accessoriesCommission = sale.accessories.reduce((total, acc) => {
    const settingAcc = settings.accessories.find(a => a.id === acc.accessoryId);
    if (settingAcc) {
      if (settingAcc.commissionType === 'percentage') {
        return total + (acc.price * (settingAcc.commissionValue / 100));
      } else { // fixed
        return total + settingAcc.commissionValue;
      }
    }
    return total;
  }, 0);

  const netCommission = carCommission - processingFeeDeduction + accessoriesCommission;

  return {
    carCommission,
    processingFeeDeduction,
    netCommission,
  };
};

export const getSalespersonMonthlyCarCount = (salespersonName: string, deliveryDate: Date, allRecords: SalesRecord[]): number => {
    const deliveryMonth = deliveryDate.getMonth();
    const deliveryYear = deliveryDate.getFullYear();

    return allRecords.filter(record => {
        const recordDate = new Date(record.deliveryDate);
        return record.salespersonName === salespersonName &&
               recordDate.getMonth() === deliveryMonth &&
               recordDate.getFullYear() === deliveryYear;
    }).length;
};

export const recalculateAllMonthlyCounts = (records: SalesRecord[]): SalesRecord[] => {
  const recordsById = new Map(records.map(r => [r.id, { ...r }]));
  const groupedBySalespersonAndMonth: Record<string, SalesRecord[]> = {};

  recordsById.forEach(record => {
    const date = new Date(record.deliveryDate);
    const key = `${record.salespersonName}-${date.getFullYear()}-${date.getMonth()}`;
    if (!groupedBySalespersonAndMonth[key]) {
      groupedBySalespersonAndMonth[key] = [];
    }
    groupedBySalespersonAndMonth[key].push(record);
  });

  for (const key in groupedBySalespersonAndMonth) {
    const group = groupedBySalespersonAndMonth[key];
    // Sort by date, then by original creation time (id) as a tie-breaker
    group.sort((a, b) => {
        const dateA = new Date(a.deliveryDate).getTime();
        const dateB = new Date(b.deliveryDate).getTime();
        if (dateA !== dateB) {
            return dateA - dateB;
        }
        return a.id - b.id;
    });
    group.forEach((record, index) => {
      const originalRecord = recordsById.get(record.id);
      if (originalRecord) {
        originalRecord.salespersonMonthlyCarCount = index + 1;
      }
    });
  }
  
  return Array.from(recordsById.values());
};
