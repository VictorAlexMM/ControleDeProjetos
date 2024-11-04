import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Clock from './pages/Clocks';
import Sidenav from './components/Sidenav';
import Container from './components/Container';

function App() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidenav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Router>
      <div className="flex">
        <Sidenav isOpen={isOpen} toggleSidenav={toggleSidenav} />
        
        <div className="flex-1 p-10">
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/clock" element={<Clock />} />
            </Routes>
          </Container>
        </div>
      </div>
    </Router>
  );
}

export default App;
