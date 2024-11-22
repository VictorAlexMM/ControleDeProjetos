import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, PencilIcon, ChevronDownIcon, ChevronUpIcon, DocumentIcon } from '@heroicons/react/24/solid';

const Projects = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projeto: '',
    empresa: '',
    responsavel: '',
    prazo: '',
    saldo: '',
    layout: null,
    estimativaHoras: ''
  });
  const [activitiesVisibility, setActivitiesVisibility] = useState({});
  const [showActivityForm, setShowActivityForm] = useState(false);  // Para controle do popup de adicionar atividade
  const [activityData, setActivityData] = useState({
    descricao: '',
    data: '',
    responsavel: '',
    quantidadePessoas: '',
    anexo: null
  });

  const [projectId, setProjectId] = useState(null);

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

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      projeto: '',
      empresa: '',
      responsavel: '',
      prazo: '',
      saldo: '',
      layout: null,
      estimativaHoras: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/octet-stream')) {
      setFormData({
        ...formData,
        layout: file
      });
    } else {
      alert('Por favor, anexe um arquivo PDF ou DWG.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saldoConvertido = parseFloat(formData.saldo.replace(/[^\d,.-]/g, '').replace(',', '.'));
    const estimativaHorasConvertida = parseInt(formData.estimativaHoras.replace(/[^\d]/g, ''), 10);

    const data = new FormData();
    data.append('NomeProjeto', formData.projeto);
    data.append('Empresa', formData.empresa);
    data.append('Responsavel', formData.responsavel);
    data.append('Prazo', new Date(formData.prazo).toISOString().slice(0, 10));
    data.append('Saldo', saldoConvertido);
    data.append('EstimativaHoras', estimativaHorasConvertida);
    if (formData.layout) {
      data.append('layout', formData.layout);
    }

    try {
      await axios.post('http://localhost:4001/projetos', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedResponse = await axios.get('http://localhost:4001/projetos');
      setProjects(updatedResponse.data);
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao adicionar o projeto:', error);
      alert('Erro ao adicionar o projeto. Verifique os dados e tente novamente.');
    }
  };

  const toggleActivities = (id) => {
    setActivitiesVisibility((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openLayoutModal = async (projectId) => {
    try {
      const response = await axios.get(`http://localhost:4001/projetos/layout/${projectId}`);
      const layoutUrl = response.data.layoutUrl;
      window.open(layoutUrl, '_blank');
    } catch (error) {
      alert('Erro ao abrir o layout. Tente novamente mais tarde.');
    }
  };

  // Função para abrir o popup de "Adicionar Atividade"
  const handleOpenActivityForm = (projectId) => {
    setProjectId(projectId);  // Define o projeto que estamos adicionando atividade
    setShowActivityForm(true);  // Exibe o formulário de adicionar atividade
  };

  // Função para fechar o popup de "Adicionar Atividade"
  const handleCloseActivityForm = () => {
    setShowActivityForm(false);
    setActivityData({
      descricao: '',
      data: '',
      responsavel: '',
      quantidadePessoas: '',
      anexo: null
    });
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setActivityData({
      ...activityData,
      [name]: value
    });
  };

  const handleActivityFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/octet-stream')) {
      setActivityData({
        ...activityData,
        anexo: file
      });
    } else {
      alert('Por favor, anexe um arquivo PDF ou DWG.');
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('Descricao', activityData.descricao);
    data.append('Data', new Date(activityData.data).toISOString().slice(0, 10));
    data.append('Responsavel', activityData.responsavel);
    data.append('QuantidadePessoas', activityData.quantidadePessoas);
    if (activityData.anexo) {
      data.append('Anexo', activityData.anexo);
    }

    try {
      await axios.post(`http://localhost:4001/projetos/${projectId}/atividades`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedProjects = [...projects];
      const projectIndex = updatedProjects.findIndex(project => project.id === projectId);
      updatedProjects[projectIndex].Atividades.push(activityData);  // Atualiza o projeto com a nova atividade

      setProjects(updatedProjects);
      handleCloseActivityForm();  // Fecha o formulário de adicionar atividade
    } catch (error) {
      console.error('Erro ao adicionar a atividade:', error);
      alert('Erro ao adicionar a atividade. Tente novamente mais tarde.');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR');
  
  const formatHours = (saldo) => {
    return `${saldo} horas`;
  };

  const checkStatus = (prazo) => {
    const today = new Date();
    const dueDate = new Date(prazo);
    return dueDate < today ? 'Atrasada' : 'Dentro do Prazo';
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Projetos</h2>
      <div className="flex justify-end">
        <button
          onClick={handleOpenModal}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <PlusIcon className="h-5 w-5 inline-block mr-1" /> Adicionar Projeto
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Adicionar Detalhes do Projeto</h3>
            <form onSubmit={handleSubmit}>
              {Object.entries(formData).map(([key, value]) => (
                key !== 'layout' && (
                  <div className="mb-4" key={key}>
                    <label className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
                    <input
                      type={key === 'prazo' ? 'date' : 'text'}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                  </div>
                )
              ))}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Layout (PDF ou DWG)</label>
                <input
                  type="file"
                  accept=".pdf,.dwg"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Adicionar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup de adicionar atividade */}
      {showActivityForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Adicionar Atividade</h3>
            <form onSubmit={handleActivitySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <input
                  type="text"
                  name="descricao"
                  value={activityData.descricao}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  name="data"
                  value={activityData.data}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Responsável</label>
                <input
                  type="text"
                  name="responsavel"
                  value={activityData.responsavel}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantidade de Pessoas</label>
                <input
                  type="number"
                  name="quantidadePessoas"
                  value={activityData.quantidadePessoas}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Anexo (PDF ou DWG)</label>
                <input
                  type="file"
                  accept=".pdf,.dwg"
                  onChange={handleActivityFileChange}
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button type="button" onClick={handleCloseActivityForm} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Adicionar Atividade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="min-w-full mt-6 table-auto">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 border">Nome</th>
            <th className="px-4 py-2 border">Responsável</th>
            <th className="px-4 py-2 border">Prazo</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Saldo</th>
            <th className="px-4 py-2 border">Layout</th>
            <th className="px-4 py-2 border">Atividades</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <tr>
                <td className="px-4 py-2 border">{project.NomeProjeto}</td>
                <td className="px-4 py-2 border">{project.Responsavel}</td>
                <td className="px-4 py-2 border">{formatDate(project.Prazo)}</td>
                <td className="px-4 py-2 border">{checkStatus(project.Prazo)}</td>
                <td className="px-4 py-2 border">{formatHours(project.Saldo)}</td>

                <td className="px-4 py-2 border">
                  {project.layout && (
                    <button
                      onClick={() => openLayoutModal(project.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <DocumentIcon className="h-5 w-5 inline-block" />
                    </button>
                  )}
                </td>

                <td className="px-4 py-2 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleActivities(project.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {activitiesVisibility[project.id] ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleOpenActivityForm(project.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
              {activitiesVisibility[project.id] && (
                <tr>
                  <td colSpan="7" className="px-4 py-2 border">
                    {project.Atividades && project.Atividades.length > 0 ? (
                      <table className="w-full mt-4">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 border">Descrição</th>
                            <th className="px-4 py-2 border">Data</th>
                            <th className="px-4 py-2 border">Responsável</th>
                            <th className="px-4 py-2 border">Quant. Pessoas</th>
                            <th className="px-4 py-2 border">Anexo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.Atividades.map((activity) => (
                            <tr key={activity.id}>
                              <td className="px-4 py-2 border">{activity.descricao}</td>
                              <td className="px-4 py-2 border">{formatDate(activity.data)}</td>
                              <td className="px-4 py-2 border">{activity.responsavel}</td>
                              <td className="px-4 py-2 border">{activity.quantidadePessoas}</td>
                              <td className="px-4 py-2 border">
                                {activity.anexo && (
                                  <button
                                    onClick={() => openLayoutModal(activity.id)}
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    Visualizar Anexo
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma atividade encontrada.</p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Projects;
