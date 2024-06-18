require('dotenv').config

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const app = express();
const port = 3000;

const { Pool } = require('pg'); // Importa o Pool do pacote pg
const fs = require('fs');

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

const professionals = [
  {
    id: uuidv4(),
    name: "Dr. Carlos Pereira",
    email: "drcarlos@example.com",
    password: bcrypt.hashSync("password123", 10), // Password hashed
    specialty: "Cardiologia"
  },
  {
    id: uuidv4(),
    name: "Dra. Ana Costa",
    email: "draana@example.com",
    password: bcrypt.hashSync("password456", 10), // Password hashed
    specialty: "Endocrinologia"
  }
];

const patients = [
  {
    id: uuidv4(),
    name: "João Silva",
    birthdate: "1990-01-01",
    gender: "masculino",
    email: "joaosilva@example.com",
    senha: "senhaSegura123",
    role: "Client",
    objectives: "Melhorar condição física",
    observations: "Preferência por atividades ao ar livre",
    injuries: "Nenhuma",
    diabetes_indicator: false,
    smoking_indicator: false,
    joint_problem_indicator: false,
    loss_of_consciousness_indicator: false,
    chest_pain_indicator: false,
    professionalId: professionals[0].id
  },
  {
    id: uuidv4(),
    name: "Maria Oliveira",
    birthdate: "1985-02-15",
    gender: "feminino",
    email: "mariaoliveira@example.com",
    senha: "senhaSegura456",
    role: "Client",
    objectives: "Aumentar resistência",
    observations: "Prefere exercícios indoor",
    injuries: "Lesão no joelho",
    diabetes_indicator: false,
    smoking_indicator: false,
    joint_problem_indicator: true,
    loss_of_consciousness_indicator: false,
    chest_pain_indicator: false,
    professionalId: professionals[1].id
  },
  {
    id: uuidv4(),
    name: "Paciente aleatório",
    birthdate: "1985-02-15",
    gender: "masculino",
    email: "pacientealeatorio@example.com",
    senha: "senhaSegura456",
    role: "Client",
    objectives: "Aumentar resistência",
    observations: "Prefere exercícios indoor",
    injuries: "Lesão no joelho",
    diabetes_indicator: false,
    smoking_indicator: false,
    joint_problem_indicator: true,
    loss_of_consciousness_indicator: false,
    chest_pain_indicator: false,
    professionalId: null
  },
  {
    id: uuidv4(),
    name: "Paciente solicitante",
    birthdate: "1985-02-15",
    gender: "feminino",
    email: "pacientesolicitante@example.com",
    senha: "senhaSegura456",
    role: "Client",
    objectives: "Aumentar resistência",
    observations: "Prefere exercícios indoor",
    injuries: "Lesão no joelho",
    diabetes_indicator: false,
    smoking_indicator: false,
    joint_problem_indicator: true,
    loss_of_consciousness_indicator: false,
    chest_pain_indicator: false,
    professionalId: null
  },
];

const requests = []


// Endpoint para enviar uma solicitação
app.post('/requests', authenticateToken, async (req, res) => {
  const { patientId, professionalId } = req.body;
  try {
    const requests = await readJSONFile('data/requests.json');
    const existingRequest = requests.find(req => req.patientId === patientId);
    if (existingRequest) {
      return res.status(400).json({ message: 'Solicitação já enviada' });
    }

    const newRequest = {
      id: uuidv4(),
      patientId,
      professionalId,
      status: 'pending'
    };

    requests.push(newRequest);
    await writeJSONFile('data/requests.json', requests);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
});

// Endpoint para aceitar uma solicitação
app.patch('/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const requests = await readJSONFile('data/requests.json');
    const request = requests.find(req => req.id === id);

    if (!request) {
      return res.status(404).json({ message: 'Solicitação não encontrada' });
    }

    const patients = await readJSONFile('data/patients.json');
    const patient = patients.find(p => p.id === request.patientId);
    if (patient) {
      patient.professionalId = req.user.id;
    }

    request.status = 'accepted';
    await writeJSONFile('data/requests.json', requests);
    await writeJSONFile('data/patients.json', patients);

    res.json({ message: 'Solicitação aceita' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao processar a solicitação' });
  }
});


// Endpoint para login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM professionals WHERE email = $1', [email]);
    const professional = result.rows[0];

    if (!professional || !bcrypt.compareSync(password, professional.password)) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: professional.id, email: professional.email }, secretKey, { expiresIn: '1h' });

    res.json({
      token,
      id: professional.id,
      name: professional.name,
      email: professional.email,
      specialty: professional.specialty
    });

  } catch (error) {
    console.error('Erro ao processar o login:', error);
    res.status(500).json({ message: 'Erro ao processar o login' });
  }
});

// Endpoint para obter todos os pacientes
app.get('/patients', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter pacientes:', error);
    res.status(500).json({ message: 'Erro ao obter pacientes' });
  }
});

// Endpoint para obter um paciente por ID
app.get('/patients/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter paciente:', error);
    res.status(500).json({ message: 'Erro ao obter paciente' });
  }
});

// Endpoint para cadastrar um novo paciente
app.post('/patients', authenticateToken, async (req, res) => {
  const { name, birthdate, gender, email, senha, role, objectives, observations, injuries, ...otherFields } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO patients(id, name, birthdate, gender, email, senha, role, objectives, observations, injuries, professionalId, diabetes_indicator, smoking_indicator, joint_problem_indicator, loss_of_consciousness_indicator, chest_pain_indicator, ...otherFields) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, ...$17) RETURNING *',
      [uuidv4(), name, birthdate, gender, email, hashedPassword, role, objectives, observations, injuries, null, false, false, false, false, false, ...Object.values(otherFields)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar paciente:', error);
    res.status(500).json({ message: 'Erro ao cadastrar paciente' });
  }
});

app.get('/professionals', authenticateToken, (req, res) => {
  res.json(professionals);
});

app.get('/professionals/:id', authenticateToken, (req, res) => {
  const professional = professionals.find(pro => pro.id === req.params.id);
  if (!professional) {
    return res.status(404).json({ message: 'Professional not found' });
  }
  console.error('Erro ao obter paciente:', error);
  res.json(professional);
});

// Endpoint to get requests for the logged-in professional
app.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await readJSONFile('data/requests.json');
    res.json(requests);
  } catch (error) {
    console.error('Erro ao obter solicitações:', error);
    res.status(500).json({ message: 'Erro ao obter solicitações' });
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

const getPatientsForProfessional = (professionalId) => {
  return patients.filter(patient => patient.professionalId === professionalId)
};

const getRequests = (professionalId) => {
  return patients.filter(patient => patient.professionalId != professionalId)
};

// Rota POST para cadastrar um novo usuário
app.post('/users', async (req, res) => {
  const { name, email, senha, gender } = req.body;
  try {
    const users = await readJSONFile('data/users.json');

    const newUser = {
      id: uuidv4(),
      name,
      email,
      senha: bcrypt.hashSync(senha, 10),
      gender
    };

    users.push(newUser);
    await writeJSONFile('data/users.json', users);

    res.json(newUser);
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
