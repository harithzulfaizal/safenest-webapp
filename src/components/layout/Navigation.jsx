// src/components/layout/Navigation.jsx
// Sidebar navigation component
import React from 'react';
import { User as UserIconNav, BarChart2, List as ListIcon, LogIn, HelpCircle, ShieldPlus } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navigation = ({ currentPage, setCurrentPage, userProfile, onLogout }) => {
  const NavItem = ({ page, label, icon: Icon }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${currentPage === page
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
        }`}
    >
      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <nav className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col flex-shrink-0 h-full">
      <div className="mb-6">
        <a href="/" className="flex items-center text-xl font-bold text-blue-600 dark:text-blue-400">
          <ShieldPlus className="h-7 w-7 mr-2" />
          <span>SafeNest</span>
        </a>
      </div>

      <div className="space-y-1.5 flex-grow">
        <NavItem page="profile" label="Profile" icon={UserIconNav} />
        <NavItem page="transactions" label="Transactions" icon={ListIcon} />
        <NavItem page="insights" label="Insights" icon={BarChart2} />
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <NavItem page="help" label="Help & Support" icon={HelpCircle} />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3">
          <UserIconNav className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1 mr-2 text-gray-600 dark:text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userProfile?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile?.email || 'user@example.com'}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={onLogout} icon={LogIn} className="w-full justify-center">
          Logout
        </Button>
      </div>
    </nav>
  );
};
