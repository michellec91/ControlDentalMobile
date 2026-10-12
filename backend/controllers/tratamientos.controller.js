const db = require("../config/db");

const obtenerTratamientos = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tratamientos WHERE estado = 'activo'"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al obtener tratamientos",
    });
  }
};

const obtenerTratamientoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM tratamientos WHERE id_tratamiento = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Tratamiento no encontrado",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: "Error al obtener tratamiento",
    });
  }
};

module.exports = {
  obtenerTratamientos,
  obtenerTratamientoPorId,
};