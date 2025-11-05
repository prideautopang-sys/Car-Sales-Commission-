import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { CommissionSettings, StepBonus, CommissionableAccessory, CarModelCommission, Role } from '../types';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { LAMINA_FILM_ACCESSORY_ID } from '../constants';

const SettingsPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;

  const { settings, updateSettings, currentUser } = context;
  const [localSettings, setLocalSettings] = useState<CommissionSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
  };
  
  const handleStepBonusChange = (index: number, field: keyof StepBonus, value: string) => {
    const newBonuses = [...localSettings.stepBonuses];
    newBonuses[index] = { ...newBonuses[index], [field]: parseInt(value) };
    setLocalSettings(prev => ({ ...prev, stepBonuses: newBonuses }));
  };
  
  const handleAccessoryChange = (index: number, field: keyof CommissionableAccessory, value: string | number) => {
      const newAccessories = [...localSettings.accessories];
      const accessory = { ...newAccessories[index], [field]: value };
      newAccessories[index] = accessory;
      setLocalSettings(prev => ({...prev, accessories: newAccessories }));
  };

  const addStepBonus = () => {
    setLocalSettings(prev => ({ ...prev, stepBonuses: [...prev.stepBonuses, { carCount: 0, bonusAmount: 0 }] }));
  };
  
  const removeStepBonus = (index: number) => {
    setLocalSettings(prev => ({ ...prev, stepBonuses: prev.stepBonuses.filter((_, i) => i !== index) }));
  };
  
  const addAccessory = () => {
    const newAccessory: CommissionableAccessory = {
      id: Date.now(),
      name: 'New Accessory',
      commissionType: 'percentage',
      commissionValue: 10
    };
    setLocalSettings(prev => ({ ...prev, accessories: [...prev.accessories, newAccessory] }));
  };
  
  const removeAccessory = (index: number) => {
    setLocalSettings(prev => ({ ...prev, accessories: prev.accessories.filter((_, i) => i !== index) }));
  };
  
  const handleCarModelCommissionChange = (index: number, field: keyof CarModelCommission, value: string | number) => {
    const newCarCommissions = [...localSettings.carModelCommissions];
    const updatedValue = field === 'commission' ? parseFloat(value as string) : value;
    newCarCommissions[index] = { ...newCarCommissions[index], [field]: updatedValue };
    setLocalSettings(prev => ({ ...prev, carModelCommissions: newCarCommissions }));
  };

  const addCarModelCommission = () => {
    setLocalSettings(prev => ({
        ...prev,
        carModelCommissions: [
            ...prev.carModelCommissions,
            { modelName: 'New Model', commission: 5000 }
        ]
    }));
  };

  const removeCarModelCommission = (index: number) => {
    setLocalSettings(prev => ({
        ...prev,
        carModelCommissions: prev.carModelCommissions.filter((_, i) => i !== index)
    }));
  };

  const handleSalespersonChange = (index: number, value: string) => {
    const newSalespeople = [...localSettings.salespeople];
    newSalespeople[index] = value;
    setLocalSettings(prev => ({ ...prev, salespeople: newSalespeople }));
  };

  const addSalesperson = () => {
      setLocalSettings(prev => ({ ...prev, salespeople: [...prev.salespeople, 'New Salesperson'] }));
  };

  const removeSalesperson = (index: number) => {
      if (localSettings.salespeople.length <= 1) {
          alert("You must have at least one salesperson.");
          return;
      }
      setLocalSettings(prev => ({ ...prev, salespeople: prev.salespeople.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (currentUser.role === Role.Admin) {
      // Admin should only save the salespeople list
      const newSettings = {
        ...settings, // Current global settings
        salespeople: localSettings.salespeople, // Only apply changes from the local state
      };
      updateSettings(newSettings);
    } else {
      // Manager and Executive can save everything
      updateSettings(localSettings);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const Input = ({ label, ...props }: any) => (
    <div className="w-full">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {currentUser.role !== Role.Admin && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">กฎค่าคอมมิชชั่นทั่วไป</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="ค่าดำเนินการ (%)" type="number" name="processingFeePercentage" value={localSettings.processingFeePercentage} onChange={handleInputChange} />
              </div>
          </div>
        </>
      )}

        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">จัดการรายชื่อเซลล์</h2>
            <div className="space-y-2">
                {localSettings.salespeople.map((name, index) => (
                    <div key={index} className="flex items-center space-x-4 p-2 border rounded-md">
                        <Input 
                            label={`ชื่อเซลล์ #${index + 1}`} 
                            type="text" 
                            value={name} 
                            onChange={(e: any) => handleSalespersonChange(index, e.target.value)}
                        />
                        <button onClick={() => removeSalesperson(index)} className="text-red-500 hover:text-red-700 mt-6">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                ))}
            </div>
            <button onClick={addSalesperson} className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                <PlusIcon className="w-4 h-4"/>เพิ่มชื่อเซลล์
            </button>
        </div>
      
      {currentUser.role !== Role.Admin && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">ค่าคอมมิชชั่นตามรุ่นรถ</h2>
              <div className="space-y-4">
                  {localSettings.carModelCommissions.map((car, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-2 border rounded-md">
                          <div className="md:col-span-2">
                              <Input label="ชื่อรุ่น" type="text" value={car.modelName} onChange={(e: any) => handleCarModelCommissionChange(index, 'modelName', e.target.value)} />
                          </div>
                          <div className="flex items-center space-x-2">
                              <Input label="ค่าคอม (บาท)" type="number" value={car.commission} onChange={(e: any) => handleCarModelCommissionChange(index, 'commission', e.target.value)} />
                              <button onClick={() => removeCarModelCommission(index)} className="text-red-500 hover:text-red-700 mt-6"><TrashIcon className="w-5 h-5"/></button>
                          </div>
                      </div>
                  ))}
              </div>
              <button onClick={addCarModelCommission} className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"><PlusIcon className="w-4 h-4"/>เพิ่มรุ่นรถ</button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">โบนัสรายเดือน (Step Bonus)</h2>
              <div className="space-y-4">
                  {localSettings.stepBonuses.map((bonus, index) => (
                      <div key={index} className="flex items-center space-x-4 p-2 border rounded-md">
                          <Input label="ถ้าขายได้ (คัน)" type="number" value={bonus.carCount} onChange={(e: any) => handleStepBonusChange(index, 'carCount', e.target.value)} />
                          <Input label="โบนัส (บาท)" type="number" value={bonus.bonusAmount} onChange={(e: any) => handleStepBonusChange(index, 'bonusAmount', e.target.value)} />
                          <button onClick={() => removeStepBonus(index)} className="text-red-500 hover:text-red-700 mt-6"><TrashIcon className="w-5 h-5"/></button>
                      </div>
                  ))}
              </div>
              <button onClick={addStepBonus} className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"><PlusIcon className="w-4 h-4"/>เพิ่มระดับโบนัส</button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">ค่าคอมมิชชั่นอุปกรณ์เสริม</h2>
              <div className="space-y-4">
                  {localSettings.accessories.map((acc, index) => (
                      <div key={acc.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-2 border rounded-md">
                          <div className="md:col-span-2">
                              <Input label="ชื่ออุปกรณ์เสริม" type="text" value={acc.name} onChange={(e: any) => handleAccessoryChange(index, 'name', e.target.value)} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">ประเภท</label>
                              <select value={acc.commissionType} onChange={(e: any) => handleAccessoryChange(index, 'commissionType', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                                  <option value="percentage">เปอร์เซ็นต์</option>
                                  <option value="fixed">ค่าคงที่</option>
                              </select>
                          </div>
                          <div className="flex items-center space-x-2">
                              <Input label="ค่า" type="number" value={acc.commissionValue} onChange={(e: any) => handleAccessoryChange(index, 'commissionValue', parseFloat(e.target.value))} />
                              <button 
                                  onClick={() => removeAccessory(index)} 
                                  className="text-red-500 hover:text-red-700 mt-6 disabled:text-gray-400 disabled:cursor-not-allowed"
                                  disabled={acc.id === LAMINA_FILM_ACCESSORY_ID}
                              >
                                  <TrashIcon className="w-5 h-5"/>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
              <button onClick={addAccessory} className="mt-4 text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"><PlusIcon className="w-4 h-4"/>เพิ่มอุปกรณ์เสริม</button>
          </div>
        </>
      )}
        
        <div className="flex justify-end items-center">
            {saved && <span className="text-green-600 mr-4 transition-opacity duration-300">บันทึกการตั้งค่าแล้ว!</span>}
            <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                บันทึกการตั้งค่า
            </button>
        </div>
    </div>
  );
};

export default SettingsPage;