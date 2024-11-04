// src/components/Sidenav.js
import React from 'react';
import { HomeIcon, FolderIcon, ClockIcon } from '@heroicons/react/24/outline';

const Sidenav = ({ isOpen, toggleSidenav }) => {
  return (
    <nav className={`bg-gray-800 text-white h-screen flex flex-col transition-width duration-300 ${isOpen ? 'w-52' : 'w-16'}`}>
      <div className="flex justify-between items-center p-4">
        <h1 className={`text-lg font-bold transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Meu App</h1>
        <button onClick={toggleSidenav} className="text-gray-400 hover:text-white">
          {/* Ícone de toggle */}
        </button>
      </div>
      <ul className="flex flex-col flex-grow">
        <li className="flex items-center p-3 hover:bg-gray-700 cursor-pointer w-full">
          <HomeIcon className="h-5 w-5" />
          {isOpen && <span className="ml-2">Home</span>}
        </li>
        <li className="flex items-center p-3 hover:bg-gray-700 cursor-pointer w-full">
          <FolderIcon className="h-5 w-5" />
          {isOpen && <span className="ml-2">Projetos</span>}
        </li>
        <li className="flex items-center p-3 hover:bg-gray-700 cursor-pointer w-full">
          <ClockIcon className="h-5 w-5" />
          {isOpen && <span className="ml-2">Relógio de Ponto</span>}
        </li>
      </ul>
      <div className="p-4">
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Sidenav;
