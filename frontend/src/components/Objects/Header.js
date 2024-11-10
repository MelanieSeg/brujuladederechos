import React, { useContext } from 'react';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { ThemeContext } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const Header = ({ toggleSidebar, toggleNotificaciones, toggleTheme }) => {
  const { user } = useAuth();
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="flex justify-between items-center p-4">
        <Bars3Icon 
          className="h-8 w-8 text-gray-600 dark:text-white cursor-pointer" 
          onClick={toggleSidebar} 
        />
        
        <div className="flex items-center space-x-4">
          {/* Campana de notificaciones */}
          <button onClick={toggleNotificaciones}>
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-white" />
          </button>

          {/* Botón de tema */}
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
          >
            {isDarkMode ? (
              <SunIcon className="h-6 w-6 text-white" />
            ) : (
              <MoonIcon className="h-6 w-6 text-black" />
            )}
          </button>

          {/* Usuario en header */}
          {user && (
            <div className="flex items-center space-x-2">
              <img
                src={user.image || 'https://via.placeholder.com/40'}
                alt="Perfil"
                className="w-8 h-8 rounded-full"
              />
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;