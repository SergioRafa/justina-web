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

  // --- O QUESTIONÁRIO TÉCNICO ---
  const [respostas, setRespostas] = useState({
    hemograma: '', coagulograma: '', funcaoRenal: '', eletrolitos: '',
    tomografiaAbdome: '', avaliacaoAnestesica: '', ladoOperado: 'Direito',
    jejumConfirmado: false, termoConsentimento: false, riscoCirurgico: ''
  });

  // Função para limpar tudo e voltar ao início
  const resetarSimulador = () => {
    setRespostas({
      hemograma: '', coagulograma: '', funcaoRenal: '', eletrolitos: '',
      tomografiaAbdome: '', avaliacaoAnestesica: '', ladoOperado: 'Direito',
      jejumConfirmado: false, termoConsentimento: false, riscoCirurgico: ''
    });
    setPassoMedico(1);
  };

  // Função para finalizar e salvar
  const finalizarAtendimento = () => {
    const novaCirurgia = {
      id: Date.now(),
      paciente: dadosSimulacao.paciente,
      procedimento: `Cirurgia Renal (${respostas.ladoOperado})`,
      detalhes: { ...respostas, crm: dadosSimulacao.crm }
    };

    const listaAtualizada = [...cirurgias, novaCirurgia];
    setCirurgias(listaAtualizada);
    localStorage.setItem('justina_cirurgias', JSON.stringify(listaAtualizada));
    
    // Opcional: Enviar para API se disponível
    // fetch("http://localhost:8081/api/cirurgias", { method: 'POST', body: JSON.stringify(novaCirurgia) });

    setPassoMedico(4);
  };

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
  const estiloFieldset = {
  marginBottom: '15px',
  padding: '15px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  background: '#f9f9f9'
};

const estiloLegend = {
  fontWeight: 'bold',
  color: '#2c3e50',
  padding: '0 10px'
};

const estiloGrade = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
  alignItems: 'center'
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
                <input 
                  type="text" 
                  placeholder="CRM (Ex: 123456)" 
                  value={dadosSimulacao.crm}
                  onChange={e => setDadosSimulacao({...dadosSimulacao, crm: e.target.value})} 
                />
                <button disabled={!dadosSimulacao.crm} onClick={() => setPassoMedico(2)}>Próximo</button>
                <button onClick={() => setPassoMedico(2)}>Próximo</button>
              </div>
            )}

            {/* PASSO 2: ESCOLHA DO PACIENTE */}
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

      {passoMedico === 3 && (
  <div className="card-portal">
    <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>
      📋 Checklist Técnico: {dadosSimulacao.paciente}
    </h2>
    
    <div className="formulario-scroll" style={{ textAlign: 'left', maxHeight: '450px', overflowY: 'auto', padding: '10px' }}>
      
      {/* SEÇÃO: EXAMES LABORATORIAIS */}
      <fieldset style={estiloFieldset}>
        <legend style={estiloLegend}>🔬 Laboratório e Sangue</legend>
        <div style={estiloGrade}>
          <label>Hemograma:</label>
          <select value={respostas.hemograma} onChange={e => setRespostas({...respostas, hemograma: e.target.value})}>
            <option value="">Selecionar...</option>
            <option value="Sim">Sim (Disponível/Normal)</option>
            <option value="Não">Não (Pendente/Alterado)</option>
            <option value="Nenhum">Nenhum (Não solicitado)</option>
          </select>

          <label>Coagulograma:</label>
          <select value={respostas.coagulograma} onChange={e => setRespostas({...respostas, coagulograma: e.target.value})}>
            <option value="">Selecionar...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Nenhum">Nenhum</option>
          </select>

          <label>Função Renal:</label>
          <select value={respostas.funcaoRenal} onChange={e => setRespostas({...respostas, funcaoRenal: e.target.value})}>
            <option value="">Selecionar...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Nenhum">Nenhum</option>
          </select>

          <label>Eletrólitos:</label>
          <select value={respostas.eletrolitos} onChange={e => setRespostas({...respostas, eletrolitos: e.target.value})}>
            <option value="">Selecionar...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Nenhum">Nenhum</option>
          </select>
        </div>
      </fieldset>

      {/* SEÇÃO: IMAGEM E ANESTESIA */}
      <fieldset style={estiloFieldset}>
        <legend style={estiloLegend}>📸 Imagem e Avaliação</legend>
        <div style={estiloGrade}>
          <label>Tomografia Abdome:</label>
          <select value={respostas.tomografiaAbdome} onChange={e => setRespostas({...respostas, tomografiaAbdome: e.target.value})}>
            <option value="">Selecionar...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Nenhum">Nenhum</option>
          </select>

          <label>Avaliação Anestésica:</label>
          <select value={respostas.avaliacaoAnestesica} onChange={e => setRespostas({...respostas, avaliacaoAnestesica: e.target.value})}>
            <option value="">Selecionar...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Nenhum">Nenhum</option>
          </select>
        </div>
      </fieldset>

      {/* SEÇÃO: SEGURANÇA DO PACIENTE */}
      <fieldset style={estiloFieldset}>
        <legend style={estiloLegend}>⚖️ Segurança e Protocolo</legend>
        <div style={estiloGrade}>
          <label>Lado Operado:</label>
          <select value={respostas.ladoOperado} onChange={e => setRespostas({...respostas, ladoOperado: e.target.value})}>
            <option value="Direito">Direito</option>
            <option value="Esquerdo">Esquerdo</option>
            <option value="Bilateral">Bilateral</option>
          </select>

          <label>Jejum Confirmado:</label>
          <select value={respostas.jejumConfirmado} onChange={e => setRespostas({...respostas, jejumConfirmado: e.target.value === 'true'})}>
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>

          <label>Termo Consentimento:</label>
          <select value={respostas.termoConsentimento} onChange={e => setRespostas({...respostas, termoConsentimento: e.target.value === 'true'})}>
            <option value="false">Não</option>
            <option value="true">Sim</option>
          </select>

          <label>Risco Cirúrgico:</label>
          <input 
            type="text" 
            placeholder="Ex: ASA II" 
            value={respostas.riscoCirurgico} 
            onChange={e => setRespostas({...respostas, riscoCirurgico: e.target.value})} 
          />
        </div>
      </fieldset>
    </div>

    <div className="botoes-navegacao" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
      <button className="btn-voltar" onClick={() => setPassoMedico(2)}>Voltar</button>
      <button className="btn-proximo" onClick={() => {
        setDadosSimulacao({...dadosSimulacao, lado: respostas.ladoOperado});
        finalizarAtendimento();
      }}>Gerar Relatório Final</button>
    </div>
  </div>
)}

{passoMedico === 4 && (
  <div className="card-portal">
    <h2 style={{ borderBottom: '2px solid #2c3e50', paddingBottom: '10px' }}>
      📊 Resumo do Checklist Cirúrgico
    </h2>
    
    <div className="relatorio-final" style={{ textAlign: 'left', padding: '15px', background: '#fff', borderRadius: '8px', marginTop: '15px', border: '1px solid #eee' }}>
      
      {/* ALERTAS CRÍTICOS (Aparecem apenas se a condição for real) */}
      <div style={{ marginBottom: '15px' }}>
        {dadosSimulacao.paciente.includes("Enzo") && (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', marginBottom: '5px', borderLeft: '5px solid #ffeeba' }}>
            ⚠️ <strong>ALERTA PEDIÁTRICO:</strong> Dosagens e materiais devem ser ajustados para peso/idade.
          </div>
        )}
        
        {respostas.ladoOperado === "Bilateral" && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', borderLeft: '5px solid #f5c6cb' }}>
            🚨 <strong>ALERTA DE LATERALIDADE:</strong> Cirurgia Bilateral confirmada. Dobrar atenção à marcação do sítio.
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <p><strong>CRM do Médico:</strong> {dadosSimulacao.crm}</p>
        <p><strong>Paciente:</strong> {dadosSimulacao.paciente}</p>
        <p><strong>Lado Operado:</strong> {respostas.ladoOperado}</p>
        <p><strong>Risco (ASA):</strong> {respostas.riscoCirurgico || 'Não informado'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#2980b9', margin: '0 0 10px 0' }}>🔬 Laboratório</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
            <li>Hemograma: <strong>{respostas.hemograma}</strong></li>
            <li>Coagulograma: <strong>{respostas.coagulograma}</strong></li>
            <li>Função Renal: <strong>{respostas.funcaoRenal}</strong></li>
            <li>Eletrólitos: <strong>{respostas.eletrolitos}</strong></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#2980b9', margin: '0 0 10px 0' }}>📸 Segurança</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px' }}>
            <li>Tomografia: <strong>{respostas.tomografiaAbdome}</strong></li>
            <li>Avaliação Anestésica: <strong>{respostas.avaliacaoAnestesica}</strong></li>
            <li>Jejum: <strong>{respostas.jejumConfirmado ? '✅ Confirmado' : '❌ Pendente'}</strong></li>
            <li>Termo: <strong>{respostas.termoConsentimento ? '✅ Assinado' : '❌ Pendente'}</strong></li>
          </ul>
        </div>
      </div>

      {/* CONCLUSÃO DO CHECKLIST */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: (respostas.jejumConfirmado && respostas.termoConsentimento) ? '#d4edda' : '#fff3cd',
        color: (respostas.jejumConfirmado && respostas.termoConsentimento) ? '#155724' : '#856404',
        borderRadius: '5px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {(respostas.jejumConfirmado && respostas.termoConsentimento) 
          ? '🟢 Paciente apto para o procedimento conforme protocolo.' 
          : '🟡 Pendências identificadas. Revisar antes da indução.'}
      </div>
    </div>

    <button className="btn-portal" onClick={resetarSimulador} style={{ marginTop: '20px', width: '100%', padding: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
      🔄 Iniciar Novo Atendimento
    </button>
  </div>
)}

          </div> /* Fecha secao-medico */
        )} {/* <--- ESTA CHAVE FECHA A ABA MÉDICA */}
      </main> {/* Fecha container */}
    </div> /* Fecha App */
  );
} // <--- FECHA A FUNÇÃO APP

export default App;
  