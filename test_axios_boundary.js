const axios = require('axios');
const FormData = require('form-data');

const form = new FormData();
form.append('test', '123');

const api = axios.create({
  baseURL: 'https://httpbin.org',
  headers: { 'Content-Type': 'application/json' }
});

api.post('/post', form)
  .then(res => console.log('Headers sent:', res.data.headers))
  .catch(err => console.error(err));
