const bcrypt = require('bcryptjs');
const hash = '$2b$10$wLDAGloBolbiuLoghyuhRO8urEtMT8iwPLXV9WYHuzXc97rNuA9gq';
bcrypt.compare('Admin123!', hash).then(console.log);
bcrypt.compare('Password123!', hash).then(console.log);
