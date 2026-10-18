
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Controladores de usuarios.
const {
  registrarUsuario,
  loginUsuario,
  actualizarPerfil,
  cambiarContrasena,
} = require("../controllers/usuarios.controller");

// Controlador para guardar la foto de perfil.
const {
  guardarFotoPerfil,
} = require("../controllers/fotoPerfil.controller");

// Configuración para recibir y guardar imágenes.
const uploadFotoPerfil = require("../middleware/uploadFotoPerfil");

// Consultar lista de usuarios desde MySQL.
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({
      mensaje: "Error al obtener usuarios",
    });
  }
});

// Rutas de autenticación.
router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);

// Actualizar los datos personales del perfil.
router.put("/:id", actualizarPerfil);

// Cambiar la contraseña del usuario.
router.put("/:id/change-password", cambiarContrasena);

// Subir o actualizar la foto de perfil.
router.put(
  "/:id/foto-perfil",
  uploadFotoPerfil.single("foto"),
  guardarFotoPerfil
);

module.exports = router;
