const express = require("express");

const {
  obtenerTratamientos,
  obtenerTratamientoPorId,
} = require("../controllers/tratamientos.controller");

const router = express.Router();

router.get("/", obtenerTratamientos);
router.get("/:id", obtenerTratamientoPorId);

module.exports = router;