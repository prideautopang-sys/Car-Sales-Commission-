import React, { useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { Role, SalesRecord } from '../types';

const SummaryPage: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { salesRecords, settings, currentUser } = context;

    const finalizedRecords = useMemo(() => {
        return salesRecords.filter(r => r.status === 'Finalized');
    }, [salesRecords]);

    const summaryBySalesperson = useMemo(() => {
        const summary: { [key: string]: { totalCars: number; totalCommission: number; bonus: number } } = {};

        finalizedRecords.forEach(record => {
            if (!summary[record.salespersonName]) {
                summary[record.salespersonName] = { totalCars: 0, totalCommission: 0, bonus: 0 };
            }
            summary[record.salespersonName].totalCars += 1;
            summary[record.salespersonName].totalCommission += record.netCommission;
        });

        // Calculate step bonus
        Object.keys(summary).forEach(salesperson => {
            const carCount = summary[salesperson].totalCars;
            let bonus = 0;
            const sortedBonuses = [...settings.stepBonuses].sort((a, b) => b.carCount - a.carCount);
            for (const step of sortedBonuses) {
                if (carCount >= step.carCount) {
                    bonus = step.bonusAmount;
                    break;
                }
            }
            summary[salesperson].bonus = bonus;
        });

        return summary;
    }, [finalizedRecords, settings.stepBonuses]);

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "ID,Salesperson,Delivery Date,Car Model,Net Commission,Bonus,Total,Status,Paid,Payment Date\n";

        // FIX: Changed from Object.entries to Object.keys to fix type inference issues with the `data` variable.
        Object.keys(summaryBySalesperson).forEach((name) => {
             const data = summaryBySalesperson[name];
             finalizedRecords.filter(r => r.salespersonName === name).forEach(record => {
                 csvContent += `${record.id},${record.salespersonName},${record.deliveryDate},"${record.carModel}",${record.netCommission.toFixed(2)},0,${record.netCommission.toFixed(2)},${record.status},${record.isPaid},${record.paymentDate || ''}\n`;
             });
             if(data.bonus > 0) {
                csvContent += `BONUS,${name},,,0,${data.bonus.toFixed(2)},${data.bonus.toFixed(2)},Finalized,,\n`;
             }
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "commission_summary.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (currentUser.role === 'Admin') {
        return (
            <div className="text-center p-10 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-700">สรุปรายเดือน</h2>
                <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200">
                    ส่งออกเป็น CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อเซลล์</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนคัน</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">คอมมิชชั่นพื้นฐาน</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">โบนัส (Step)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ยอดรวม</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                       {/* FIX: Changed from Object.entries to Object.keys to fix type inference issues with the `data` variable. */}
                       {Object.keys(summaryBySalesperson).map((name) => {
                           const data = summaryBySalesperson[name];
                           return (
                               <tr key={name}>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{name}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm">{data.totalCars}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm">{data.totalCommission.toFixed(2)}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm">{data.bonus.toFixed(2)}</td>
                                   <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">{(data.totalCommission + data.bonus).toFixed(2)}</td>
                               </tr>
                           );
                       })}
                       {Object.keys(summaryBySalesperson).length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    ไม่มีข้อมูลที่เสร็จสมบูรณ์เพื่อสรุปผล
                                </td>
                            </tr>
                       )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SummaryPage;