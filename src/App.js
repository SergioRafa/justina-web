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
  const [passoMedico, setPassoMedico] = useState(1);

  // --- ESTADOS DO SIMULADOR (DADOS DO MÉDICO) ---
  const [dadosSimulacao, setDadosSimulacao] = useState({ 
    crm: '', email: '', paciente: '', procedimento: '', lado: '' 
  });

  // --- O QUESTIONÁRIO ---
  const [respostas, setRespostas] = useState({
    hemograma: '', coagulograma: '', funcaoRenal: '', eletrolitos: '',
    tomografiaAbdome: '', avaliacaoAnestesica: '', ladoOperado: 'Direito',
    jejumConfirmado: false, termoConsentimento: false, riscoCirurgico: ''
  });

  // Filtro de Busca
  const cirurgiasFiltradas = (cirurgias || []).filter(c => 
    c.paciente?.toLowerCase().includes(busca.toLowerCase()) ||
    c.procedimento?.toLowerCase().includes(busca.toLowerCase())
  );

  // Carregar dados
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
const resetarSimulacao = () => {
  // Limpa o questionário para o estado original
  setRespostas({
    hemograma: '', coagulograma: '', funcaoRenal: '', eletrolitos: '',
    tomografiaAbdome: '', avaliacaoAnestesica: '', ladoOperado: 'Direito',
    jejumConfirmado: false, termoConsentimento: false, riscoCirurgico: ''
  });
  // Volta para o primeiro passo
  setPassoMedico(1);
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
        {abaAtiva === 'mapa' && (
          <div className="secao-mapa">
             <input 
               className="input-busca" 
               placeholder="🔍 BUSCAR PACIENTE NO MAPA..." 
               onChange={(e) => setBusca(e.target.value)} 
             />
             <div className="lista-cirurgias">
               {cirurgiasFiltradas.map(c => (
                 <div key={c.id} className="card">
                   <div className="info">
                     <h3>{c.procedimento}</h3>
                     <p>{c.paciente}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {abaAtiva === 'medico' && (
          <div className="secao-medico">
            {passoMedico === 1 && (
              <div className="card-portal">
                <h2>🩺 Acesso Médico</h2>
                <input type="text" placeholder="CRM" onChange={e => setDadosSimulacao({...dadosSimulacao, crm: e.target.value})} />
                <button className="btn-portal" onClick={() => setPassoMedico(2)}>Próximo</button>
              </div>
            )}

          {/* PASSO 2: ESCOLHA DO PACIENTE */}
<div className="grade-pacientes">
  {Object.keys(CASOS_CLINICOS).map(chave => (
    <button key={chave} className="card-paciente" onClick={() => { 
      // 1. LIMPA O FORMULÁRIO ANTES DE TUDO
      setRespostas({
        hemograma: '', coagulograma: '', funcaoRenal: '', eletrolitos: '',
        tomografiaAbdome: '', avaliacaoAnestesica: '', ladoOperado: 'Direito',
        jejumConfirmado: false, termoConsentimento: false, riscoCirurgico: ''
      });
      // 2. DEFINE O NOVO PACIENTE
      setDadosSimulacao({...dadosSimulacao, paciente: CASOS_CLINICOS[chave].nome});
      // 3. AVANÇA O PASSO
      setPassoMedico(3);
    }}>
      <span className="icone-grande">{CASOS_CLINICOS[chave].icone}</span>
      <strong>{CASOS_CLINICOS[chave].nome}</strong>
    </button>
  ))}
</div>
 {passoMedico === 3 && (
  <div className="card-portal">
    {/* Título único que muda de cor: Laranja para Enzo (alerta pediátrico), azul escuro para os outros */}
    <h2 style={{ 
      color: dadosSimulacao.paciente.includes("Enzo") ? "#e67e22" : "#2c3e50",
      transition: "0.3s" 
    }}>
      📋 Checklist Técnico: {dadosSimulacao.paciente}
    </h2>
    
    <div className="formulario-scroll">
      
    </div>
  </div>
)}
    
    <div className="formulario-scroll" style={{ textAlign: 'left', maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
      
      <fieldset style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <legend style={{ fontWeight: 'bold', color: '#2c3e50' }}>🔬 Laboratório</legend>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input type="text" placeholder="Hemograma" value={respostas.hemograma} onChange={e => setRespostas({...respostas, hemograma: e.target.value})} />
          <input type="text" placeholder="Coagulograma" value={respostas.coagulograma} onChange={e => setRespostas({...respostas, coagulograma: e.target.value})} />
          <input type="text" placeholder="Função Renal (Creatinina)" value={respostas.funcaoRenal} onChange={e => setRespostas({...respostas, funcaoRenal: e.target.value})} />
          <input type="text" placeholder="Eletrólitos" value={respostas.eletrolitos} onChange={e => setRespostas({...respostas, eletrolitos: e.target.value})} />
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <legend style={{ fontWeight: 'bold', color: '#2c3e50' }}>📸 Imagem e Anestesia</legend>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input type="text" placeholder="Tomografia de Abdome" value={respostas.tomografiaAbdome} onChange={e => setRespostas({...respostas, tomografiaAbdome: e.target.value})} />
          <input type="text" placeholder="Avaliação Anestésica" value={respostas.avaliacaoAnestesica} onChange={e => setRespostas({...respostas, avaliacaoAnestesica: e.target.value})} />
        </div>
      </fieldset>

      <fieldset style={{ marginBottom: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <legend style={{ fontWeight: 'bold', color: '#2c3e50' }}>⚖️ Segurança e Lateralidade</legend>
        <div style={{ display: 'grid', gap: '10px' }}>
          <label>Lado a ser operado:</label>
          <select value={respostas.ladoOperado} onChange={e => setRespostas({...respostas, ladoOperado: e.target.value})}>
            <option value="Direito">Direito</option>
            <option value="Esquerdo">Esquerdo</option>
            <option value="Bilateral">Bilateral</option>
          </select>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={respostas.jejumConfirmado} onChange={e => setRespostas({...respostas, jejumConfirmado: e.target.checked})} />
            Jejum Confirmado?
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={respostas.termoConsentimento} onChange={e => setRespostas({...respostas, termoConsentimento: e.target.checked})} />
            Termo de Consentimento Assinado?
          </label>
        </div>
      </fieldset>
    </div>

    <div className="botoes-navegacao" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
      <button className="btn-voltar" onClick={() => setPassoMedico(2)}>⬅️ Voltar</button>
      <button className="btn-proximo" onClick={() => {
        setDadosSimulacao({...dadosSimulacao, lado: respostas.ladoOperado});
        setPassoMedico(4);
      }}>Gerar Relatório Final ➡️</button>
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
                    {dadosSimulacao.paciente.includes("Enzo") && <p>⚠️ Cuidado: Paciente Pediátrico!</p>}
                    {dadosSimulacao.lado === "Bilateral" && <p>🚨 Risco: Cirurgia Bilateral!</p>}
                    <p>✅ Checklist validado com sucesso.</p>
                  </div>
                </div>
              <button className="btn-portal" onClick={resetarSimulacao}>🔄 Iniciar Nova Simulação</button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;