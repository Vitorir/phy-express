require('dotenv').config

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg'); // Importa o Pool do pacote pg

const cors = require('cors');
const app = express();
const port = 3000;

const prisma = new PrismaClient();
const secretKey = process.env.SECRET_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Pool do PostgreSQL
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port:process.env.PG_PORT,
});

// Middleware para verificar token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};


// Endpoint para login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const profissional = await prisma.profissional.findUnique({
        where: { email },
      });
  
      if (!profissional || !bcrypt.compareSync(password, profissional.password)) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
  
      const token = jwt.sign({ id: profissional.id, email: profissional.email }, secretKey, { expiresIn: '1h' });
  
      res.json({
        token,
        id: profissional.id,
        name: profissional.nome,
        email: profissional.email,
        specialty: profissional.especialidade
      });

    } catch (error) {
      console.error('Erro ao processar o login:', error);
      res.status(500).json({ message: 'Erro ao processar o login' });
    }
  });

// Endpoint para obter todos os pacientes
app.get('/patients', async (req, res) => {
  try {
    const pacientes = await prisma.cliente.findMany();
    res.json(pacientes);
  } catch (error) {
    console.error('Erro ao obter pacientes:', error);
    res.status(500).json({ message: 'Erro ao obter pacientes' });
  }
});


// Endpoint para obter um paciente por ID
app.get('/patients/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const paciente = await prisma.cliente.findUnique({
        where: { id },
      });
      if (!paciente) {
        return res.status(404).json({ message: 'Paciente não encontrado' });
      }
      res.json(paciente);
    } catch (error) {
      console.error('Erro ao obter paciente:', error);
      res.status(500).json({ message: 'Erro ao obter paciente' });
    }
  });
  

// Endpoint para cadastrar um novo paciente
app.post('/patients', authenticateToken, async (req, res) => {
    const { nome, email, password, birthdate, gender, role, objectives, observations, injuries, diabetes_indicator, smoking_indicator, joint_problem_indicator, loss_of_consciousness_indicator, chest_pain_indicator } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const paciente = await prisma.cliente.create({
        data: {
          nome,
          email,
          password: hashedPassword,
          birthdate: new Date(birthdate),
          gender,
          role,
          objectives,
          observations,
          injuries,
          diabetes_indicator,
          smoking_indicator,
          joint_problem_indicator,
          loss_of_consciousness_indicator,
          chest_pain_indicator,
        },
      });
      res.status(201).json(paciente);
    } catch (error) {
      console.error('Erro ao cadastrar paciente:', error);
      res.status(500).json({ message: 'Erro ao cadastrar paciente' });
    }
});

// Endpoint para Enviar uma Solicitação
app.post('/requests', authenticateToken, async (req, res) => {
    const { idCliente, idProfissional } = req.body;
    try {
      const existingRequest = await prisma.contrato.findFirst({
        where: {
          idCliente,
          idProfissional,
          status: 'pending'
        }
      });
  
      if (existingRequest) {
        return res.status(400).json({ message: 'Solicitação já enviada' });
      }
  
      const newRequest = await prisma.contrato.create({
        data: {
          idCliente,
          idProfissional,
          data_inicio: new Date(),
          status: 'pending'
        }
      });
  
      res.status(201).json(newRequest);
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
      res.status(500).json({ message: 'Erro ao processar a solicitação' });
    }
});

// Endpoint para Aceitar uma Solicitação
app.patch('/requests/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      const request = await prisma.contrato.update({
        where: { id },
        data: { status: 'accepted' }
      });
  
      await prisma.cliente.update({
        where: { id: request.idCliente },
        data: { profissionalId: request.idProfissional }
      });
  
      res.json({ message: 'Solicitação aceita' });
    } catch (error) {
      console.error('Erro ao processar a solicitação:', error);
      res.status(500).json({ message: 'Erro ao processar a solicitação' });
    }
});

// Endpoint para Obter Todas as Solicitações
app.get('/requests', authenticateToken, async (req, res) => {
    try {
      const requests = await prisma.contrato.findMany();
      res.json(requests);
    } catch (error) {
      console.error('Erro ao obter solicitações:', error);
      res.status(500).json({ message: 'Erro ao obter solicitações' });
    }
});

// Endpoint para Cadastrar um Novo Profissional
app.post('/professionals', async (req, res) => {
  const { nome, email, password, especialidade } = req.body;

  try {
    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10); // 10 é o número de rounds

    // Cria o novo profissional no banco de dados
    const newProfessional = await prisma.profissional.create({
      data: {
        nome,
        email,
        password: hashedPassword,
        especialidade,
      },
    });

    res.status(201).json(newProfessional);
  } catch (error) {
    console.error('Erro ao cadastrar profissional:', error);
    res.status(500).json({ message: 'Erro ao cadastrar profissional' });
  }
});

// Endpoint para obter todos os profissionais
// Endpoint para obter todos os profissionais
app.get('/professionals', async (req, res) => {
    try {
      const professionals = await prisma.profissional.findMany();
      res.json(professionals);
    } catch (error) {
      console.error('Erro ao obter profissionais:', error);
      res.status(500).json({ message: 'Erro ao obter profissionais' });
    }
});
  

// Endpoint para criar uma nova ficha de perimetria
app.post('/fichasPerimetria', async (req, res) => {
  const { chest, rightArm, leftArm, rightForearm, leftForearm, abdomen, waist, hips, rightThigh, leftThigh, rightCalf, leftCalf, weight, clientId } = req.body;
  try {
    const novaFicha = await prisma.fichaPerimetria.create({
      data: {
        id: uuidv4(),
        chest,
        rightArm,
        leftArm,
        rightForearm,
        leftForearm,
        abdomen,
        waist,
        hips,
        rightThigh,
        leftThigh,
        rightCalf,
        leftCalf,
        weight,
        clientId
      },
    });
    res.status(201).json(novaFicha);
  } catch (error) {
    console.error('Erro ao criar ficha de perimetria:', error);
    res.status(500).json({ message: 'Erro ao criar ficha de perimetria' });
  }
});

// Endpoint para obter todas as fichas de perimetria
app.get('/fichasPerimetria', async (req, res) => {
  try {
    const fichas = await prisma.fichaPerimetria.findMany();
    res.json(fichas);
  } catch (error) {
    console.error('Erro ao obter fichas de perimetria:', error);
    res.status(500).json({ message: 'Erro ao obter fichas de perimetria' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
