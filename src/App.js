import React, { useState, useEffect } from 'react';
import './App.css';

const CASOS_CLINICOS = {
  crianca: { nome: "Enzo, 8 anos", icone: "👶", descricao: "Pediátrico - Refluxo", risco: "Médio" },
  homem: { nome: "Sr. João, 55 anos", icone: "👨", descricao: "Adulto - Cálculo Renal", risco: "Alto" },
  mulher: { nome: "Dra. Helena, 42 anos", icone: "👩", descricao: "Adulto - Nefrectomia", risco: "Baixo" }
};





function App() {
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('mapa');
  const [cirurgias, setCirurgias] = useState([]);
  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [passoMedico, setPassoMedico] = useState(1);
  const [dadosSimulacao, setDadosSimulacao] = useState({ crm: '', email: '', paciente: '', procedimento: '', lado: '' });
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const cirurgiasFiltradas = cirurgias.filter(c => 
  c.paciente.toLowerCase().includes(busca.toLowerCase()) ||
  c.procedimento.toLowerCase().includes(busca.toLowerCase())
);

  // --- CARREGAR DADOS ---
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resposta = await fetch("http://localhost:8081/api/cirurgias");
        if (resposta.ok) {
          const dados = await resposta.json();
          setCirurgias(dados);
        }
      } catch (erro) {
        console.error("Servidor Offline.");
      }
    };
    carregarDados();
  }, []);

  const agendarCirurgia = (e) => {
    e.preventDefault();
    const nova = { id: Date.now(), paciente: paciente.toUpperCase(), procedimento, rim: 'Direito', status: "Agendado" };
    setCirurgias([nova, ...cirurgias]);
    setPaciente('');
  };

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
        {/* ABA: MAPA CIRÚRGICO */}
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
                    <p>{c.paciente}</p>
                  </div>
                  <button className="btn-checklist" onClick={() => setPacienteSelecionado(c)}>📋 Checklist</button>
                </div>
              ))}
            </div>
          </div>
        )}

     {/* ABA: PORTAL DO MÉDICO */}
{abaAtiva === 'medico' && (
  <div className="secao-medico">
    {passoMedico === 1 && (
      <div className="card-portal">
        <h2>🩺 Identificação</h2>
        <input type="text" placeholder="CRM" onChange={e => setDadosSimulacao({...dadosSimulacao, crm: e.target.value})} />
        <input type="email" placeholder="E-mail" onChange={e => setDadosSimulacao({...dadosSimulacao, email: e.target.value})} />
        <button className="btn-portal" onClick={() => setPassoMedico(2)}>Entrar</button>
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
            </button>
          ))}
        </div>
        <button className="btn-voltar" style={{marginTop: '20px'}} onClick={() => setPassoMedico(1)}>⬅️ Sair</button>
      </div>
    )}

    {passoMedico === 3 && (
      <div className="card-portal">
        <h2>Configurar: {dadosSimulacao.paciente}</h2>
        <p>Escolha a Lateralidade:</p>
        
        <div className="lado-botoes">
          <button className={`btn-lado ${dadosSimulacao.lado === 'Direito' ? 'selecionado' : ''}`} onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Direito'})}>Direito</button>
          <button className={`btn-lado ${dadosSimulacao.lado === 'Esquerdo' ? 'selecionado' : ''}`} onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Esquerdo'})}>Esquerdo</button>
          <button className={`btn-lado ${dadosSimulacao.lado === 'Bilateral' ? 'selecionado' : ''}`} onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Bilateral'})}>Bilateral</button>
        </div>

        <div className="botoes-navegacao" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="btn-voltar" onClick={() => setPassoMedico(2)}>⬅️ Voltar</button>
          {dadosSimulacao.lado && (
            <button className="btn-proximo" onClick={() => setPassoMedico(4)}>Gerar Feedback ➡️</button>
          )}
        </div>
      </div>
    )}

    {passoMedico === 4 && (
      <div className="card-portal">
        <h2>📊 Resultado Final</h2>
        <div className="resultado-caixa">
          <p><strong>CRM:</strong> {dadosSimulacao.crm}</p>
          <p><strong>Paciente:</strong> {dadosSimulacao.paciente}</p>
          <p><strong>Lado:</strong> {dadosSimulacao.lado}</p>
          <div className="alerta-clinico">
            {dadosSimulacao.paciente.includes("Enzo") && <p>⚠️ Cuidado: Paciente Pediátrico! Ajustar dosagem de contraste.</p>}
            {dadosSimulacao.lado === "Bilateral" && <p>🚨 Risco: Cirurgia Bilateral detectada. Necessário equipe dupla.</p>}
            <p>✅ Protocolo de segurança Justina Renal validado.</p>
          </div>
        </div>
        <button className="btn-portal" style={{backgroundColor: '#3498db'}} onClick={() => { setPassoMedico(1); setDadosSimulacao({...dadosSimulacao, lado: ''}); }}>🔄 Nova Simulação</button>
      </div>
    )}
  </div>
)}
          

          {/* PASSO 3: CONFIGURAÇÃO CIRÚRGICA */}
{passoMedico === 3 && (
  <div className="card-portal">
    <h2>Configurar: {dadosSimulacao.paciente}</h2>
    
    <div className="lado-botoes">
      <button className="btn-lado" onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Direito'})}>Direito</button>
      <button className="btn-lado" onClick={() => setDadosSimulacao({...dadosSimulacao, lado: 'Esquerdo'})}>Esquerdo</button>
    </div>

    <div className="botoes-navegacao" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
      <button className="btn-voltar" onClick={() => setPassoMedico(2)}>
        ⬅️ Voltar
      </button>
      
      {dadosSimulacao.lado && (
        <button className="btn-proximo" onClick={() => setPassoMedico(4)}>
          Gerar Feedback ➡️
        </button>
      )}
    </div>
  </div>
)}

            {/* PASSO 4: FEEDBACK FINAL */}
            {passoMedico === 4 && (
              <div className="card-portal">
                <h2>📊 Resultado Final</h2>
                <div className="resultado-caixa">
                  <p><strong>CRM:</strong> {dadosSimulacao.crm}</p>
                  <p><strong>Paciente:</strong> {dadosSimulacao.paciente}</p>
                  <p><strong>Lado:</strong> {dadosSimulacao.lado}</p>
                  <div className="alerta-clinico">
                    {dadosSimulacao.paciente.includes("Enzo") && <p>⚠️ Cuidado: Paciente Pediátrico!</p>}
                    {dadosSimulacao.lado === "Bilateral" && <p>🚨 Risco: Cirurgia Bilateral!</p>}
                    <p>✅ Protocolo de segurança Justina Renal validado.</p>
                  </div>
                </div>
                <button onClick={() => setPassoMedico(1)}>Reiniciar</button>
              </div>
            )}
      
        
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