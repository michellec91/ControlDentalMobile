
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const tratamientosRoutes = require("./routes/tratamientos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const citasRoutes = require("./routes/citas.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Permitir que la aplicación acceda a las fotos de perfil guardadas.
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Ruta para comprobar que la API funciona.
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Control Dental funcionando",
  });
});

// Rutas principales de la API.
app.use("/tratamientos", tratamientosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/citas", citasRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API ejecutándose en http://localhost:${PORT}`);
});
