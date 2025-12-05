import axios from 'axios';

const api = axios.create({
  // CERTIFIQUE-SE QUE NÃO TEM BARRA NO FINAL
 baseURL: 'http://wilhemina-unmatchable-edyth.ngrok-free.dev',
  timeout: 10000,
});

// --- O ESPIÃO (Interceptor) ---
// Isso vai mostrar no terminal do VS Code a URL exata antes de enviar
api.interceptors.request.use(request => {
  console.log('>>> ENVIANDO REQUISIÇÃO PARA:', request.url);
  console.log('>>> URL COMPLETA:', request.baseURL + request.url);
  return request;
});

export default api;