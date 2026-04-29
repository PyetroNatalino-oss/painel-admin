const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config(); 

const app = express();
const SECRET = process.env.JWT_SECRET || "minha-chave-secreta";

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://PyetroNatalino:%40Estarossa04@cluster0.je8c2ih.mongodb.net/painel")
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

const ClienteSchema = new mongoose.Schema({
  nome: String
});

const Cliente = mongoose.model("Cliente", ClienteSchema);


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

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta" + PORT);
});