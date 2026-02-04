import React, { useState } from 'react';
import './App.css';

function App() {
  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [rim, setRim] = useState('Direito');

  const [cirurgias, setCirurgias] = useState([
    { id: 1, paciente: "Marcos Pereira", procedimento: "Nefrolitotripsia", rim: "Direito", status: "Em Sala" },
    { id: 2, paciente: "Julia Costa", procedimento: "Transplante Renal", rim: "Bilateral", status: "Agendado" }
  ]);

  const agendarCirurgia = (e) => {
    e.preventDefault();
    if (!paciente) return alert("Digite o nome do paciente!");

    const novaCirurgia = {
      id: Date.now(),
      paciente,
      procedimento,
      rim,
      status: "Agendado"
    };

    setCirurgias([novaCirurgia, ...cirurgias]);
    setPaciente(''); // Limpa o campo
  };

  return (
    <div className="App">
      <header className="hospital-header">
        <h1>🏥 Justina Renal</h1>
        <p>Sistema de Gerenciamento Cirúrgico</p>
      </header>

      <main className="container">
        {/* FORMULÁRIO DE AGENDAMENTO */}
        <form className="agendamento-form" onSubmit={agendarCirurgia}>
          <h3>Novo Agendamento</h3>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="Nome do Paciente" 
              value={paciente}
              onChange={(e) => setPaciente(e.target.value.toUpperCase())}
            />
            <select value={procedimento} onChange={(e) => setProcedimento(e.target.value)}>
              <option>Nefrectomia</option>
              <option>Transplante Renal</option>
              <option>Ureteroscopia</option>
              <option>Nefrolitotripsia</option>
            </select>
            <select value={rim} onChange={(e) => setRim(e.target.value)}>
              <option>Direito</option>
              <option>Esquerdo</option>
              <option>Bilateral</option>
            </select>
            <button type="submit">Agendar</button>
          </div>
        </form>

        <div className="lista-cirurgias">
          <h2>Mapa Cirúrgico Atual</h2>
          {cirurgias.map(c => (
            <div key={c.id} className="card">
              <div className="info">
                <h3>{c.procedimento}</h3>
                <p>Paciente: <strong>{c.paciente}</strong> | Lado: {c.rim}</p>
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