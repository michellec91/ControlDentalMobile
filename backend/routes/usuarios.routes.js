const express = require("express");
const router = express.Router();
const { registrarUsuario, loginUsuario } = require("../controllers/usuarios.controller");

// Rutas de autenticación
router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);

module.exports = router;