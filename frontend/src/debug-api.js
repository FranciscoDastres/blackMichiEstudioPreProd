// Debug file - verificar configuración de API
console.log('=== DEBUG API CONFIGURATION ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VITE_API_BASE_URL env var:', import.meta.env.VITE_API_BASE_URL);
console.log('import.meta.env.MODE:', import.meta.env.MODE);

// Simular lo que hace api.js
const baseURL = import.meta.env.VITE_API_BASE_URL;
const finalBaseURL = baseURL || "http://localhost:3000";
const finalURL = finalBaseURL.endsWith('/api') ? finalBaseURL : `${finalBaseURL}/api`;

console.log('baseURL:', baseURL);
console.log('finalBaseURL:', finalBaseURL);
console.log('finalURL:', finalURL);
console.log('Expected backend requests will go to:', finalURL);
console.log('Example: /admin/pedidos → ' + finalURL + '/admin/pedidos');
console.log('==============================');
