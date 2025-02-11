import React from "react";
import {
  HomeIcon,
  FolderIcon,
  ClockIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom"; // Importando o useNavigate

const Sidenav = ({ isOpen, toggleSidenav }) => {
  const navigate = useNavigate(); // Usando o hook useNavigate

  // Função para navegar para diferentes páginas
  const handleNavigation = (path) => {
    navigate(path); // Navega para o caminho especificado
  };

  // Função para realizar logout
  const handleLogout = () => {
    // Remover o item 'loggedUser' do localStorage
    localStorage.removeItem("loggedUser");

    // Redirecionar para a página de login (PC101961:3000)
    navigate("/"); // Aqui redireciona para a página inicial, que é a tela de login
  };

  return (
    <nav
      className={`bg-gray-800 text-white h-screen flex flex-col transition-width duration-300 ${
        isOpen ? "w-52" : "w-16"
      }`}
    >
      <div className="flex justify-between items-center p-4">
        <h1
          className={`text-lg font-bold transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          Meu App
        </h1>
        <button
          onClick={toggleSidenav}
          className="text-gray-400 hover:text-white"
        >
          {/* Ícone de toggle */}
        </button>
      </div>
      <ul className="flex flex-col flex-grow">
        <li
          className="flex items-center p-3 hover:bg-gray-700 cursor-pointer w-full"
          onClick={() => handleNavigation("/projeto/projects")} // Roteia para a página projetos
        >
          <FolderIcon className="h-5 w-5" />
          {isOpen && <span className="ml-2">Projetos</span>}
        </li>
      </ul>
      <div className="p-4">
        <button
          onClick={handleLogout} // Chama a função handleLogout
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
        >
          Sair
        </button>
      </div>
    </nav>
  );
};

export default Sidenav;
