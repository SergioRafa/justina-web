import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [cirurgias, setCirurgias] = useState([]);
  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [rim, setRim] = useState('Direito');

  // 1. CARREGAR DADOS DO JAVA (GET)
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resposta = await fetch("http://localhost:8081/api/cirurgias");
        if (resposta.ok) {
          const dados = await resposta.json();
          setCirurgias(dados);
        } else {
          const salvos = localStorage.getItem('justina_cirurgias');
          if (salvos) setCirurgias(JSON.parse(salvos));
        }
      } catch (erro) {
        console.error("Java offline. Usando dados locais.");
        const salvos = localStorage.getItem('justina_cirurgias');
        if (salvos) setCirurgias(JSON.parse(salvos));
      }
    };
    carregarDados();
  }, []);

  // 2. SALVAR NO JAVA (POST)
  const agendarCirurgia = async (e) => {
    e.preventDefault();
    const nomeMaiusculo = paciente.trim().toUpperCase();

    if (!nomeMaiusculo) return alert("Por favor, digite o nome do paciente!");

    const jaExiste = cirurgias.some(c => 
      c.paciente.toUpperCase() === nomeMaiusculo && c.procedimento === procedimento
    );

    if (jaExiste) {
      alert(`⚠️ ATENÇÃO: ${nomeMaiusculo} já possui um agendamento para ${procedimento}!`);
      return;
    }

    const novaCirurgia = {
      paciente: nomeMaiusculo,
      procedimento,
      rim,
      status: "Agendado"
    };

    try {
      // Envia para o Java
      const resposta = await fetch("http://localhost:8081/api/cirurgias", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaCirurgia)
      });

      if (resposta.ok) {
        const cirurgiaSalvaNoBanco = await resposta.json();
        setCirurgias([cirurgiaSalvaNoBanco, ...cirurgias]);
        setPaciente('');
      } else {
        alert("Erro ao salvar no banco de dados.");
      }
    } catch (erro) {
      console.error("Erro de conexão:", erro);
      // Plano B: Se o Java falhar, salva só na tela e no localStorage
      const fallback = { ...novaCirurgia, id: Date.now() };
      const novaLista = [fallback, ...cirurgias];
      setCirurgias(novaLista);
      localStorage.setItem('justina_cirurgias', JSON.stringify(novaLista));
      setPaciente('');
    }
  };

  // 3. EXCLUIR (DELETE) - Opcional: Integrar com Java depois
  const excluirCirurgia = (id) => {
    const listaFiltrada = cirurgias.filter(c => c.id !== id);
    setCirurgias(listaFiltrada);
    localStorage.setItem('justina_cirurgias', JSON.stringify(listaFiltrada));
  };

  const alternarStatus = (id) => {
    const novosStatus = { "Agendado": "Em Sala", "Em Sala": "Concluído", "Concluído": "Agendado" };
    setCirurgias(cirurgias.map(c => 
      c.id === id ? { ...c, status: novosStatus[c.status] } : c
    ));
  };

  return (
    <div className="App">
      <header className="hospital-header">
        <h1>🏥 Justina Renal</h1>
        <p>Sistema de Gerenciamento Cirúrgico</p>
      </header>

      <main className="container">
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
            <div key={c.id || Math.random()} className="card">
              <div className="info">
                <h3 style={{textTransform: 'uppercase'}}>{c.procedimento}</h3>
                <p>Paciente: <strong>{c.paciente}</strong> | Lado: {c.rim}</p>
              </div>
              <div className="acoes">
                <span 
                  className={`status-tag ${c.status.toLowerCase().replace(' ', '-')}`}
                  onClick={() => alternarStatus(c.id)}
                  style={{cursor: 'pointer'}}
                >
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