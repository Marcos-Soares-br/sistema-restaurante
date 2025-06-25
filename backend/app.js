const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes.js');

const app = express();
dotenv.config();


app.use(cors());
app.use(express.json());

app.use('/', apiRoutes);

app.listen(process.env.PORT || 3806, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3806}`);
});