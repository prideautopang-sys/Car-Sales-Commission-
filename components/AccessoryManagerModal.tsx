import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { SalesRecord, SelectedAccessory } from '../types';
import { LAMINA_FILM_ACCESSORY_ID } from '../constants';
import { TrashIcon } from '@heroicons/react/24/solid';

interface AccessoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: SalesRecord;
  onSave: (accessories: SelectedAccessory[]) => void;
}

const AccessoryManagerModal: React.FC<AccessoryManagerModalProps> = ({ isOpen, onClose, record, onSave }) => {
  const context = useContext(AppContext);
  const [localAccessories, setLocalAccessories] = useState<SelectedAccessory[]>([]);

  useEffect(() => {
    // We only manage non-Lamina accessories here. Lamina is handled in the main grid.
    setLocalAccessories(record.accessories.filter(a => a.accessoryId !== LAMINA_FILM_ACCESSORY_ID));
  }, [record]);

  if (!isOpen || !context) return null;
  const { settings } = context;

  const availableAccessories = settings.accessories.filter(sa => sa.id !== LAMINA_FILM_ACCESSORY_ID);

  const handleAccessoryChange = (index: number, field: keyof SelectedAccessory, value: string | number) => {
    const updated = [...localAccessories];
    updated[index] = { ...updated[index], [field]: value };
    setLocalAccessories(updated);
  };

  const addAccessory = () => {
    if (availableAccessories.length > 0) {
      setLocalAccessories(prev => [...prev, { accessoryId: availableAccessories[0].id, price: 0 }]);
    }
  };

  const removeAccessory = (indexToRemove: number) => {
    setLocalAccessories(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveChanges = () => {
    const laminaFilm = record.accessories.find(a => a.accessoryId === LAMINA_FILM_ACCESSORY_ID);
    const finalAccessories = laminaFilm ? [...localAccessories, laminaFilm] : localAccessories;
    onSave(finalAccessories);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">จัดการอุปกรณ์เสริมสำหรับ {record.customerName}</h2>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {localAccessories.map((acc, index) => (
              <div key={index} className="grid grid-cols-3 gap-3 items-center p-2 border rounded-md">
                <select 
                  value={acc.accessoryId}
                  onChange={(e) => handleAccessoryChange(index, 'accessoryId', parseInt(e.target.value))}
                  className="col-span-1 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {availableAccessories.map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
                </select>
                <input
                  type="number"
                  placeholder="ราคา"
                  value={acc.price}
                  onChange={(e) => handleAccessoryChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className="col-span-1 mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button type="button" onClick={() => removeAccessory(index)} className="text-red-500 hover:text-red-700 justify-self-center">
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            ))}
             {localAccessories.length === 0 && <p className="text-gray-500 text-center py-4">ยังไม่มีอุปกรณ์เสริม</p>}
          </div>

          <button type="button" onClick={addAccessory} className="mt-4 text-sm text-blue-600 hover:text-blue-800">
            + เพิ่มอุปกรณ์เสริม
          </button>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            ยกเลิก
          </button>
          <button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700">
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessoryManagerModal;