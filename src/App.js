import React, { useState, useEffect } from 'react';
import './App.css';

const CASOS_CLINICOS = {
  crianca: { nome: "Enzo, 8 anos", descricao: "Pediátrico - Refluxo Vesicoureteral", risco: "Médio" },
  homem: { nome: "Sr. João, 55 anos", descricao: "Adulto - Cálculo Renal Coraliforme", risco: "Alto" },
  mulher: { nome: "Dra. Helena, 42 anos", descricao: "Adulto - Nefrectomia Parcial (Doadora)", risco: "Baixo" }
};
import React, { useState } from 'react';

function PortalMedico() {
  const [passo, setPasso] = useState(1);
  const [dadosMedico, setDadosMedico] = useState({ crm: '', email: '', procedimento: '', lado: '', paciente: '' });

  const proximo = () => setPasso(passo + 1);

  return (
    <div className="portal-medico">
      {/* PASSO 1: IDENTIFICAÇÃO */}
      {passo === 1 && (
        <div className="card-portal">
          <h2>🏥 Acesso Restrito: Médico</h2>
          <input type="text" placeholder="CRM (Ex: 123456-SP)" onChange={e => setDadosMedico({...dadosMedico, crm: e.target.value})} />
          <input type="email" placeholder="E-mail para Feedback" onChange={e => setDadosMedico({...dadosMedico, email: e.target.value})} />
          <button className="btn-portal" onClick={proximo}>Entrar no Sistema</button>
        </div>
      )}

      {/* PASSO 2: ESCOLHA DO CASO */}
      {passo === 2 && (
        <div className="card-portal">
          <h2>Selecione o Paciente</h2>
          <div className="selecao-pacientes">
            <button onClick={() => { setDadosMedico({...dadosMedico, paciente: 'Criança'}); proximo(); }}>👶 Criança</button>
            <button onClick={() => { setDadosMedico({...dadosMedico, paciente: 'Homem'}); proximo(); }}>👨 Homem</button>
            <button onClick={() => { setDadosMedico({...dadosMedico, paciente: 'Mulher'}); proximo(); }}>👩 Mulher</button>
          </div>
        </div>
      )}

      {/* PASSO 3: CONFIGURAÇÃO CIRÚRGICA */}
      {passo === 3 && (
        <div className="card-portal">
          <h2>Configurar Cirurgia: {dadosMedico.paciente}</h2>
          <select onChange={e => setDadosMedico({...dadosMedico, procedimento: e.target.value})}>
            <option>Procedimento...</option>
            <option>Nefrectomia</option>
            <option>Transplante Renal</option>
            <option>Ureteroscopia</option>
          </select>
          <div className="lado-botoes">
            <button onClick={() => setDadosMedico({...dadosMedico, lado: 'Direito'})}>Direito</button>
            <button onClick={() => setDadosMedico({...dadosMedico, lado: 'Esquerdo'})}>Esquerdo</button>
            <button onClick={() => setDadosMedico({...dadosMedico, lado: 'Bilateral'})}>Bilateral</button>
          </div>
          <p>Lado Selecionado: <strong>{dadosMedico.lado}</strong></p>
          <button className="btn-portal" onClick={proximo}>Verificar Checklist</button>
        </div>
      )}
    </div>
  );
}

function App() {
  // --- ESTADOS ---
  const [cirurgias, setCirurgias] = useState([]);
  const [paciente, setPaciente] = useState('');
  const [procedimento, setProcedimento] = useState('Nefrectomia');
  const [rim, setRim] = useState('Direito');
  
  // Novos estados para o Checklist
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [respostas, setRespostas] = useState({
    hemograma: '',
    coagulograma: '',
    funcaoRenal: '',
    eletrolitos: '',
    tomografiaAbdome: '',
    avaliacaoAnestesica: '',
    ladoOperado: 'Direito',
    jejumConfirmado: false,
    termoConsentimento: false,
    riscoCirurgico: ''
  });

  // --- 1. CARREGAR DADOS (GET) ---
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

  // --- 2. SALVAR CIRURGIA (POST) ---
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

    const novaCirurgia = { paciente: nomeMaiusculo, procedimento, rim, status: "Agendado" };

    try {
      const resposta = await fetch("http://localhost:8081/api/cirurgias", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaCirurgia)
      });

      if (resposta.ok) {
        const salva = await resposta.json();
        setCirurgias([salva, ...cirurgias]);
        setPaciente('');
      }
    } catch (erro) {
      const fallback = { ...novaCirurgia, id: Date.now() };
      setCirurgias([fallback, ...cirurgias]);
      setPaciente('');
    }
  };

  // --- 3. SALVAR CHECKLIST NO JAVA ---
  const salvarChecklistNoJava = async () => {
    const dadosParaEnviar = {
      ...respostas,
      cirurgia: { id: pacienteSelecionado.id }
    };

    try {
      const res = await fetch("http://localhost:8081/api/checklists", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnviar)
      });

      if (res.ok) {
        alert("✅ Checklist salvo com sucesso no banco de dados!");
        setPacienteSelecionado(null);
      }
    } catch (error) {
      alert("❌ Erro ao conectar com o servidor.");
    }
  };

  // --- OUTRAS FUNÇÕES ---
  const excluirCirurgia = (id) => {
    const listaFiltrada = cirurgias.filter(c => c.id !== id);
    setCirurgias(listaFiltrada);
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

        {/* LISTA DE CARDS */}
        <div className="lista-cirurgias">
          <h2>Mapa Cirúrgico Atual</h2>
          {cirurgias.map(c => (
            <div key={c.id || Math.random()} className="card">
              <div className="info">
                <h3 style={{textTransform: 'uppercase'}}>{c.procedimento}</h3>
                <p>Paciente: <strong>{c.paciente}</strong> | Lado: {c.rim}</p>
              </div>
              <div className="acoes">
                <button className="btn-checklist" onClick={() => setPacienteSelecionado(c)}>📋 Checklist</button>
                <span 
                  className={`status-tag ${c.status.toLowerCase().replace(' ', '-')}`}
                  onClick={() => alternarStatus(c.id)}
                >
                  {c.status}
                </span>
                <button className="btn-excluir" onClick={() => excluirCirurgia(c.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DO CHECKLIST (APARECE SÓ QUANDO SELECIONADO) */}
        {pacienteSelecionado && (
          <div className="modal-sobreposicao">
            <div className="modal-conteudo">
              <h2>📋 Checklist: {pacienteSelecionado.paciente}</h2>
              <div className="formulario-scroll">
                <fieldset>
                  <legend>🩸 Laboratório</legend>
                  <input type="text" placeholder="Hemograma" onChange={(e) => setRespostas({...respostas, hemograma: e.target.value})} />
                  <input type="text" placeholder="Função Renal" onChange={(e) => setRespostas({...respostas, funcaoRenal: e.target.value})} />
                </fieldset>
                <fieldset>
                  <legend>🛡️ Segurança</legend>
                  <label><input type="checkbox" onChange={(e) => setRespostas({...respostas, jejumConfirmado: e.target.checked})} /> Jejum?</label>
                  <label><input type="checkbox" onChange={(e) => setRespostas({...respostas, termoConsentimento: e.target.checked})} /> Termo Assinado?</label>
                </fieldset>
              </div>
              <div className="botoes-modal">
                <button className="btn-salvar" onClick={salvarChecklistNoJava}>Salvar</button>
                <button className="btn-cancelar" onClick={() => setPacienteSelecionado(null)}>Sair</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;