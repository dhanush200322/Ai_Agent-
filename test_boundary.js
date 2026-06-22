const fs = require('fs');

async function testUpload() {
  try {
    fs.writeFileSync('sample.txt', 'Hello World!');

    const formData = new FormData();
    const blob = new Blob([fs.readFileSync('sample.txt')], { type: 'text/plain' });
    formData.append('file', blob, 'sample.txt');

    const response = await fetch(
      'http://localhost:3003/test/123',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data' // Manual override without boundary
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
