-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "objectives" TEXT NOT NULL,
    "observations" TEXT NOT NULL,
    "injuries" TEXT NOT NULL,
    "diabetes_indicator" BOOLEAN NOT NULL,
    "smoking_indicator" BOOLEAN NOT NULL,
    "joint_problem_indicator" BOOLEAN NOT NULL,
    "loss_of_consciousness_indicator" BOOLEAN NOT NULL,
    "chest_pain_indicator" BOOLEAN NOT NULL,
    "profissionalId" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profissional" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,

    CONSTRAINT "Profissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" TEXT NOT NULL,
    "idCliente" TEXT NOT NULL,
    "idProfissional" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaTreino" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,
    "restricoes" TEXT NOT NULL,
    "dataCriacao" TIMESTAMP(3) NOT NULL,
    "idCliente" TEXT NOT NULL,
    "idProfissional" TEXT NOT NULL,

    CONSTRAINT "FichaTreino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "series" INTEGER NOT NULL,
    "repeticoes" INTEGER NOT NULL,
    "carga" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT NOT NULL,
    "idFichaTreino" TEXT NOT NULL,

    CONSTRAINT "Exercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FichaPerimetria" (
    "id" TEXT NOT NULL,
    "chest" DOUBLE PRECISION NOT NULL,
    "rightArm" DOUBLE PRECISION NOT NULL,
    "leftArm" DOUBLE PRECISION NOT NULL,
    "rightForearm" DOUBLE PRECISION NOT NULL,
    "leftForearm" DOUBLE PRECISION NOT NULL,
    "abdomen" DOUBLE PRECISION NOT NULL,
    "waist" DOUBLE PRECISION NOT NULL,
    "hips" DOUBLE PRECISION NOT NULL,
    "rightThigh" DOUBLE PRECISION NOT NULL,
    "leftThigh" DOUBLE PRECISION NOT NULL,
    "rightCalf" DOUBLE PRECISION NOT NULL,
    "leftCalf" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "idCliente" TEXT NOT NULL,

    CONSTRAINT "FichaPerimetria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profissional_email_key" ON "Profissional"("email");

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_idProfissional_fkey" FOREIGN KEY ("idProfissional") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaTreino" ADD CONSTRAINT "FichaTreino_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaTreino" ADD CONSTRAINT "FichaTreino_idProfissional_fkey" FOREIGN KEY ("idProfissional") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercicio" ADD CONSTRAINT "Exercicio_idFichaTreino_fkey" FOREIGN KEY ("idFichaTreino") REFERENCES "FichaTreino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FichaPerimetria" ADD CONSTRAINT "FichaPerimetria_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
