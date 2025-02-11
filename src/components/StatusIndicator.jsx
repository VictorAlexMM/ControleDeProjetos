import React, { useState, useEffect } from "react";
import axios from "axios";

const StatusIndicator = ({ project, setSelectedProject, setIsModalOpen }) => {
  const [status, setStatus] = useState("não iniciado");

  useEffect(() => {
    if (!project?.ID) {
      console.warn("ID do projeto não está disponível.");
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await axios.get(
          `http://PC101961:4002/api/projetos/status/${project.ID}`
        );
        setStatus(response.data.status || "não iniciado"); // Atualiza com o status retornado ou mantém o padrão
      } catch (error) {
        console.error("Erro ao buscar status do projeto:", error);
        setStatus("erro"); // Exibe "erro" em caso de falha
      }
    };

    fetchStatus();
  }, [project.ID]);

  const getStatusColor = (status) => {
    switch (status) {
      case "entregue":
        return "bg-green-500";
      case "em andamento":
        return "bg-yellow-500";
      case "cancelado":
        return "bg-red-500";
      case "não iniciado":
        return "bg-gray-500";
      case "erro":
        return "bg-red-700"; // Cor para indicar erro
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      onClick={() => {
        setSelectedProject(project);
        setIsModalOpen(true);
      }}
      className={`absolute top-2 right-2 rounded-full flex items-center justify-center px-3 py-1 cursor-pointer ${getStatusColor(
        status
      )}`}
    >
      <span className="text-white text-xs">
        {status} {/* Exibe o nome completo do status */}
      </span>
    </div>
  );
};

export default StatusIndicator;
