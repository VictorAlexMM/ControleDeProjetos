import React, { useState } from 'react';

const Projects = () => {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    projeto: '',
    empresa: '',
    responsavel: '',
    prazo: '',
    saldo: '',
    estimativaHoras: '',
    valorObra: '',
    quantidadePessoas: ''
  });

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      projeto: '',
      empresa: '',
      responsavel: '',
      prazo: '',
      saldo: '',
      estimativaHoras: '',
      valorObra: '',
      quantidadePessoas: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProjects([...projects, formData]);
    handleCloseModal();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold">Projetos</h2>      
      {/* Button to open the modal */}
      <div className="flex justify-end">
        <button 
            onClick={handleOpenModal} 
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Adicionar Projeto
        </button>
        </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h3 className="text-lg font-semibold mb-4">Adicionar Detalhes do Projeto</h3>
            <form onSubmit={handleSubmit}>
              {Object.entries(formData).map(([key, value]) => (
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
              ))}
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

      {/* Table to display projects */}
      <table className="mt-6 min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Projeto</th>
            <th className="py-3 px-6 text-left">Empresa</th>
            <th className="py-3 px-6 text-left">Responsável</th>
            <th className="py-3 px-6 text-left">Prazo</th>
            <th className="py-3 px-6 text-left">Saldo (R$)</th>
            <th className="py-3 px-6 text-left">Estimativa de Horas </th>
            <th className="py-3 px-6 text-left">Valor da Obra (R$)</th>
            <th className="py-3 px-6 text-left">Quantidade de Pessoas</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {projects.map((project, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6">{project.projeto}</td>
              <td className="py-3 px-6">{project.empresa}</td>
              <td className="py-3 px-6">{project.responsavel}</td>
              <td className="py-3 px-6">{project.prazo}</td>
              <td className="py-3 px-6">{project.saldo}</td>
              <td className="py-3 px-6">{project.estimativaHoras}</td>
              <td className="py-3 px-6">{project.valorObra}</td>
              <td className="py-3 px-6">{project.quantidadePessoas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Projects;