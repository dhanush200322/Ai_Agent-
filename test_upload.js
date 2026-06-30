const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    const login = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@cybercorp.com',
      password: 'password123'
    });
    const token = login.data.data.accessToken;

    const kbRes = await axios.post('http://localhost:5000/api/v1/knowledge', {
      name: 'Test Upload KB 2'
    }, { headers: { Authorization: `Bearer ${token}` } });
    
    const kbId = kbRes.data.data.id;
    console.log('Created KB:', kbId);

    fs.writeFileSync('test.pdf', 'Dummy PDF content');
    const form = new FormData();
    form.append('file', fs.createReadStream('test.pdf'));

    console.log('Uploading file...');
    const uploadRes = await axios.post(`http://localhost:5000/api/v1/knowledge/${kbId}/documents`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Upload success:', uploadRes.data);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testUpload();
