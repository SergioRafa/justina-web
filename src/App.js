import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. ESTADO INICIAL: Tenta buscar dados salvos no navegador. Se não houver, usa a lista padrão.
  const [cirurgias, setCirurgias] = useState(() => {
    const dadosSalvos = localStorage.getItem('justina_cirurgias');
    return dadosSalvos ? JSON.parse(dadosSalvos) : [
      { id: 1, paciente: "MARCOS PEREIRA", procedimento: "Nefrolitotripsia", rim: "Direito", status: "Em Sala" },
      { id: 2, paciente: "JULIA COSTA", procedimento: "Transplante Renal", rim: "Bilateral", status: "Agendado" }
    ];
  });

  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [rim, setRim] = useState('Direito');

  // 2. PERSISTÊNCIA: Salva no LocalStorage automaticamente toda vez que a lista mudar
  useEffect(() => {
    localStorage.setItem('justina_cirurgias', JSON.stringify(cirurgias));
  }, [cirurgias]);

  // 3. FUNÇÃO PARA AGENDAR: Cria a nova cirurgia e limpa o input
  const agendarCirurgia = (e) => {
    e.preventDefault();
    
    // 1. Transforma o nome em maiúsculo para comparar sem erro
    const nomeMaiusculo = paciente.trim().toUpperCase();

    if (!nomeMaiusculo) return alert("Por favor, digite o nome do paciente!");

    // 2. TRAVA ANTI-DUPLICAÇÃO:
    // O .some() percorre a lista e verifica se já existe alguém com o mesmo NOME e PROCEDIMENTO
    const jaExiste = cirurgias.some(c => 
      c.paciente.toUpperCase() === nomeMaiusculo && 
      c.procedimento === procedimento
    );

    if (jaExiste) {
      alert(`⚠️ ATENÇÃO: ${nomeMaiusculo} já possui um agendamento para ${procedimento.toUpperCase()}!`);
      return; // O 'return' para a função aqui e NÃO adiciona na lista
    }

    // 3. Se passou pela trava, adiciona normalmente
    const novaCirurgia = {
      id: Date.now(),
      paciente: nomeMaiusculo,
      procedimento,
      rim,
      status: "Agendado"
    };

    setCirurgias([novaCirurgia, ...cirurgias]);
    setPaciente(''); 
  };

  // 4. FUNÇÃO PARA EXCLUIR: Remove uma cirurgia da lista
  const excluirCirurgia = (id) => {
    const listaFiltrada = cirurgias.filter(c => c.id !== id);
    setCirurgias(listaFiltrada);
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
              placeholder="NOME DO PACIENTE" 
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
          {cirurgias.length === 0 && <p style={{textAlign: 'center', color: '#666'}}>Nenhuma cirurgia agendada.</p>}
          
          {cirurgias.map(c => (
            <div key={c.id} className="card">
              <div className="info">
                <h3 style={{textTransform: 'uppercase'}}>{c.procedimento}</h3>
                <p>Paciente: <strong>{c.paciente}</strong> | Lado: {c.rim}</p>
              </div>
              <div className="acoes">
                <span className={`status-tag ${c.status.toLowerCase().replace(' ', '-')}`}>
                  {c.status}
                </span>
                <button className="btn-excluir" onClick={() => excluirCirurgia(c.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;