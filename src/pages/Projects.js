import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from "react-slick"; // Importando o carrossel
import { PlusIcon, XMarkIcon, ArrowDownTrayIcon, PencilIcon  } from '@heroicons/react/24/solid';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState({});
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [pdfURL, setPdfURL] = useState('');
  const [observacoes, setObservacoes] = useState({});
  const [statusMap, setStatusMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    NomeProjeto: '',
    Empresa: '',
    Prazo: '',
    Responsavel: '',
    EstimativaHoras: '',
    Layout: null,
    DataCriacao:'',
  });
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activityForm, setActivityForm] = useState({
    QualAtividade: '',
    DataDaAtividade: '',
    QuantasPessoas: '',
    HoraInicial: '',
    HoraFinal: '',
    Responsavel: '',
    Anexos: [],
  });
  const [showActivityPopup, setShowActivityPopup] = useState(false); // Estado para mostrar o popup de atividades
  const [selectedActivity, setSelectedActivity] = useState([]); // Estado para a atividade selecionada

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://PC107662:4001/projetos');
        setProjects(response.data);
      } catch (error) {
        console.error('Erro ao carregar os projetos:', error);
      }
    };
    fetchProjects();
  }, []);

  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewProject((prev) => ({
      ...prev,
      Layout: file,
    }));
  };

  const handleOpenPDFModal = async (project) => {
    const { Prazo, NomeProjeto, Layout } = project; // Use Prazo
  
    // Verifica se Prazo, NomeProjeto e Layout estão definidos
    if (!Prazo || !NomeProjeto || !Layout) {
      console.error('Propriedades do projeto estão indefinidas:', project);
      alert('Erro: Dados do projeto estão incompletos.');
      return;
    }
  
    try {
      // Extrai ano, mês e dia da Prazo
      const data = new Date(Prazo); // Use Prazo
  
      // Valida se Prazo é uma data válida
      if (isNaN(data)) {
        console.error('Data inválida:', Prazo); // Use Prazo
        alert('Erro: Data de criação é inválida.');
        return;
      }
  
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
  
      // Monta a URL para consumir a API
      const url = `http://PC107662:4001/uploads/projeto/${ano}/${mes}/${dia}/${NomeProjeto}/${Layout}`;
      console.log('URL gerada:', url);
  
    // Criação do modal popup
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'; // Fundo escuro que ocupa toda a tela
    modal.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl relative w-[1440px] h-[800px]">
        <button onclick="document.body.removeChild(this.parentElement.parentElement)" class="absolute top-2 right-2 text-xl text-gray-600 hover:text-gray-800">
          X
        </button>
        <iframe src="${url}" class="w-full h-full" title="PDF Viewer"></iframe>
      </div>
    `;
  
      document.body.appendChild(modal); // Adiciona o modal ao body
    } catch (error) {
      console.error('Erro ao abrir o arquivo:', error);
      alert('Não foi possível abrir o arquivo.');
    }
  };
  
  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setPdfURL('');
  }; 

  const handleCloseAttachmentsModal = () => {
    setShowAttachmentsModal(false);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  const handleLoadAttachments = async (activityId) => {
    try {
      const response = await axios.get(`http://PC107662:4001/registroDeAtividades/anexos/${activityId}`);
      const attachmentsData = response.data.anexos;
  
      if (!attachmentsData || attachmentsData.length === 0) {
        alert("Nenhum anexo encontrado para esta atividade.");
        return;
      }
  
      const attachments = attachmentsData.map((attachment) => {
        const { nome, url } = attachment;
        if (!url || url.trim() === "") {
          console.warn("Anexo sem URL:", attachment);
          return null;
        }
        return { nome, url };
      });
  
      setAttachments(attachments.filter(Boolean));
      setShowAttachmentsModal(true);
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
      alert("Erro ao carregar anexos. Por favor, tente novamente mais tarde.");
    }
  };

  const handleStatusChange = (projectID, newStatus) => {
    setStatusMap(prevState => ({
      ...prevState,
      [projectID]: newStatus,
    }));
  };

  const handleObservacaoChange = (projectID, e) => {
    setObservacoes(prevState => ({
      ...prevState,
      [projectID]: e.target.value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'entregue':
        return 'bg-green-500';
      case 'em andamento':
        return 'bg-yellow-500';
      case 'cancelado':
        return 'bg-red-500';
      case 'não iniciado':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('NomeProjeto', newProject.NomeProjeto);
    formData.append('Empresa', newProject.Empresa);
    formData.append('Prazo', newProject.Prazo);
    formData.append('Responsavel', newProject.Responsavel);
    formData.append('EstimativaHoras', newProject.EstimativaHoras);
    formData.append('Layout', newProject.Layout);
  
    try {
      const response = await axios.post('http://PC107662:4001/projetos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        const projectsResponse = await axios.get('http://PC107662:4001/projetos');
        setProjects(projectsResponse.data);
        setShowProjectModal(false);
        setNewProject({
          NomeProjeto: '',
          Empresa: '',
          Prazo: '',
          Responsavel: '',
          EstimativaHoras: '',
          Layout: null,
        });
      } else {
        alert('Erro ao adicionar projeto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao adicionar projeto:', error.response || error);
      alert('Erro ao adicionar projeto. Verifique os dados e tente novamente.');
    }
  };

  const toggleActivities = async (id) => {
    try {
      const response = await axios.get(`http://PC107662:4001/registroDeAtividades/projeto/${id}`);
      setSelectedActivity(response.data);
      setShowActivityPopup(true); // Mostrar o popup de atividades
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    }
  };

  const formatDate = (date) => 
    new Date(date).toLocaleDateString('pt-BR');
  
  const formatHour = (date) => 
    new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Formato 24 horas
    });
  

  // Função para abrir/fechar o modal
  const handleActivityModalToggle = (projectId) => {
    setSelectedProjectId(projectId);  // Armazena o ID do projeto
    setShowActivityModal(!showActivityModal);  // Alterna o estado do modal
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setActivityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChangeActivity = (e) => {
    const files = Array.from(e.target.files); // Converte os arquivos em um array
    setActivityForm((prev) => ({
      ...prev,
      Anexos: [...prev.Anexos, ...files], // Adiciona novos arquivos ao estado
    }));
  };
  
  

  const handleAddActivity = async (e) => {
    e.preventDefault();
  
    try {
      const formData = new FormData();
      formData.append('QualAtividade', activityForm.QualAtividade);
      formData.append('DataDaAtividade', activityForm.DataDaAtividade);
      formData.append('QuantasPessoas', parseInt(activityForm.QuantasPessoas, 10));
      formData.append('HoraInicial', activityForm.HoraInicial);
      formData.append('HoraFinal', activityForm.HoraFinal);
      formData.append('Responsavel', activityForm.Responsavel);
      formData.append('ProjetoID', selectedProjectId);
  
      // Garantir que Anexos seja um array antes de usar forEach
      const anexos = Array.isArray(activityForm.Anexos) ? activityForm.Anexos : [];
      
      anexos.forEach((file) => {
        formData.append('Anexo', file);
      });
  
      const postResponse = await axios.post(
        `http://PC107662:4001/registroDeAtividades`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      const getResponse = await axios.get(
        `http://PC107662:4001/registroDeAtividades/projeto/${selectedProjectId}`
      );
      setActivities((prev) => ({ ...prev, [selectedProjectId]: getResponse.data }));
  
      setShowActivityModal(false);
      setActivityForm({
        QualAtividade: '',
        DataDaAtividade: '',
        QuantasPessoas: '',
        HoraInicial: '',
        HoraFinal: '',
        Responsavel: '',
        Anexos: [], // Limpar os anexos após o envio
      });
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      if (error.response) {
        alert(`Erro ao adicionar atividade: ${error.response.data.error || 'Verifique os dados e tente novamente.'}`);
      } else {
        alert('Erro ao adicionar atividade. Verifique os dados e tente novamente.');
      }
    }
  }; 
    
  const handleDownloadActivities = async (id) => {
    try {
      // Construir o link do PDF
      const pdfUrl = `http://PC107662:4001/gerar-pdf/${id}`;
  
      // Abrir o PDF em uma nova aba
      const newWindow = window.open(pdfUrl, '_blank');
      
      // Verifique se a nova janela foi aberta corretamente
      if (newWindow) {
        newWindow.focus();  // Foca na nova janela (aba)
      } else {
        alert('Falha ao abrir uma nova aba. Por favor, permita pop-ups no navegador.');
      }
    } catch (error) {
      console.error('Erro ao acessar o link do PDF:', error);
      alert('Erro ao tentar abrir o PDF');
    }
  };
  
  
  const handleShowProjectModal = () => {
    setShowProjectModal(true);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Projetos </h2>
        <button
          onClick={handleShowProjectModal}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <div key={project.ID} className="bg-white shadow-md rounded-lg p-4 w-full mb-4 relative">
          <h3 className="text-lg font-semibold">{project.NomeProjeto}</h3>
          <p><strong>Empresa:</strong> {project.Empresa}</p>
          <p><strong>Prazo:</strong> {formatDate(project.Prazo)}</p>
          <p><strong>Responsável:</strong> {project.Responsavel}</p>
          <p><strong>Estimativa de Horas:</strong> {project.EstimativaHoras}</p>

          <div className="mt-4">
            {project.Layout ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenPDFModal(project)}
                  className="text-blue-600 hover:text-blue-800 border border-blue-500 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-blue-700"
                >
                  Abrir Layout
                </button>
                <button
                  onClick={() => handleDownloadActivities(project.ID)}
                  className="text-green-500 hover:text-green-700 border border-green-500 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-green-700 flex items-center"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Baixar Relatório
                </button>
              </div>
            ) : (
              <span className="text-gray-500">Sem Layout</span>
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => toggleActivities(project.ID)}
              className="text-blue-500 hover:text-blue-700 border border-blue-500 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-blue-700 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Mostrar Atividades
            </button>
            <button
              onClick={() => handleActivityModalToggle(project.ID)}
              className="text-blue-500 hover:text-blue-700 border border-blue-500 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-blue-700 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Adicionar Atividade
            </button>
          </div>

          {/* Status Indicator no canto superior direito com tamanho menor */}
          <div className="absolute top-2 right-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getStatusColor(statusMap[project.ID] || 'não iniciado')}`}>
              <span className="text-white text-xs">{(statusMap[project.ID] || 'não iniciado')[0].toUpperCase()}</span>
            </div>
          </div>

          {/* Alterar Status com ícone de lápis */}
          <button
            onClick={() => {
              setSelectedProject(project);
              setIsModalOpen(true);
            }}
            className="absolute top-2 right-12 text-blue-500 hover:text-blue-700"
          >
            <PencilIcon className="h-5 w-5" />
          </button>

          {/* Status and Observação Modal */}
          {isModalOpen && selectedProject.ID === project.ID && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-md w-96">
                <h4 className="text-xl font-semibold mb-4">Alterar Status do Projeto</h4>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    value={statusMap[project.ID] || 'não iniciado'}
                    onChange={(e) => handleStatusChange(project.ID, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="não iniciado">Não Iniciado</option>
                    <option value="em andamento">Em Andamento</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium">Observação</label>
                  <textarea
                    value={observacoes[project.ID] || ''}
                    onChange={(e) => handleObservacaoChange(project.ID, e)}
                    className="w-full p-2 border rounded"
                    rows="4"
                    placeholder="Digite uma observação"
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="mr-4 text-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleStatusChange(project.ID, statusMap[project.ID])}
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
      {/* Modal de Novo Projeto */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-semibold">Adicionar Projeto</h3>
            <form onSubmit={handleAddProject}>
              <div className="mt-4">
                <label className="block text-sm font-medium">Nome do Projeto</label>
                <input
                  type="text"
                  name="NomeProjeto"
                  value={newProject.NomeProjeto}
                  onChange={handleNewProjectChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Empresa</label>
                <input
                  type="text"
                  name="Empresa"
                  value={newProject.Empresa}
                  onChange={handleNewProjectChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Prazo</label>
                <input
                  type="date"
                  name="Prazo"
                  value={newProject.Prazo}
                  onChange={handleNewProjectChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Responsável</label>
                <input
                  type="text"
                  name="Responsavel"
                  value={newProject.Responsavel}
                  onChange={handleNewProjectChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Estimativa de Horas</label>
                <input
                  type="number"
                  name="EstimativaHoras"
                  value={newProject.EstimativaHoras}
                  onChange={handleNewProjectChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Layout</label>
                <input
                  type="file"
                  accept=".pdf,.dwg"
                  name="Layout"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
       {showActivityModal && (
  <div className="modal fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
    <div className="modal-content bg-white p-6 rounded-lg w-96">
      <h2 className="text-lg font-semibold mb-4">Criar Atividade</h2>
      <form onSubmit={handleAddActivity}>
        {/* Campos do formulário */}
        <div className="mb-4">
          <label htmlFor="qualAtividade" className="block text-sm font-medium text-gray-700">
            Qual a atividade?
          </label>
          <input
            id="qualAtividade"
            type="text"
            value={activityForm.QualAtividade}
            onChange={(e) => setActivityForm({ ...activityForm, QualAtividade: e.target.value })}
            placeholder="Qual a atividade?"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="dataDaAtividade" className="block text-sm font-medium text-gray-700">
            Data da Atividade
          </label>
          <input
            id="dataDaAtividade"
            type="date"
            value={activityForm.DataDaAtividade}
            onChange={(e) => setActivityForm({ ...activityForm, DataDaAtividade: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quantasPessoas" className="block text-sm font-medium text-gray-700">
            Quantas pessoas?
          </label>
          <input
            id="quantasPessoas"
            type="number"
            value={activityForm.QuantasPessoas}
            onChange={(e) => setActivityForm({ ...activityForm, QuantasPessoas: e.target.value })}
            placeholder="Quantas pessoas?"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="horaInicial" className="block text-sm font-medium text-gray-700">
            Hora Inicial
          </label>
          <input
            id="horaInicial"
            type="time"
            value={activityForm.HoraInicial}
            onChange={(e) => setActivityForm({ ...activityForm, HoraInicial: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="horaFinal" className="block text-sm font-medium text-gray-700">
            Hora Final
          </label>
          <input
            id="horaFinal"
            type="time"
            value={activityForm.HoraFinal}
            onChange={(e) => setActivityForm({ ...activityForm, HoraFinal: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
            Responsável
          </label>
          <input
            id="responsavel"
            type="text"
            value={activityForm.Responsavel}
            onChange={(e) => setActivityForm({ ...activityForm, Responsavel: e.target.value })}
            placeholder="Responsável"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="anexos" className="block text-sm font-medium text-gray-700">
            Anexos
          </label>
          <input
            id="anexos"
            type="file"
            multiple
            onChange={handleFileChangeActivity} // Chama a função para atualizar o estado com os arquivos
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4 text-right">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-green-700 mr-2"
          >
            Adicionar
          </button>
          <button
            onClick={() => setShowActivityModal(false)}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      
      {showAttachmentsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg relative w-[1440px] h-[800px]">
      <h3 className="text-lg font-semibold">Anexos</h3>
      <button
        onClick={handleCloseAttachmentsModal}
        className="text-gray-500 hover:text-gray-800 absolute top-4 right-4"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      {/* Renderiza o conteúdo conforme o tipo do arquivo */}
      {attachments.some(attachment => attachment.url.split('.').pop()?.toLowerCase() === "pdf") ? (
        // Exibe o PDF fora do slider
        attachments.map((attachment, index) => {
          const { nome, url } = attachment;

          if (!url) {
            console.warn("Anexo sem URL:", attachment);
            return null;
          }

          const fileExtension = url.split('.').pop()?.toLowerCase();
          const tipo = fileExtension === "pdf"
            ? "pdf"
            : ["jpg", "jpeg", "png", "gif"].includes(fileExtension)
            ? "image"
            : "unknown";

          if (tipo === "pdf") {
            return (
              <div key={index} className="flex justify-center items-center mb-4 w-full h-full">
                <iframe
                  src={url}
                  className="w-full h-full"  // Ajuste para preencher o modal
                  style={{border: 'none'}}
                  title={nome}
                />
              </div>
            );
          }
          return null;
        })
      ) : (
        // Exibe o slider normalmente
        <Slider {...sliderSettings}>
          {attachments.map((attachment, index) => {
            const { nome, url } = attachment;

            if (!url) {
              console.warn("Anexo sem URL:", attachment);
              return null;
            }

            const fileExtension = url.split('.').pop()?.toLowerCase();
            const tipo =
              fileExtension === "pdf"
                ? "pdf"
                : ["jpg", "jpeg", "png", "gif"].includes(fileExtension)
                ? "image"
                : "unknown";

            return (
              <div key={index} className="flex justify-center items-center mb-4 w-full h-full">
                {tipo === "image" ? (
                  <img
                    src={url}
                    alt={nome}
                    className="max-w-full max-h-full object-contain"  // Ajuste de imagem
                  />
                ) : tipo === "pdf" ? (
                  <iframe
                    src={url}
                    className="w-full h-full"  // Ajuste para preencher o modal
                    style={{border: 'none'}}
                    title={nome}
                  />
                ) : (
                  <div className="text-center text-gray-500">Tipo de arquivo não suportado</div>
                )}
              </div>
            );
          })}
        </Slider>
      )}
    </div>
  </div>
)}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 h-4/5 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Visualizar Layout</h3>
              <button
                onClick={handleClosePDFModal}
                className="text-gray-500 hover:text-gray-800"
              >
                Fechar
              </button>
            </div>
            <iframe
              src={pdfURL}
              title="PDF Viewer"
              className="flex-grow w-full border rounded"
              style={{ height: 'calc(100% - 50px)' }}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => window.open(pdfURL, '_blank')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Imprimir
              </button>
              <button
                onClick={handleClosePDFModal}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivityPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 relative">
            <button
              onClick={() => setShowActivityPopup(false)}
              className="absolute top-4 right-4 bg-transparent text-gray-500 rounded-full p-2 hover:bg-gray-200 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
            <h3 className="text-lg font-semibold">Atividades</h3>
            <table className="min-w-full mt-4">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Atividade</th>
                  <th className="border px-4 py-2">Data</th>
                  <th className="border px-4 py-2">Responsável</th>
                  <th className="border px-4 py-2">Quantas Pessoas</th>
                  <th className="border px-4 py-2">Hora Inicial</th>
                  <th className="border px-4 py-2">Hora Final</th>
                  <th className="border px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {selectedActivity.map((activity) => (
                  <tr key={activity.ID}>
                    <td className="border px-4 py-2">{activity.QualAtividade}</td>
                    <td className="border px-4 py-2">{formatDate(activity.DataDaAtividade)}</td>
                    <td className="border px-4 py-2">{activity.Responsavel}</td>
                    <td className="border px-4 py-2">{activity.QuantasPessoas}</td>
                    <td className="border px-4 py-2">{formatHour(activity.HoraInicial)}</td>
                    <td className="border px-4 py-2">{formatHour(activity.HoraFinal)}</td>
                    <td className="border px-4 py-2">
                      <button
                        onClick={() => handleLoadAttachments(activity.ID)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Mostrar Anexos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;