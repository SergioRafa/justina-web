import React, { useState, useEffect } from 'react';
import './App.css';

const CASOS_CLINICOS = {
  crianca: { nome: "Enzo, 8 anos", icone: "👶", descricao: "Pediátrico - Refluxo", risco: "Médio" },
  homem: { nome: "Sr. João, 55 anos", icone: "👨", descricao: "Adulto - Cálculo Renal", risco: "Alto" },
  mulher: { nome: "Dra. Helena, 42 anos", icone: "👩", descricao: "Adulto - Nefrectomia", risco: "Baixo" }
};



function App() {
  // --- ESTADOS GERAIS ---
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('mapa');
  const [cirurgias, setCirurgias] = useState([]);
  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [passoMedico, setPassoMedico] = useState(1);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  // --- ESTADOS DO SIMULADOR (DADOS DO MÉDICO) ---
  const [dadosSimulacao, setDadosSimulacao] = useState({ 
    crm: '', email: '', paciente: '', procedimento: '', lado: '' 
  });

  // --- O QUESTIONÁRIO QUE VOCÊ CRIOU ---
  const [respostas, setRespostas] = useState({
    hemograma: '', coagulograma: '', funcaoRenal: '', eletrolitos: '',
    tomografiaAbdome: '', avaliacaoAnestesica: '', ladoOperado: 'Direito',
    jejumConfirmado: false, termoConsentimento: false, riscoCirurgico: ''
  });

  // Filtro de Busca (Protegido contra erro de carregamento)
  const cirurgiasFiltradas = (cirurgias || []).filter(c => 
    c.paciente?.toLowerCase().includes(busca.toLowerCase()) ||
    c.procedimento?.toLowerCase().includes(busca.toLowerCase())
  );

  // Carregar dados (useEffect) - Mantendo sua lógica de LocalStorage
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const resposta = await fetch("http://localhost:8081/api/cirurgias");
        if (resposta.ok) {
          const dados = await resposta.json();
          setCirurgias(dados);
        }
      } catch (erro) {
        const salvos = localStorage.getItem('justina_cirurgias');
        if (salvos) setCirurgias(JSON.parse(salvos));
      }
    };
    carregarDados();
  }, []);

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
        {abaAtiva === 'mapa' && (
          <div className="secao-mapa">
             {/* Barra de Busca que adicionamos ontem */}
             <input 
               className="input-busca" 
               placeholder="🔍 BUSCAR PACIENTE..." 
               onChange={(e) => setBusca(e.target.value)} 
             />
             <div className="lista-cirurgias">
               {cirurgiasFiltradas.map(c => (
                 <div key={c.id} className="card">
                   <h3>{c.procedimento}</h3>
                   <p>{c.paciente}</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {abaAtiva === 'medico' && (
          <div className="secao-medico">
            {/* PASSO 1: LOGIN */}
            {passoMedico === 1 && (
              <div className="card-portal">
                <h2>🩺 Acesso Médico</h2>
                <input type="text" placeholder="CRM" onChange={e => setDadosSimulacao({...dadosSimulacao, crm: e.target.value})} />
                <button onClick={() => setPassoMedico(2)}>Próximo</button>
              </div>
            )}

            {/* PASSO 2: ESCOLHA DO PACIENTE (CARDS) */}
            {passoMedico === 2 && (
              <div className="card-portal">
                <h2>Escolha o Paciente</h2>
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
              </div>
            )}

            {/* PASSO 3: O SEU QUESTIONÁRIO TÉCNICO */}
            {passoMedico === 3 && (
              <div className="card-portal">
                <h2>📋 Checklist Técnico: {dadosSimulacao.paciente}</h2>
                <div className="formulario-scroll">
                  <fieldset>
                    <legend>Exames</legend>
                    <input type="text" placeholder="Hemograma" value={respostas.hemograma} onChange={e => setRespostas({...respostas, hemograma: e.target.value})} />
                    <input type="text" placeholder="Função Renal" value={respostas.funcaoRenal} onChange={e => setRespostas({...respostas, funcaoRenal: e.target.value})} />
                  </fieldset>
                  <fieldset>
                    <legend>Lateralidade</legend>
                    <select value={respostas.ladoOperado} onChange={e => setRespostas({...respostas, ladoOperado: e.target.value})}>
                      <option value="Direito">Direito</option>
                      <option value="Esquerdo">Esquerdo</option>
                      <option value="Bilateral">Bilateral</option>
                    </select>
                  </fieldset>
                </div>
                <div className="botoes-navegacao">
                  <button onClick={() => setPassoMedico(2)}>Voltar</button>
                  <button onClick={() => {
                    setDadosSimulacao({...dadosSimulacao, lado: respostas.ladoOperado});
                    setPassoMedico(4);
                  }}>Ver Resultado</button>
                </div>
              </div>
            )}

            {/* PASSO 4: FEEDBACK */}
            {passoMedico === 4 && (
              <div className="card-portal">
                <h2>Resumo da Simulação</h2>
                <p>Paciente: {dadosSimulacao.paciente}</p>
                <p>Lado: {dadosSimulacao.lado}</p>
                <p>Hemograma: {respostas.hemograma}</p>
                <button onClick={() => setPassoMedico(1)}>Reiniciar</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


export default App;