const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
  registrarUsuario,
  loginUsuario,
  actualizarPerfil,
  cambiarContrasena,
} = require("../controllers/usuarios.controller");

// Consultar lista de usuarios desde MySQL
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al obtener usuarios" });
  }
});

// Rutas de autenticación
router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);

// Actualizar los datos del perfil de un usuario
router.put("/:id", actualizarPerfil);

// Ruta para cambiar la contraseña de un usuario.
router.put("/:id/change-password", cambiarContrasena);

module.exports = router;
