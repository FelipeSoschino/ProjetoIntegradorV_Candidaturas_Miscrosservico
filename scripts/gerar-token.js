// Gera um JWT de TESTE assinado com o JWT_SECRET do seu .env.
// Uso:  npm run token:teste            (tipo "candidato")
//       npm run token:teste recrutador
// Em produção quem emite o token é o microsserviço de usuários/login.
require('dotenv').config();
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  console.error('Defina JWT_SECRET no .env antes de gerar o token.');
  process.exit(1);
}

const tipo = process.argv[2] || 'candidato';
const token = jwt.sign({ sub: 1, tipo }, process.env.JWT_SECRET, {
  expiresIn: '1h',
});
console.log(token);
