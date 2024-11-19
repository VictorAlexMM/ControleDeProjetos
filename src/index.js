import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Se você estiver usando CSS global
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';

// Cria o ponto de entrada da aplicação
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza a aplicação envolvida pelo Router
root.render(
  <React.StrictMode>
    <Router> {/* Envolva o App com o Router */}
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();
