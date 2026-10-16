const db = require("../config/db");

// GET /citas
const obtenerCitas = async (req, res) => {
  try {
    const { usuario_id, id_usuario } = req.query;
    const userId = id_usuario || usuario_id;

    let sql = `SELECT c.*, 
                      COALESCE(t.nombre, 'Consulta Dental') AS tratamientoNombre, 
                      COALESCE(u.nombre, 'Usuario') AS pacienteNombre 
               FROM citas c
               LEFT JOIN tratamientos t ON c.id_tratamiento = t.id_tratamiento
               LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario`;
    const params = [];

    // Si viene un id_usuario en los query params, filtra por ese usuario.
    // Si NO viene (como al abrir http://localhost:3001/citas directamente), devuelve TODAS las citas.
    if (userId) {
      sql += ` WHERE c.id_usuario = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY c.id_cita DESC`;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ mensaje: "Error al obtener citas" });
  }
};

// POST /citas
const crearCita = async (req, res) => {
  try {
    const {
      usuario_id,
      id_usuario,
      tratamiento_id,
      id_tratamiento,
      fecha,
      hora,
      estado,
    } = req.body;

    const idUser = id_usuario || usuario_id || 1;
    const idTrat = id_tratamiento || tratamiento_id || 1;

    // Regla de Negocio: Validar duplicado exacto de fecha y hora
    const [existentes] = await db.query(
      `SELECT * FROM citas WHERE fecha = ? AND hora = ? AND estado != 'cancelada'`,
      [fecha, hora],
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        mensaje:
          "Ese horario ya está ocupado. Por favor selecciona otra fecha u hora.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO citas (id_usuario, id_tratamiento, fecha, hora, estado) 
       VALUES (?, ?, ?, ?, ?)`,
      [idUser, idTrat, fecha, hora, estado || "confirmada"],
    );

    return res.status(201).json({
      mensaje: "Cita agendada con éxito",
      id_cita: result.insertId,
    });
  } catch (error) {
    console.error("Error al crear cita:", error);
    return res.status(500).json({
      mensaje: `Error al registrar cita: ${error.sqlMessage || error.message}`,
    });
  }
};

// PUT /citas/:id
const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_tratamiento, tratamiento_id, fecha, hora, estado } = req.body;

    const idTrat = id_tratamiento || tratamiento_id || 1;

    const [existentes] = await db.query(
      `SELECT * FROM citas WHERE fecha = ? AND hora = ? AND id_cita != ? AND estado != 'cancelada'`,
      [fecha, hora, id],
    );

    if (existentes.length > 0) {
      return res.status(400).json({
        mensaje:
          "Ese horario ya está ocupado. Por favor selecciona otra fecha u hora.",
      });
    }

    await db.query(
      `UPDATE citas 
       SET id_tratamiento = ?, fecha = ?, hora = ?, estado = ? 
       WHERE id_cita = ?`,
      [idTrat, fecha, hora, estado || "confirmada", id],
    );

    return res.json({ mensaje: "Cita actualizada con éxito" });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    return res.status(500).json({
      mensaje: `Error al actualizar cita: ${error.sqlMessage || error.message}`,
    });
  }
};

// DELETE /citas/:id
const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM citas WHERE id_cita = ?", [id]);
    res.json({ mensaje: "Cita cancelada con éxito" });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({ mensaje: "Error al cancelar cita" });
  }
};

module.exports = {
  obtenerCitas,
  crearCita,
  actualizarCita,
  cancelarCita,
};
