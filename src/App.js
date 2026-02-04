import React, { useState } from 'react';
import './App.css';

function App() {
  const [cirurgias] = useState([
    { id: 1, paciente: "Marcos Pereira", procedimento: "Nefrolitotripsia", rim: "Direito", status: "Em Sala" },
    { id: 2, paciente: "Julia Costa", procedimento: "Transplante Renal", rim: "Bilateral", status: "Agendado" },
    { id: 3, paciente: "Roberto Alves", procedimento: "Nefrectomia Parcial", rim: "Esquerdo", status: "Concluído" }
  ]);

  return (
    <div className="App">
      <header className="hospital-header">
        <h1>🏥 Justina Renal</h1>
        <p>Unidade de Transplante e Cirurgia Robótica</p>
      </header>

      <main className="container">
        <div className="stats-row">
          <div className="stat-box">Cirurgias Hoje: <strong>8</strong></div>
          <div className="stat-box">Salas Disponíveis: <strong>2</strong></div>
        </div>

        <div className="lista-cirurgias">
          {cirurgias.map(c => (
            <div key={c.id} className="card">
              <div className="info">
                <h3>{c.procedimento}</h3>
                <p>Paciente: {c.paciente} | Lado: <strong>{c.rim}</strong></p>
              </div>
              <span className={`status-tag ${c.status.toLowerCase().replace(' ', '-')}`}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;