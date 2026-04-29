const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config(); 

const app = express();
const SECRET = process.env.JWT_SECRET || "minha-chave-secreta";

app.use(cors());
app.use(express.json());

// ✅ conexão Mongo corrigida
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log("Erro Mongo:", err));

// ✅ Schema
const ClienteSchema = new mongoose.Schema({
  nome: String
});

const Cliente = mongoose.model("Cliente", ClienteSchema);

// ✅ LOGIN
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "pnunesnatalino@gmail.com" && password === "122456") {
    const token = jwt.sign(
      { user: email },
      SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token });
  }

  return res.status(401).json({ message: "Login inválido" });
});

// ✅ middleware JWT
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

// ✅ rotas
app.get("/clientes", autenticarToken, async (req, res) => {
  const clientes = await Cliente.find();
  res.json(clientes);
});

app.post("/clientes", autenticarToken, async (req, res) => {
  const novo = new Cliente({ nome: req.body.nome });
  await novo.save();
  res.json(novo);
});

app.delete("/clientes/:id", autenticarToken, async (req, res) => {
  await Cliente.findByIdAndDelete(req.params.id);
  res.send("ok");
});

// ✅ porta correta (Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});