import React, { useState, useMemo, useContext } from 'react';
import { AppContext } from '../App';
import { SalesRecord, Role, SaleStatus } from '../types';
import SalesRecordModal from './SalesRecordModal';
import AdminDataGrid from './AdminDataGrid';
import { PlusCircleIcon, PencilIcon, CheckCircleIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const getStatusBadge = (status: SaleStatus) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  switch (status) {
    case 'Pending Admin':
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>รอ Admin</span>;
    case 'Pending Manager Approval':
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>รอ Manager อนุมัติ</span>;
    case 'Pending Executive Finalization':
      return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>รอ Executive อนุมัติ</span>;
    case 'Finalized':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>เสร็จสมบูรณ์</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>ไม่ทราบสถานะ</span>;
  }
};


const SalesDataTable: React.FC = () => {
  const context = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SalesRecord | null>(null);

  if (!context) return <div>Loading...</div>;
  const { currentUser, salesRecords, updateSale } = context;

  // Admin has a completely different view now
  if (currentUser.role === Role.Admin) {
    return <AdminDataGrid />;
  }
  
  // Manager and Executive view
  const handleEdit = (record: SalesRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };
  
  const handleApprove = (record: SalesRecord) => {
      const nextStatus: SaleStatus = currentUser.role === Role.Manager 
        ? 'Pending Executive Finalization' 
        : 'Finalized';
      updateSale({ ...record, status: nextStatus });
  };

  const handlePaymentStatus = (record: SalesRecord, isPaid: boolean) => {
    updateSale({ ...record, isPaid, paymentDate: isPaid ? new Date().toISOString().split('T')[0] : null });
  };

  const visibleRecords = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return salesRecords
      .filter(record => {
        const deliveryDate = new Date(record.deliveryDate);
        deliveryDate.setHours(0,0,0,0);

        if (currentUser.role === Role.Manager) {
          // Manager can see records ready for approval (past/today delivery date)
          return record.status === 'Pending Manager Approval' && deliveryDate <= today;
        }
        // Executive sees everything past admin stage.
        return record.status !== 'Pending Admin';
      })
      .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime());
  }, [salesRecords, currentUser]);
  
  const canEdit = (record: SalesRecord) => {
    if (record.status === 'Finalized') return false;
    switch (currentUser.role) {
      case Role.Manager:
        return record.status === 'Pending Manager Approval' || record.status === 'Pending Admin';
      case Role.Executive:
        return true;
      default: return false;
    }
  }

  const canApprove = (record: SalesRecord) => {
     switch (currentUser.role) {
      case Role.Manager:
        return record.status === 'Pending Manager Approval';
      case Role.Executive:
        return record.status === 'Pending Executive Finalization';
      default: return false;
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">รายการขายรออนุมัติ</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันส่งมอบ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเซลล์</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">รุ่นรถ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คอมมิชชั่น</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
              {currentUser.role === Role.Executive && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จ่ายแล้ว</th>}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visibleRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm">{record.salespersonMonthlyCarCount}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">{record.deliveryDate}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.salespersonName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">{record.carModel}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{record.netCommission.toFixed(2)}</td>
                <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(record.status)}</td>
                {currentUser.role === Role.Executive && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    {record.status === 'Finalized' && (
                       <input 
                        type="checkbox" 
                        checked={record.isPaid} 
                        onChange={(e) => handlePaymentStatus(record, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    )}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {canEdit(record) && (
                      <button onClick={() => handleEdit(record)} title="แก้ไข" className="text-yellow-600 hover:text-yellow-900"><PencilIcon className="h-5 w-5"/></button>
                    )}
                    {canApprove(record) && (
                      <button onClick={() => handleApprove(record)} title={currentUser.role === Role.Manager ? "อนุมัติ" : "ยืนยันสิ้นสุด"} className="text-green-600 hover:text-green-900">
                        {currentUser.role === Role.Manager ? <CheckCircleIcon className="h-5 w-5" /> : <ShieldCheckIcon className="h-5 w-5" />}
                      </button>
                    )}
                     {record.status === 'Finalized' && (
                        <LockClosedIcon className="h-5 w-5 text-gray-400" title="Finalized"/>
                    )}
                  </div>
                </td>
              </tr>
            ))}
             {visibleRecords.length === 0 && (
                <tr>
                    <td colSpan={currentUser.role === Role.Executive ? 8 : 7} className="text-center py-10 text-gray-500">
                        ไม่มีข้อมูลให้แสดงสำหรับสิทธิ์ของคุณ
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <SalesRecordModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          recordToEdit={editingRecord}
        />
      )}
    </div>
  );
};

export default SalesDataTable;