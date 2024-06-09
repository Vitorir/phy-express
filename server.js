const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = 3000;

const secretKey = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

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

app.get('/patients', (req, res) => {
  res.json(patients);
});
app.get('/professionals', (req, res) => {
  res.json(professionals);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
