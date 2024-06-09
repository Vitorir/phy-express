const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = 3000;

const secretKey = 'your-secret-key'; // Certifique-se de usar a mesma chave secreta para assinar e verificar tokens

// Middleware
app.use(cors());
app.use(express.json());

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

// Endpoint para login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const professional = professionals.find(pro => pro.email === email);

  if (!professional || !bcrypt.compareSync(password, professional.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: professional.id, email: professional.email }, secretKey, { expiresIn: '1h' });

  res.json({
    token,
    id: professional.id,
    name: professional.name,
    email: professional.email,
    specialty: professional.specialty
  });
});

app.get('/patients', authenticateToken, (req, res) => {
  res.json(patients);
});

app.get('/patients/:id', authenticateToken, (req, res) => {
  const patient = patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  res.json(patient);
});

app.get('/professionals', authenticateToken, (req, res) => {
  res.json(professionals);
});

app.get('/professionals/:id', authenticateToken, (req, res) => {
  const professional = professionals.find(pro => pro.id === req.params.id);
  if (!professional) {
    return res.status(404).json({ message: 'Professional not found' });
  }
  res.json(professional);
});

// Endpoint to get patients for the logged-in professional
app.get('/patients', authenticateToken, (req, res) => {
  // Retrieve patients from database where professionalId matches req.professionalId
  const patients = getPatientsForProfessional(req.professionalId);
  res.json(patients);
});

// Endpoint to get requests for the logged-in professional
app.get('/requests', authenticateToken, (req, res) => {
  // Retrieve requests from database where professionalId is null
  const requests = getRequests();
  res.json(requests);
});

const getPatientsForProfessional = (professionalId) => {
  return patients.filter(patient => patient.professionalId === professionalId)
};

const getRequests = (professionalId) => {
  return patients.filter(patient => patient.professionalId != professionalId)
};

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
