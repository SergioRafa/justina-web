🏥 Projeto Justina Renal - Checklist de Segurança Cirúrgica
Este projeto é uma aplicação React voltada para a segurança do paciente em procedimentos urológicos. Ele simula o fluxo de um médico cirurgião, desde o acesso por CRM até a validação de um checklist técnico baseado no protocolo da OMS.

🚀 Status Atual (Frontend)
Login: Acesso via CRM (Simulação).

Seleção de Casos: Integração com 3 perfis clínicos (Pediátrico, Adulto e Idoso).

Checklist Técnico: Formulário completo com 3 opções (Sim / Não / Nenhum) para exames laboratoriais, imagem e lateralidade.

Lógica de Alerta: Sistema inteligente que detecta automaticamente pacientes pediátricos (Enzo) e riscos de lateralidade (Bilateral).

Relatório Final: Geração de resumo estruturado com validação de status (Apto/Pendente).

🏗️ Arquitetura de Dados
Estrutura do Objeto de Respostas:

{
  hemograma: string,        // 'Sim' | 'Não' | 'Nenhum'
  coagulograma: string,
  funcaoRenal: string,
  eletrolitos: string,
  tomografiaAbdome: string,
  avaliacaoAnestesica: string,
  ladoOperado: string,      // 'Direito' | 'Esquerdo' | 'Bilateral'
  jejumConfirmado: boolean,
  termoConsentimento: boolean,
  riscoCirurgico: string    // Ex: 'ASA II'
}

🛠️ Guia de Integração para o Backend (Turma de Dev)
O próximo passo é tornar esses dados persistentes. Atualmente, o useEffect já tenta buscar dados de http://localhost:8081/api/cirurgias.

1. Requisitos do Backend
Tecnologia Sugerida: Node.js com Express ou Python com Flask/FastAPI.

Banco de Dados: MongoDB ou PostgreSQL.

2. Endpoints Necessários
GET /api/casos: Para carregar os dados de CASOS_CLINICOS dinamicamente.

POST /api/finalizar-checklist: Para salvar o relatório gerado no Passo 4.

GET /api/cirurgias: Para popular o "Mapa Cirúrgico" na tela inicial.

3. Exemplo de Payload para o POST:
Ao clicar em "Gerar Relatório", o backend deve receber:

{
  "crm_medico": "123456",
  "paciente": "Enzo, 8 anos",
  "data_atendimento": "2023-10-27T10:00:00Z",
  "checklists": { ...respostas },
  "apto_para_cirurgia": true
}

📋 Como Rodar o Projeto
Certifique-se de ter o Node.js instalado.

Na pasta do projeto, execute:
npm install
npm start
O projeto abrirá em http://localhost:3000.

🎯 Próximos Desafios para a Turma
Autenticação Real: Validar o CRM em uma API real.

Upload de Documentos: Permitir anexar a imagem da Tomografia ou o Termo assinado.

Exportação em PDF: Adicionar um botão no Passo 4 para baixar o relatório final.

