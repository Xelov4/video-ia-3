const http = require('http');

async function testAPI() {
  console.log('🧪 Test des API endpoints...\n');
  
  const baseURL = 'http://localhost:3000';
  
  const endpoints = [
    '/api/tools',
    '/api/categories',
    '/api/tools?limit=5',
    '/api/tools?category=ai-assistant&limit=3',
    '/api/tools?search=chat&limit=3'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Test: ${endpoint}`);
      
      const response = await makeRequest(`${baseURL}${endpoint}`);
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        console.log(`✅ Succès: ${data.length || data.count || 'N/A'} résultats`);
        
        if (data.length > 0 && data[0].name) {
          console.log(`   Exemple: ${data[0].name}`);
        }
      } else {
        console.log(`❌ Erreur: ${response.status}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎉 Tests terminés !');
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Attendre un peu que l'app démarre
setTimeout(() => {
  testAPI();
}, 3000); 