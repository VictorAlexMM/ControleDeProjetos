import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    estimativaHoras: '',
    valorObra: '',
    quantidadePessoas: ''
  });

  const [activities, setActivities] = useState({}); // Estado para armazenar atividades por projeto
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [projectId, setProjectId] = useState(null); // Armazena o ID do projeto atual
  const [newActivity, setNewActivity] = useState({
    descricao: '',
    data: '',
    quantidadePessoas: '',
    horaInicial: '',
    horaFinal: '',
    responsavel: '',
    anexo: null
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
      estimativaHoras: '',
      valorObra: '',
      quantidadePessoas: ''
    });
  };

  const handleActivityFormClose = () => {
    setShowActivityForm(false);
    setNewActivity({
      descricao: '',
      data: '',
      quantidadePessoas: '',
      horaInicial: '',
      horaFinal: '',
      responsavel: '',
      anexo: null
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setNewActivity({
      ...newActivity,
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

  const handleActivityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewActivity({
        ...newActivity,
        anexo: file
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const saldoConvertido = parseFloat(formData.saldo.replace(/[^\d,.-]/g, '').replace(',', '.'));
    const estimativaHorasConvertida = parseInt(formData.estimativaHoras.replace(/[^\d]/g, ''), 10);
    const valorObraConvertido = parseFloat(formData.valorObra.replace(/[^\d,.-]/g, '').replace(',', '.'));

    const data = new FormData();
    data.append('NomeProjeto', formData.projeto);
    data.append('Empresa', formData.empresa);
    data.append('Responsavel', formData.responsavel);
    data.append('Prazo', formData.prazo);
    data.append('Saldo', saldoConvertido);
    data.append('EstimativaHoras', estimativaHorasConvertida);
    data.append('ValorObra', valorObraConvertido);
    data.append('QuantidadePessoas', formData.quantidadePessoas);
    if (formData.layout) {
      data.append('layout', formData.layout);
    }

    try {
      await axios.post('http://localhost:4001 /projetos', data, {
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

  const handleActivitySubmit = async (e) => {
    e.preventDefault();

    const activityData = new FormData();
    activityData.append('descricao', newActivity.descricao);
    activityData.append('data', newActivity.data);
    activityData.append('quantidadePessoas', newActivity.quantidadePessoas);
    activityData.append('horaInicial', newActivity.horaInicial);
    activityData.append('horaFinal', newActivity.horaFinal);
    activityData.append('responsavel', newActivity.responsavel);
    if (newActivity.anexo) {
      activityData.append('anexo', newActivity.anexo);
    }

    try {
      await axios.post(`http://localhost:4001/projetos/${projectId}/atividades`, activityData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      handleActivityFormClose();
      const updatedResponse = await axios.get('http://localhost:4001/projetos');
      setProjects(updatedResponse.data);
    } catch (error) {
      console.error('Erro ao adicionar a atividade:', error);
      alert('Erro ao adicionar a atividade. Verifique os dados e tente novamente.');
    }
  };

  const toggleActivities = (id) => {
    setActivities((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Projetos</h2>
      <div className="flex justify-end">
        <button
          onClick={handleOpenModal}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Adicionar Projeto
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
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showActivityForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Adicionar Atividade</h3>
            <form onSubmit={handleActivitySubmit}>
              <div className="mb-4">
                <label class Name="block text-sm font-medium text-gray-700">Qual atividade?</label>
                <input
                  type="text"
                  name="descricao"
                  value={newActivity.descricao}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Data da atividade</label>
                <input
                  type="date"
                  name="data"
                  value={newActivity.data}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantas pessoas</label>
                <input
                  type="number"
                  name="quantidadePessoas"
                  value={newActivity.quantidadePessoas}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Hora inicial</label>
                <input
                  type="time"
                  name="horaInicial"
                  value={newActivity.horaInicial}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Hora final</label>
                <input
                  type="time"
                  name="horaFinal"
                  value={newActivity.horaFinal}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Responsável</label>
                <input
                  type="text"
                  name="responsavel"
                  value={newActivity.responsavel}
                  onChange={handleActivityChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Anexo de registro de atividade</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleActivityFileChange}
                  className="mt-1 block w-full border border-gray-300 rounded p-2"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleActivityFormClose}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="mt-6 min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Nome do Projeto</th>
            <th className="py-3 px-6 text-left">Empresa</th>
            <th className="py-3 px-6 text-left">Responsável</th>
            <th className="py-3 px-6 text-left">Prazo</th>
            <th className="py-3 px-6 text-left">Saldo (R$)</th>
            <th className="py-3 px-6 text-left">Estimativa de Horas</th>
            <th className="py-3 px-6 text-left">Valor da Obra (R$)</th>
            <th className="py-3 px-6 text-left">Quantidade de Pessoas</th>
            <th className="py-3 px-6 text-left">Layout</th>
            <th className="py-3 px-6 text-left ">Atividades</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {projects.map((project, index) => (
            <React.Fragment key={index}>
              <tr className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6">{project.NomeProjeto}</td>
                <td className="py-3 px-6">{project.Empresa}</td>
                <td className="py-3 px-6">{project.Responsavel}</td>
                <td className="py-3 px-6">{project.Prazo}</td>
                <td className="py-3 px-6">{project.Saldo}</td>
                <td className="py-3 px-6">{project.EstimativaHoras}</td>
                <td className="py-3 px-6">{project.ValorObra}</td>
                <td className="py-3 px-6">{project.QuantidadePessoas}</td>
                <td className="py-3 px-6">{project.Layout ? project.Layout.name : 'Nenhum arquivo'}</td>
                <td className="py-3 px-6">
                  <button
                    onClick={() => {
                      toggleActivities(project.NomeProjeto);
                      setProjectId(project.id); // Armazena o ID do projeto atual
                      setShowActivityForm(true);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    <i className={`fas fa-chevron-${activities[project.NomeProjeto] ? 'up' : 'down'}`}></i>
                  </button>
                </td>
              </tr>
              {activities[project.NomeProjeto] && (
                <tr>
                  <td colSpan="10" className="py-3 px-6">
                    <div className="border-t border-gray-200 mt-2">
                      <h4 className="font-semibold">Atividades:</h4>
                      <ul className="list-disc pl-5">
                        {project.atividades && project.atividades.map((activity, idx) => (
                          <li key={idx}>{activity.descricao} - {activity.data}</li>
                        ))}
                      </ul>
                    </div>
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