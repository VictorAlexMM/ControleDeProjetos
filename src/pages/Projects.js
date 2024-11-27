import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from "react-slick"; // Importando o carrossel
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState({});
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [pdfURL, setPdfURL] = useState('');
  const [activitiesVisibility, setActivitiesVisibility] = useState({});
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    NomeProjeto: '',
    Empresa: '',
    Prazo: '',
    Responsavel: '',
    EstimativaHoras: '',
    Layout: null,
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
    Anexo: null, // Novo campo para o anexo
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:4001/projetos');
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

  const handleOpenPDFModal = (url) => {
    setPdfURL(url);
    setShowPDFModal(true);
  };
  
  const handleClosePDFModal = () => {
    setShowPDFModal(false);
    setPdfURL('');
  }; 

  const handleAddProject = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('NomeProjeto', newProject.NomeProjeto);
    formData.append('Empresa', newProject.Empresa);
    formData.append('Prazo', newProject.Prazo);
    formData.append('Responsavel', newProject.Responsavel);
    formData.append('EstimativaHoras', newProject.EstimativaHoras);
  
    if (newProject.Layout) {
      formData.append('layout', newProject.Layout);
    }
  
    try {
      const response = await axios.post('http://localhost:4001/projetos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 201) {
        const projectsResponse = await axios.get('http://localhost:4001/projetos');
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
    setActivitiesVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    if (!activities[id] && !activitiesVisibility[id]) {
      try {
        const response = await axios.get(`http://localhost:4001/registroDeAtividades/projeto/${id}`);
        setActivities((prev) => ({ ...prev, [id]: response.data }));
      } catch (error) {
        console.error('Erro ao buscar atividades:', error);
      }
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');

  const handleActivityModalToggle = (projectId) => {
    setSelectedProjectId(projectId);
    setShowActivityModal(!showActivityModal);
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setActivityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChangeActivity = (e) => {
    const file = e.target.files[0];
    setActivityForm((prev) => ({
      ...prev,
      Anexo: file, // Armazena o arquivo anexo no estado
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
      formData.append('ProjetoID', selectedProjectId); // Preenche automaticamente com o selectedProjectId

      if (activityForm.Anexo) {
        formData.append('Anexo', activityForm.Anexo); // Adiciona o anexo ao FormData
      }

      const postResponse = await axios.post(`http://localhost:4001/registroDeAtividades`, formData);
  
      const getResponse = await axios.get(`http://localhost:4001/registroDeAtividades/projeto/${selectedProjectId}`);
      setActivities((prev) => ({ ...prev, [selectedProjectId]: getResponse.data }));
  
      setShowActivityModal(false);
      setActivityForm({
        QualAtividade: '',
        DataDaAtividade: '',
        QuantasPessoas: '',
        HoraInicial: '',
        HoraFinal: '',
        Responsavel: '',
        Anexo: null, // Resetar o anexo
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

  const handleShowProjectModal = () => {
    setShowProjectModal(true);
  };

  const handleLoadAttachments = async (activityId) => {
    try {
      // Requisição para obter os anexos da API
      const response = await axios.get(`http://localhost:4001/registroDeAtividades/projeto/${activityId}`);
  
      const attachmentsData = response.data;
  
      if (!attachmentsData || attachmentsData.length === 0) {
        alert('Nenhum anexo encontrado para esta atividade.');
        return;
      }
  
      const attachments = attachmentsData.map((attachment) => {
        const { ano, mes, dia, qualAtividade, filename } = attachment;
        const fileUrl = `http://localhost:4001/uploads/registroDeAtividades/${ano}/${mes}/${dia}/${qualAtividade}/${filename}`;
        return { ...attachment, fileUrl };
      });
      
      setAttachments(attachments); // Armazena os anexos no estado
      setShowAttachmentsModal(true); // Exibe o modal de anexos
    } catch (error) {
      console.error("Erro ao carregar anexos:", error);
    }
  }; 

  const handleCloseAttachmentsModal = () => {
    setShowAttachmentsModal(false);
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Projetos</h2>
        <button
          onClick={handleShowProjectModal}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Projeto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-separate border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-200 text-gray-700 text-sm">
            <tr>
              <th className="p-3 text-left">Nome do Projeto</th>
              <th className="p-3 text-left">Empresa</th>
              <th className="p-3 text-left">Prazo</th>
              <th className="p-3 text-left">Responsável</th>
              <th className="p-3 text-left">Estimativa de Horas</th>
              <th className="p-3 text-left">Layout</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {projects.map((project) => (
              <React.Fragment key={project.ID}>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-3">{project.NomeProjeto}</td>
                  <td className="p-3">{project.Empresa}</td>
                  <td className="p-3">{formatDate(project.Prazo)}</td>
                  <td className="p-3">{project.Responsavel}</td>
                  <td className="p-3">{project.EstimativaHoras}</td>
                  <td className="p-3">
                    {project.Layout ? (
                      <button
                        onClick={() => handleOpenPDFModal(`http://localhost:4001/uploads/${project.Layout}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Abrir Layout
                      </button>
                    ) : (
                      <span className="text-gray-500">Sem Layout</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleActivities(project.ID)}
                      className="text-blue-500 hover:text-blue-700 mr-2 flex items-center justify-center"
                    >
                      {activitiesVisibility[project.ID] ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                      {activitiesVisibility[project.ID] ? 'Ocultar' : 'Exibir'}
                    </button>
                    <button
                      onClick={() => handleActivityModalToggle(project.ID)}
                      className="text-blue-500 hover:text-blue-700 flex items-center justify-center"
                    >
                      <PlusIcon className="h-5 w-5 mr-1" />
                      Adicionar Atividade
                    </button>
                  </td>
                </tr>
                {activitiesVisibility[project.ID] && (
                  <tr>
                    <td colSpan="7" className="p-4">
                      <h3 className="text-xl font-semibold">Atividades</h3>
                      <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
                        <thead className="bg-gray-100 text-gray-700 text-sm">
                          <tr>
                            <th className="p-3">Qual Atividade</th>
                            <th className="p-3">Data</th>
                            <th className="p-3">Quantas Pessoas</th>
                            <th className="p-3">Hora Inicial</th>
                            <th className="p-3">Hora Final</th>
                            <th className="p-3">Responsável</th>
                            <th className="p-3">Criado</th>
                            <th className="p-3">Anexos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities[project.ID]?.map((activity) => (
                            <tr key={activity.ID}>
                              <td className="p-3">{activity.QualAtividade}</td>
                              <td className="p-3">{formatDate(activity.DataDaAtividade)}</td>
                              <td className="p-3">{activity.QuantasPessoas}</td>
                              <td className="p-3">
                                {new Date(activity.HoraInicial).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3">
                                {new Date(activity.HoraFinal).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3">{activity.Responsavel}</td>
                              <td className="p-3">
                                {new Date(activity.CriadoEm).toLocaleDateString("pt-BR")} {new Date(activity.CriadoEm).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3">
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
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
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

     {showAttachmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-2/3 max-w-4xl">
            <h3 className="text-lg font-semibold">Anexos</h3>
            <button
              onClick={handleCloseAttachmentsModal}
              className="text-gray-500 hover:text-gray-800 absolute top-4 right-4"
            >
              Fechar
            </button>

            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
            >
              {attachments.map((attachment, index) => (
                <div key={index} className="flex justify-center items-center">
                  {attachment.tipo === 'image' ? (
                    <img 
                      src={attachment.fileUrl} 
                      alt={attachment.nome} 
                      className="max-w-full max-h-80 object-contain" 
                    />
                  ) : attachment.tipo === 'pdf' ? (
                    <iframe
                      src={attachment.fileUrl}
                      className="w-full h-80"
                      title={attachment.nome}
                    />
                  ) : (
                    <div className="text-center text-gray-500">Tipo de arquivo não suportado</div>
                  )}
                </div>
              ))}
            </Slider>
          </div>
        </div>
      )}
      {showPDFModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z -50">
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
      {/* Modal de Atividade */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-semibold">Adicionar Atividade</h3>
            <form onSubmit={handleAddActivity}>
              <div className="mt-4">
                <label className="block text-sm font-medium">Qual Atividade</label>
                <input
                  type="text"
                  name="QualAtividade"
                  value={activityForm.QualAtividade}
                  onChange={handleActivityChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Data</label>
                <input
                  type="date"
                  name="DataDaAtividade"
                  value={activityForm.DataDaAtividade}
                  onChange={handleActivityChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Quantas Pessoas</label>
                <input
                  type="number"
                  name="QuantasPessoas"
                  value={activityForm.QuantasPessoas}
                  onChange={handleActivityChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Hora Inicial</label>
                <input
                  type="time"
                  name="HoraInicial"
                  value={activityForm.HoraInicial}
                  onChange={handleActivityChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Hora Final</label>
                <input
                  type="time"
                  name="HoraFinal"
                  value={activityForm.HoraFinal}
                  onChange={handleActivityChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Responsável</label>
                <input
                  type="text"
                  name="Responsavel"
                  value={activityForm.Responsavel}
                  onChange={handleActivityChange}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                  required
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Anexo</label>
                <input
                  type="file"
                  name="Anexo"
                  onChange={handleFileChangeActivity}
                  className="w-full p-2 border border-gray-300 rounded mt-1"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className ="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
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
    </div>
  );
};

export default Projects;