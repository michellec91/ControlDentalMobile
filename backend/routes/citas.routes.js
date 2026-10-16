const express = require("express");
const router = express.Router();

const {
  obtenerCitas,
  crearCita,
  actualizarCita,
  cancelarCita,
} = require("../controllers/citas.controller");

// Definición de las rutas del CRUD de Citas
router.get("/", obtenerCitas);
router.post("/", crearCita);
router.put("/:id", actualizarCita);
router.delete("/:id", cancelarCita);

module.exports = router;
