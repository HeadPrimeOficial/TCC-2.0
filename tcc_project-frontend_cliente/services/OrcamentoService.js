// ATENÇÃO: Confirme se este IP (10.0.0.136) é o correto da sua máquina agora.
// Se estiver usando aquele outro, mude para: http://172.26.112.171:8080/api/orcamentos
const API_URL = 'http://wilhemina-unmatchable-edyth.ngrok-free.dev/api/orcamentos'; 

export const OrcamentoService = {
  
  // 1. Busca lista de orçamentos (Histórico)
  buscarHistorico: async (clienteId) => {
    try {
      const response = await fetch(`${API_URL}/historico/${clienteId}`);
      if (!response.ok) throw new Error('Erro ao buscar histórico');
      return await response.json();
    } catch (error) {
      console.error("Erro no OrcamentoService:", error);
      return [];
    }
  },

  // 2. Aceitar Orçamento (Botão ACEITAR)
  aceitarOrcamento: async (orcamentoId) => {
    try {
      const response = await fetch(`${API_URL}/aceitar/${orcamentoId}`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Erro ao aceitar');
      return await response.json();
    } catch (error) {
      console.error("Erro ao aceitar:", error);
      return null;
    }
  },

  // 3. Finalizar Orçamento (Botão FINALIZAR)
  finalizarOrcamento: async (orcamentoId) => {
    try {
      const response = await fetch(`${API_URL}/finalizar/${orcamentoId}`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Erro ao finalizar');
      return await response.json();
    } catch (error) {
      console.error("Erro ao finalizar:", error);
      return null;
    }
  },

  // --- NOVO MÉTODO (ADICIONAR AO CARRINHO) ---
  // Conecta com aquele endpoint novo que criamos no Java
  adicionarItem: async (clienteId, oficinaId, nomeServico, preco) => {
    try {
      // Monta a URL com os parâmetros
      // Ex: .../adicionar-item?clienteId=1&oficinaId=1&nomeServico=Pneu&preco=50.00
      const url = `${API_URL}/adicionar-item?clienteId=${clienteId}&oficinaId=${oficinaId}&nomeServico=${encodeURIComponent(nomeServico)}&preco=${preco}`;
      
      const response = await fetch(url, {
        method: 'POST' 
      });

      if (!response.ok) throw new Error('Erro ao adicionar item ao orçamento');
      return await response.json(); // Retorna o Orçamento atualizado
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      return null;
    }
  }

};