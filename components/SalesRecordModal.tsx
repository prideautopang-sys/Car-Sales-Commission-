import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../App';
import { SalesRecord, SelectedAccessory } from '../types';
import { BRANCHES, FILM_TYPES, FILM_STATUSES, PAYMENT_METHODS, LAMINA_FILM_ACCESSORY_ID } from '../constants';

interface SalesRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: SalesRecord | null;
}

const SalesRecordModal: React.FC<SalesRecordModalProps> = ({ isOpen, onClose, recordToEdit }) => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { addSale, updateSale, currentUser, settings } = context;

  const getInitialState = useCallback(() => {
    if (recordToEdit) {
      return { ...recordToEdit };
    }
    return {
      deliveryDate: new Date().toISOString().split('T')[0],
      branch: BRANCHES[0],
      salespersonName: settings.salespeople[0] || '',
      customerName: '',
      carModel: settings.carModelCommissions[0]?.modelName || '',
      carColor: '',
      stockLocation: BRANCHES[0],
      filmType: 'None',
      filmStatus: FILM_STATUSES[0],
      freebies: '',
      paymentMethod: PAYMENT_METHODS[0],
      notes: '',
      accessories: [],
    };
  }, [recordToEdit, settings.salespeople, settings.carModelCommissions]);

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    setFormData(getInitialState());
  }, [recordToEdit, isOpen, getInitialState]);

  const laminaFilmAccessory = formData.accessories.find(acc => acc.accessoryId === LAMINA_FILM_ACCESSORY_ID);
  const hasLaminaFilm = !!laminaFilmAccessory;
  const laminaFilmPrice = laminaFilmAccessory ? laminaFilmAccessory.price : 0;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // FIX: Cast value to `any` to prevent TypeScript from widening string literal union types (like FilmType) to `string`.
    // This is a safe and common workaround for generic handlers.
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };
  
  const handleLaminaFilmChange = (sold: boolean, price: number) => {
    setFormData(prev => {
        const otherAccessories = prev.accessories.filter(acc => acc.accessoryId !== LAMINA_FILM_ACCESSORY_ID);
        if (sold) {
            return {
                ...prev,
                accessories: [...otherAccessories, { accessoryId: LAMINA_FILM_ACCESSORY_ID, price: price }]
            };
        } else {
            return { ...prev, accessories: otherAccessories };
        }
    });
  };

  const handleAccessoryChange = (index: number, field: keyof SelectedAccessory, value: string | number) => {
    const updatedAccessories = [...formData.accessories];
    updatedAccessories[index] = { ...updatedAccessories[index], [field]: value };
    setFormData(prev => ({ ...prev, accessories: updatedAccessories }));
  };

  const addAccessory = () => {
    const firstAvailableAccessory = settings.accessories.find(acc => acc.id !== LAMINA_FILM_ACCESSORY_ID);
    if(!firstAvailableAccessory) return; // No other accessories to add
    
    const newAccessory: SelectedAccessory = { accessoryId: firstAvailableAccessory.id, price: 0 };
    setFormData(prev => ({ ...prev, accessories: [...prev.accessories, newAccessory] }));
  };
  
  const removeAccessory = (indexToRemove: number) => {
    setFormData(prev => ({ ...prev, accessories: prev.accessories.filter((_, index) => index !== indexToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recordToEdit) {
      updateSale(formData as SalesRecord);
    } else {
      addSale(formData);
    }
    onClose();
  };
  
  const InputField = ({ label, name, ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
   );

  const SelectField = ({ label, name, children, ...props }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} {...props} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {children}
        </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-10">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
             <h2 className="text-2xl font-bold text-gray-800 mb-6">{recordToEdit ? 'แก้ไขรายการขาย' : 'เพิ่มรายการขายใหม่'}</h2>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* General Info */}
                <h3 className="col-span-full text-lg font-semibold border-b pb-2 mb-2 text-blue-700">ข้อมูลทั่วไป</h3>
                <InputField label="วันที่ส่งมอบ" name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleChange} required />
                <SelectField label="สาขา" name="branch" value={formData.branch} onChange={handleChange}>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </SelectField>
                <SelectField label="ชื่อเซลล์" name="salespersonName" value={formData.salespersonName} onChange={handleChange}>
                  {settings.salespeople.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>
                <InputField label="ชื่อลูกค้า" name="customerName" type="text" value={formData.customerName} onChange={handleChange} required />
                <InputField label="หมายเหตุ" name="notes" type="text" value={formData.notes} onChange={handleChange} className="col-span-full"/>

                {/* Car Info */}
                <h3 className="col-span-full text-lg font-semibold border-b pb-2 mb-2 mt-4 text-blue-700">ข้อมูลรถ</h3>
                <SelectField label="รุ่นรถ" name="carModel" value={formData.carModel} onChange={handleChange}>
                    {settings.carModelCommissions.map(c => <option key={c.modelName} value={c.modelName}>{c.modelName}</option>)}
                </SelectField>
                <InputField label="สีรถ" name="carColor" type="text" value={formData.carColor} onChange={handleChange} required />
                <SelectField label="สต็อกของสาขา" name="stockLocation" value={formData.stockLocation} onChange={handleChange}>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </SelectField>
                <SelectField label="ประเภทฟิล์ม" name="filmType" value={formData.filmType} onChange={handleChange}>
                    {FILM_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </SelectField>
                <SelectField label="สถานะฟิล์ม" name="filmStatus" value={formData.filmStatus} onChange={handleChange}>
                    {FILM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>
                 <SelectField label="ช่องทางชำระเงิน" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </SelectField>
                 <div className="col-span-full">
                    <label htmlFor="freebies" className="block text-sm font-medium text-gray-700">ของแถม</label>
                    <textarea id="freebies" name="freebies" value={formData.freebies} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                 </div>

                {/* Other Sales */}
                <h3 className="col-span-full text-lg font-semibold border-b pb-2 mb-2 mt-4 text-blue-700">การขายอื่นๆ</h3>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="hasLaminaFilm" name="hasLaminaFilm" checked={hasLaminaFilm} onChange={(e) => handleLaminaFilmChange(e.target.checked, laminaFilmPrice)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="hasLaminaFilm" className="text-sm font-medium text-gray-700">ขายฟิล์ม Lamina?</label>
                </div>
                {hasLaminaFilm && (
                    <InputField label="ราคาฟิล์ม Lamina" name="laminaFilmPrice" type="number" value={laminaFilmPrice} onChange={(e: any) => handleLaminaFilmChange(true, parseFloat(e.target.value) || 0)} placeholder="เช่น 5000" />
                )}

                <div className="col-span-full">
                  <h4 className="font-medium text-gray-800">อุปกรณ์เสริม</h4>
                   {formData.accessories.map((acc, index) => {
                      if(acc.accessoryId === LAMINA_FILM_ACCESSORY_ID) return null;
                      
                      return (
                      <div key={index} className="grid grid-cols-3 gap-2 items-center mt-2 p-2 border rounded-md">
                          <SelectField label="" name="accessoryId" value={acc.accessoryId} onChange={(e: any) => handleAccessoryChange(index, 'accessoryId', parseInt(e.target.value))}>
                              {settings.accessories.filter(sa => sa.id !== LAMINA_FILM_ACCESSORY_ID).map(sa => <option key={sa.id} value={sa.id}>{sa.name}</option>)}
                          </SelectField>
                          <InputField label="" name="price" type="number" placeholder="ราคา" value={acc.price} onChange={(e: any) => handleAccessoryChange(index, 'price', parseFloat(e.target.value))} />
                          <button type="button" onClick={() => removeAccessory(index)} className="text-red-500 hover:text-red-700 font-bold self-end mb-2">ลบ</button>
                      </div>
                   )})}
                   <button type="button" onClick={addAccessory} className="mt-2 text-sm text-blue-600 hover:text-blue-800">+ เพิ่มอุปกรณ์เสริม</button>
                </div>
             </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  ยกเลิก
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  {recordToEdit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างรายการ'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesRecordModal;