const jwt = require('jsonwebtoken');
const fs = require('fs');

const token = jwt.sign(
  { id: '123e4567-e89b-12d3-a456-426614174000', organizationId: '123e4567-e89b-12d3-a456-426614174001', role: 'admin' },
  'super-secret-access-key-replace-in-production',
  { expiresIn: '1h' }
);

async function testUpload() {
  try {
    fs.writeFileSync('sample.pdf', 'fake pdf content');

    const formData = new FormData();
    const blob = new Blob([fs.readFileSync('sample.pdf')], { type: 'application/pdf' });
    formData.append('file', blob, 'sample.pdf');

    const response = await fetch(
      'http://localhost:3000/api/v1/knowledge/123e4567-e89b-12d3-a456-426614174000/documents',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testUpload();
