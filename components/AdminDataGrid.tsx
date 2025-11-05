import React, { useState, useContext, useMemo, useCallback } from 'react';
import { AppContext } from '../App';
import { SalesRecord, SelectedAccessory } from '../types';
import { BRANCHES, FILM_TYPES, FILM_STATUSES, PAYMENT_METHODS, LAMINA_FILM_ACCESSORY_ID } from '../constants';
import AccessoryManagerModal from './AccessoryManagerModal';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

type NewRecordState = Omit<SalesRecord, 'id' | 'salespersonMonthlyCarCount' | 'status' | 'netCommission' | 'processingFeeDeduction' | 'carCommission' | 'isPaid' | 'paymentDate'>;

const AdminDataGrid: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return <div>Loading...</div>;
  const { salesRecords, addSale, updateSale, settings } = context;

  const createEmptyRecord = useCallback((): NewRecordState => ({
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
  }), [settings.salespeople, settings.carModelCommissions]);

  const [newRecord, setNewRecord] = useState<NewRecordState>(createEmptyRecord());
  const [editingAccessoriesFor, setEditingAccessoriesFor] = useState<SalesRecord | null>(null);

  const adminRecords = useMemo(() => {
    return salesRecords
      .filter(r => r.status === 'Pending Admin')
      .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
  }, [salesRecords]);

  const handleUpdate = (record: SalesRecord, field: keyof SalesRecord, value: any) => {
    if (record.status !== 'Pending Admin') return;
    updateSale({ ...record, [field]: value });
  };
  
  const handleLaminaFilmChange = (record: SalesRecord | NewRecordState, sold: boolean, price: number) => {
      const otherAccessories = record.accessories.filter(acc => acc.accessoryId !== LAMINA_FILM_ACCESSORY_ID);
      let updatedAccessories: SelectedAccessory[];
      if (sold) {
          updatedAccessories = [...otherAccessories, { accessoryId: LAMINA_FILM_ACCESSORY_ID, price }];
      } else {
          updatedAccessories = otherAccessories;
      }

      if('id' in record){
        handleUpdate(record as SalesRecord, 'accessories', updatedAccessories);
      } else {
        setNewRecord(prev => ({ ...prev, accessories: updatedAccessories }));
      }
  };

  const handleNewRecordChange = (field: keyof NewRecordState, value: any) => {
    setNewRecord(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveNewRecord = () => {
    if (!newRecord.customerName || !newRecord.carModel) {
      alert('กรุณากรอกชื่อลูกค้าและรุ่นรถ');
      return;
    }
    if (!newRecord.salespersonName) {
      alert('กรุณาเลือกชื่อเซลล์');
      return;
    }
    addSale(newRecord);
    setNewRecord(createEmptyRecord());
  };

  const headers = [
    'ลำดับ', 'วันส่งมอบ', 'ข้อมูลการขาย', 'รายละเอียดรถ', 'ฟิล์มและการชำระเงิน', 'ของแถมและอื่นๆ'
  ];
  
  const commonInputClasses = "w-full p-1 border border-gray-300 rounded-md text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500";
  const commonSelectClasses = commonInputClasses + " pr-8";
  const commonTextareaClasses = commonInputClasses + " min-h-[40px]";
  const labelClasses = "text-xs text-gray-600 mb-0.5 block";

  const renderRecordRow = (record: SalesRecord, index: number) => {
    const lamina = record.accessories.find(a => a.accessoryId === LAMINA_FILM_ACCESSORY_ID);
    return (
        <tr key={record.id} className="hover:bg-gray-50 text-sm">
            <td className="px-2 py-2 align-top text-center w-12">
                <div className="font-bold pt-2">{index + 1}</div>
            </td>
            <td className="px-2 py-2 align-top min-w-[170px]">
                 <label className={labelClasses}>วันที่ส่งมอบ</label>
                 <input type="date" value={record.deliveryDate} onChange={e => handleUpdate(record, 'deliveryDate', e.target.value)} className={`${commonInputClasses}`}/>
                 <div className="text-xs text-gray-600 mt-1">
                    คันที่: <span className="font-semibold">{record.salespersonMonthlyCarCount}</span>
                 </div>
                 <div className="text-xs text-gray-500">
                    ประจำเดือน: {new Date(record.deliveryDate).toLocaleString('th-TH', { month: 'long', year: 'numeric' })}
                 </div>
            </td>
            <td className="px-2 py-2 align-top min-w-[200px] space-y-1">
                <div>
                    <label className={labelClasses}>ชื่อเซลล์</label>
                    <select value={record.salespersonName} onChange={e => handleUpdate(record, 'salespersonName', e.target.value)} className={commonSelectClasses}>
                        {settings.salespeople.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>ชื่อลูกค้า</label>
                    <input type="text" value={record.customerName} onChange={e => handleUpdate(record, 'customerName', e.target.value)} className={commonInputClasses} placeholder="ชื่อลูกค้า"/>
                </div>
                <div>
                    <label className={labelClasses}>สาขา</label>
                    <select value={record.branch} onChange={e => handleUpdate(record, 'branch', e.target.value)} className={commonSelectClasses}>
                        {BRANCHES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 align-top min-w-[200px] space-y-1">
                <div>
                    <label className={labelClasses}>รุ่นรถ</label>
                    <select value={record.carModel} onChange={e => handleUpdate(record, 'carModel', e.target.value)} className={commonSelectClasses}>
                        {settings.carModelCommissions.map(c => <option key={c.modelName} value={c.modelName}>{c.modelName}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>สีรถ</label>
                    <input type="text" value={record.carColor} onChange={e => handleUpdate(record, 'carColor', e.target.value)} className={commonInputClasses} placeholder="สีรถ"/>
                </div>
                <div>
                    <label className={labelClasses}>สต็อกของสาขา</label>
                    <select value={record.stockLocation} onChange={e => handleUpdate(record, 'stockLocation', e.target.value)} className={commonSelectClasses}>
                        {BRANCHES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 align-top min-w-[180px] space-y-1">
                <div>
                    <label className={labelClasses}>ประเภทฟิล์ม</label>
                    <select value={record.filmType} onChange={e => handleUpdate(record, 'filmType', e.target.value)} className={commonSelectClasses}>
                        {FILM_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>สถานะฟิล์ม</label>
                    <select value={record.filmStatus} onChange={e => handleUpdate(record, 'filmStatus', e.target.value)} className={commonSelectClasses}>
                        {FILM_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>ช่องทางชำระเงิน</label>
                    <select value={record.paymentMethod} onChange={e => handleUpdate(record, 'paymentMethod', e.target.value)} className={commonSelectClasses}>
                        {PAYMENT_METHODS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 align-top min-w-[220px]">
                <div>
                    <label className={labelClasses}>ของแถม</label>
                    <textarea value={record.freebies} onChange={e => handleUpdate(record, 'freebies', e.target.value)} className={`${commonTextareaClasses} mb-1`} placeholder="ของแถม"/>
                </div>
                <div>
                    <label className={labelClasses}>หมายเหตุ</label>
                    <textarea value={record.notes} onChange={e => handleUpdate(record, 'notes', e.target.value)} className={`${commonTextareaClasses} mb-2`} placeholder="หมายเหตุ"/>
                </div>
                 <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id={`lamina-${record.id}`} checked={!!lamina} onChange={e => handleLaminaFilmChange(record, e.target.checked, lamina?.price || 0)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor={`lamina-${record.id}`} className="text-xs font-medium">ฟิล์ม Lamina</label>
                    <input type="number" value={lamina?.price || ''} onChange={e => handleLaminaFilmChange(record, true, parseFloat(e.target.value) || 0)} disabled={!lamina} className={`${commonInputClasses} w-24`} placeholder="ราคา"/>
                </div>
                <button onClick={() => setEditingAccessoriesFor(record)} className="w-full text-blue-600 hover:underline text-sm p-1 bg-blue-50 rounded-md border border-blue-200">
                    จัดการอุปกรณ์เสริม ({record.accessories.filter(a => a.accessoryId !== LAMINA_FILM_ACCESSORY_ID).length})
                </button>
            </td>
        </tr>
    );
  };
  
  const renderNewRecordRow = () => {
    const lamina = newRecord.accessories.find(a => a.accessoryId === LAMINA_FILM_ACCESSORY_ID);
    return (
        <tr className="bg-blue-50 text-sm">
            <td className="px-2 py-2 align-top text-center"><div className="font-bold text-gray-500 pt-2">ใหม่</div></td>
            <td className="px-2 py-2 align-top">
                <label className={labelClasses}>วันที่ส่งมอบ</label>
                <input type="date" value={newRecord.deliveryDate} onChange={e => handleNewRecordChange('deliveryDate', e.target.value)} className={commonInputClasses}/>
            </td>
            <td className="px-2 py-2 align-top space-y-1">
                <div>
                    <label className={labelClasses}>ชื่อเซลล์</label>
                    <select value={newRecord.salespersonName} onChange={e => handleNewRecordChange('salespersonName', e.target.value)} className={commonSelectClasses}>
                        {settings.salespeople.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>ชื่อลูกค้า</label>
                    <input type="text" placeholder="ชื่อลูกค้า*" value={newRecord.customerName} onChange={e => handleNewRecordChange('customerName', e.target.value)} className={commonInputClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>สาขา</label>
                    <select value={newRecord.branch} onChange={e => handleNewRecordChange('branch', e.target.value)} className={commonSelectClasses}>
                        {BRANCHES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 align-top space-y-1">
                <div>
                    <label className={labelClasses}>รุ่นรถ</label>
                    <select value={newRecord.carModel} onChange={e => handleNewRecordChange('carModel', e.target.value)} className={commonSelectClasses}>
                        {settings.carModelCommissions.map(c => <option key={c.modelName} value={c.modelName}>{c.modelName}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>สีรถ</label>
                    <input type="text" placeholder="สีรถ" value={newRecord.carColor} onChange={e => handleNewRecordChange('carColor', e.target.value)} className={commonInputClasses}/>
                </div>
                <div>
                    <label className={labelClasses}>สต็อกของสาขา</label>
                    <select value={newRecord.stockLocation} onChange={e => handleNewRecordChange('stockLocation', e.target.value)} className={commonSelectClasses}>
                        {BRANCHES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 align-top space-y-1">
                <div>
                    <label className={labelClasses}>ประเภทฟิล์ม</label>
                    <select value={newRecord.filmType} onChange={e => handleNewRecordChange('filmType', e.target.value)} className={commonSelectClasses}>
                        {FILM_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>สถานะฟิล์ม</label>
                    <select value={newRecord.filmStatus} onChange={e => handleNewRecordChange('filmStatus', e.target.value)} className={commonSelectClasses}>
                        {FILM_STATUSES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>ช่องทางชำระเงิน</label>
                    <select value={newRecord.paymentMethod} onChange={e => handleNewRecordChange('paymentMethod', e.target.value)} className={commonSelectClasses}>
                        {PAYMENT_METHODS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </td>
            <td className="px-2 py-2 align-top">
                <div>
                    <label className={labelClasses}>ของแถม</label>
                    <textarea placeholder="ของแถม" value={newRecord.freebies} onChange={e => handleNewRecordChange('freebies', e.target.value)} className={`${commonTextareaClasses} mb-1`}/>
                </div>
                <div>
                    <label className={labelClasses}>หมายเหตุ</label>
                    <textarea placeholder="หมายเหตุ" value={newRecord.notes} onChange={e => handleNewRecordChange('notes', e.target.value)} className={`${commonTextareaClasses} mb-2`}/>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <input type="checkbox" id="lamina-new" checked={!!lamina} onChange={e => handleLaminaFilmChange(newRecord, e.target.checked, lamina?.price || 0)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                    <label htmlFor="lamina-new" className="text-xs font-medium">ฟิล์ม Lamina</label>
                    <input type="number" disabled={!lamina} onChange={e => handleLaminaFilmChange(newRecord, true, parseFloat(e.target.value) || 0)} className={`${commonInputClasses} w-24`} placeholder="ราคา"/>
                </div>
                <button onClick={handleSaveNewRecord} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                    <PlusCircleIcon className="h-5 w-5" />
                    บันทึกรายการ
                </button>
            </td>
        </tr>
    );
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">บันทึกข้อมูลการขาย</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-100">
            <tr>
              {headers.map(h => <th key={h} className="px-2 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">{h}</th>)}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adminRecords.map((record, index) => renderRecordRow(record, index))}
            {renderNewRecordRow()}
          </tbody>
        </table>
      </div>

       {editingAccessoriesFor && (
        <AccessoryManagerModal
          isOpen={!!editingAccessoriesFor}
          onClose={() => setEditingAccessoriesFor(null)}
          record={editingAccessoriesFor}
          onSave={(updatedAccessories) => {
            handleUpdate(editingAccessoriesFor, 'accessories', updatedAccessories);
            setEditingAccessoriesFor(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDataGrid;