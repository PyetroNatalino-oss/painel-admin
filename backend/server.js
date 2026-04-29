const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const SECRET = "minha-chave-secreta";

app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/painel")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

// Model
const ClienteSchema = new mongoose.Schema({
  nome: String
});

const Cliente = mongoose.model("Cliente", ClienteSchema);

// LOGIN
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "PyetroNatalino" && password === "122456") {
    const token = jwt.sign(
      { user: email },
      SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  }

  return res.status(401).json({ message: "Login inválido" });
});

// Middleware JWT
function autenticarToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

// GET clientes
app.get("/clientes", autenticarToken, async (req, res) => {
  const clientes = await Cliente.find();
  res.json(clientes);
});

// POST cliente
app.post("/clientes", autenticarToken, async (req, res) => {
  const novo = new Cliente({ nome: req.body.nome });
  await novo.save();
  res.json(novo);
});

// DELETE cliente
app.delete("/clientes/:id", autenticarToken, async (req, res) => {
  await Cliente.findByIdAndDelete(req.params.id);
  res.send("ok");
});

// Server
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});