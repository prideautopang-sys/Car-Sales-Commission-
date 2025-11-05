import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Page, Role, User } from '../types';
import { USERS } from '../constants';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage }) => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { currentUser, setCurrentUser } = context;

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = USERS.find(u => u.id === parseInt(e.target.value));
    if (selectedUser) {
      setCurrentUser(selectedUser);
      // Admin should not see summary
      if (selectedUser.role === Role.Admin && activePage === 'summary') {
        setActivePage('dataEntry');
      }
    }
  };
  
  const navItemClasses = (page: Page) => 
    `px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
      activePage === page 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-600 hover:bg-blue-100 hover:text-blue-700'
    }`;

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-primary">ระบบคำนวณคอมมิชชั่น</h1>
            <nav className="hidden md:flex space-x-2 bg-gray-200 p-1 rounded-lg">
              <button onClick={() => setActivePage('dataEntry')} className={navItemClasses('dataEntry')}>
                บันทึกข้อมูล
              </button>
              <button onClick={() => setActivePage('settings')} className={navItemClasses('settings')}>
                ตั้งค่า
              </button>
              {currentUser.role !== Role.Admin && (
                <button onClick={() => setActivePage('summary')} className={navItemClasses('summary')}>
                  สรุป
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2 text-sm hidden sm:block">ผู้ใช้งาน:</span>
            <select
              value={currentUser.id}
              onChange={handleUserChange}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {USERS.map((user) => (
                <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="md:hidden flex space-x-2 border-t pt-2 pb-2">
           <button onClick={() => setActivePage('dataEntry')} className={navItemClasses('dataEntry')}>บันทึกข้อมูล</button>
           <button onClick={() => setActivePage('settings')} className={navItemClasses('settings')}>ตั้งค่า</button>
            {currentUser.role !== Role.Admin && (
              <button onClick={() => setActivePage('summary')} className={navItemClasses('summary')}>สรุป</button>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;