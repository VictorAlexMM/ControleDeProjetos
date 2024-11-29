import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from "react-slick"; // Importando o carrossel
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState({});
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [pdfURL, setPdfURL] = useState('');
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
    Anexos: [],
  });
  const [showActivityPopup, setShowActivityPopup] = useState(false); // Estado para mostrar o popup de atividades
  const [selectedActivity, setSelectedActivity] = useState([]); // Estado para a atividade selecionada

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

  const handleOpenPDFModal = async (project) => {
    const { ano, mes, dia, NomeProjeto, filename } = project;
  
    // Verifica se todas as propriedades estão definidas
    if (!ano || !mes || !dia || !NomeProjeto || !filename) {
      console.error('Propriedades do projeto estão indefinidas:', project);
      alert('Erro: Dados do projeto estão incompletos.');
      return;
    }
  
    const url = `http://localhost:4001/uploads/projeto/${ano}/${mes}/${dia}/${NomeProjeto}/${filename}`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar o arquivo: ' + response.statusText);
      }
  
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      const fileExtension = filename.split('.').pop().toLowerCase();
  
      if (fileExtension === 'pdf') {
        window.open(fileURL, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
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
      const response = await axios.get(`http://localhost:4001/registroDeAtividades/anexos/${activityId}`);
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
    try {
      const response = await axios.get(`http://localhost:4001/registroDeAtividades/projeto/${id}`);
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
    const files = Array.from(e.target.files);
    setActivityForm((prev) => ({
      ...prev,
      Anexos: [...prev.Anexos, ...files],
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
  
      activityForm.Anexos?.forEach((file) => {
        formData.append('Anexo', file);
      });
  
      const postResponse = await axios.post(
        `http://localhost:4001/registroDeAtividades`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      const getResponse = await axios.get(
        `http://localhost:4001/registroDeAtividades/projeto/${selectedProjectId}`
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
        Anexos: [],
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
        <div key={project.ID} className="bg-white shadow-md rounded-lg p-4 w-2/1">
          <h3 className="text-lg font-semibold">{project.NomeProjeto}</h3>
          <p><strong>Empresa:</strong> {project.Empresa}</p>
          <p><strong>Prazo:</strong> {formatDate(project.Prazo)}</p>
          <p><strong>Responsável:</strong> {project.Responsavel}</p>
          <p><strong>Estimativa de Horas:</strong> {project.EstimativaHoras}</p>
          <div className="mt-4">
            {project.Layout ? (
              <button
              onClick={() => handleOpenPDFModal(project)}
              className="text-blue-600 hover:text-blue-800 border border-blue-500 rounded-full px-3 py-1 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:border-blue-700"
            >
              Abrir Layout
            </button>
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
                  <div key={index} className="flex justify-center items-center">
                    {tipo === "image" ? (
                      <img
                        src={url}
                        alt={nome}
                        className="max-w-full max-h-800 object-contain"
                      />
                    ) : tipo === "pdf" ? (
                      <iframe
                        src={url}
                        className="w-full h-80"
                        title={nome}
                      />
                    ) : (
                      <div className="text-center text-gray-500">Tipo de arquivo não suportado</div>
                    )}
                  </div>
                );
              })}
            </Slider>
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-3/4">
            <h3 className="text-lg font-semibold">Atividades</h3>
            <button
              onClick={() => setShowActivityPopup(false)}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
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