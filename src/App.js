import React, { useState, useEffect } from 'react';
import './App.css';

// 1. DADOS DOS CASOS CLÍNICOS (FORA DAS FUNÇÕES)
const CASOS_CLINICOS = {
  crianca: { nome: "Enzo, 8 anos", icone: "👶", descricao: "Pediátrico - Refluxo", risco: "Médio" },
  homem: { nome: "Sr. João, 55 anos", icone: "👨", descricao: "Adulto - Cálculo Renal", risco: "Alto" },
  mulher: { nome: "Dra. Helena, 42 anos", icone: "👩", descricao: "Adulto - Nefrectomia", risco: "Baixo" }
};

function App() {
  // --- ESTADOS GERAIS ---
  const [abaAtiva, setAbaAtiva] = useState('mapa'); // 'mapa' ou 'medico'
  const [cirurgias, setCirurgias] = useState([]);
  
  // Estados do Agendamento
  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [rim, setRim] = useState('Direito');

  // Estados do Portal do Médico
  const [passoMedico, setPassoMedico] = useState(1);
  const [dadosSimulacao, setDadosSimulacao] = useState({ crm: '', email: '', paciente: '', procedimento: '', lado: '' });

  // Estados do Checklist (Mapa Cirúrgico)
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({
    hemograma: '', funcaoRenal: '', jejumConfirmado: false, termoConsentimento: false
  });

  // --- CARREGAR DADOS DO JAVA ---
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resposta = await fetch("http://localhost:8081/api/cirurgias");
        if (resposta.ok) {
          const dados = await resposta.json();
          setCirurgias(dados);
        }
      } catch (erro) {
        console.error("Servidor Offline. Usando modo demonstração.");
      }
    };
    carregarDados();
  }, []);

  // --- FUNÇÕES DO MAPA ---
  const agendarCirurgia = (e) => {
    e.preventDefault();
    const nova = { id: Date.now(), paciente: paciente.toUpperCase(), procedimento, rim, status: "Agendado" };
    setCirurgias([nova, ...cirurgias]);
    setPaciente('');
  };

  const alternarStatus = (id) => {
    const novosStatus = { "Agendado": "Em Sala", "Em Sala": "Concluído", "Concluído": "Agendado" };
    setCirurgias(cirurgias.map(c => c.id === id ? { ...c, status: novosStatus[c.status] } : c));
  };

  // --- RENDERIZAÇÃO ---
  return (
    <div className="App">
      <header className="hospital-header">
        <h1>🏥 Justina Renal</h1>
        <div className="menu-navegacao">
          <button onClick={() => setAbaAtiva('mapa')} className={abaAtiva === 'mapa' ? 'active' : ''}>Mapa Cirúrgico</button>
          <button onClick={() => setAbaAtiva('medico')} className={abaAtiva === 'medico' ? 'active' : ''}>Portal do Médico</button>
        </div>
      </header>

      <main className="container">
        
        {/* CONTEÚDO 1: MAPA CIRÚRGICO */}
        {abaAtiva === 'mapa' && (
          <div className="secao-mapa">
            <form className="agendamento-form" onSubmit={agendarCirurgia}>
              <h3>Novo Agendamento</h3>
              <div className="form-row">
                <input type="text" placeholder="PACIENTE" value={paciente} onChange={(e) => setPaciente(e.target.value)} />
                <select value={procedimento} onChange={(e) => setProcedimento(e.target.value)}>
                  <option>Nefrectomia</option>
                  <option>Transplante Renal</option>
                </select>
                <button type="submit">Agendar</button>
              </div>
            </form>

            <div className="lista-cirurgias">
              {cirurgias.map(c => (
                <div key={c.id} className="card">
                  <div className="info">
                    <h3>{c.procedimento}</h3>
                    <p>{c.paciente} | <strong>{c.rim}</strong></p>
                  </div>
                  <div className="acoes">
                    <button className="btn-checklist" onClick={() => setPacienteSelecionado(c)}>📋 Checklist</button>
                    <span className={`status-tag ${c.status.toLowerCase().replace(' ', '-')}`} onClick={() => alternarStatus(c.id)}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTEÚDO 2: PORTAL DO MÉDICO (O SEU NOVO SIMULADOR) */}
        {abaAtiva === 'medico' && (
          <div className="secao-medico">
            {passoMedico === 1 && (
              <div className="card-portal">
                <h2>🩺 Identificação do Especialista</h2>
                <input type="text" placeholder="CRM" onChange={e => setDadosSimulacao({...dadosSimulacao, crm: e.target.value})} />
                <input type="email" placeholder="E-mail" onChange={e => setDadosSimulacao({...dadosSimulacao, email: e.target.value})} />
                <button onClick={() => setPassoMedico(2)}>Entrar</button>
              </div>
            )}

            {passoMedico === 2 && (
              <div className="card-portal">
                <h2>Selecione o Paciente</h2>
                <div className="grade-pacientes">
                  {Object.keys(CASOS_CLINICOS).map(chave => (
                    <button key={chave} className="card-paciente" onClick={() => { 
                      setDadosSimulacao({...dadosSimulacao, paciente: CASOS_CLINICOS[chave].nome});
                      setPassoMedico(3);
                    }}>
                      <span className="icone-grande">{CASOS_CLINICOS[chave].icone}</span>
                      <strong>{CASOS_CLINICOS[chave].nome}</strong>
                      <small>{CASOS_CLINICOS[chave].descricao}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {passoMedico === 3 && (
              <div className="card-portal">
                <h2>Caso: {dadosSimulacao.paciente}</h2>
                <p>Escolha o Lado da Cirurgia:</p>
                <div className="lado-botoes">
                  <button onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Direito'})}>Direito</button>
                  <button onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Esquerdo'})}>Esquerdo</button>
                </div>
                <button className="btn-voltar" onClick={() => setPassoMedico(2)}>Voltar</button>
              </div>
            )}
          </div>
        )}

        {/* MODAL CHECKLIST (O MESMO DE ANTES) */}
        {pacienteSelecionado && (
          <div className="modal-sobreposicao">
            <div className="modal-conteudo">
              <h2>Checklist: {pacienteSelecionado.paciente}</h2>
              <button onClick={() => setPacienteSelecionado(null)}>Fechar</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;