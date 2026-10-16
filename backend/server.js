require("dotenv").config();
const express = require("express");
const cors = require("cors");

const tratamientosRoutes = require("./routes/tratamientos.routes");
const usuariosRoutes = require("./routes/usuarios.routes");
const citasRoutes = require("./routes/citas.routes");

const app = express();

app.use(cors());
app.use(express.json());

// PRUEBA
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de Control Dental funcionando",
  });
});

// RUTAS
app.use("/tratamientos", tratamientosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/citas", citasRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API ejecutándose en http://localhost:${PORT}`);
});
