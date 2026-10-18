const db = require("../config/db");
const bcrypt = require("bcrypt");

// --- REGISTRO DE USUARIO ---
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, correo, password, telefono, rol, estado, imagen_perfil } = req.body;

    if (!nombre || !apellido || !correo || !password || !telefono || !rol || !estado) {
      return res.status(400).json({ error: "Por favor completa todos los campos obligatorios." });
    }

    const [existingUser] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "El correo electrónico ya está registrado." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO usuarios (nombre, apellido, correo, password, telefono, rol, estado, imagen_perfil)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      nombre,
      apellido,
      correo,
      hashedPassword,
      telefono,
      rol,
      estado,
      imagen_perfil || null
    ]);

    return res.status(201).json({ mensaje: "¡Usuario registrado exitosamente!" });
  } catch (error) {
    console.error("Error en el registro:", error);
    return res.status(500).json({ error: "Error interno del servidor al registrar el usuario." });
  }
};

// --- LOGIN DE USUARIO ---
const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: "Por favor ingresa el correo y la contraseña." });
    }

    const [usuarios] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (usuarios.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const usuario = usuarios[0];

    const passwordMatch = await bcrypt.compare(password, usuario.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    return res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado: usuario.estado,
        imagen_perfil: usuario.imagen_perfil || null
      }
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
  }
};

// --- ACTUALIZAR PERFIL DEL USUARIO ---
const actualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, telefono } = req.body;

    // Verificar que se hayan completado los campos obligatorios.
    if (!nombre || !apellido || !correo || !telefono) {
      return res.status(400).json({
        error: "Por favor completa todos los campos obligatorios.",
      });
    }

    // Comprobar que el usuario exista.
    const [usuarios] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        error: "No se encontró el usuario.",
      });
    }

    // Comprobar que el correo no pertenezca a otra cuenta.
    const [correoExistente] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ? AND id_usuario != ?",
      [correo, id]
    );

    if (correoExistente.length > 0) {
      return res.status(400).json({
        error: "El correo electrónico ya está registrado.",
      });
    }

    // Guardar los cambios en la base de datos.
    await db.query(
      `UPDATE usuarios
       SET nombre = ?, apellido = ?, correo = ?, telefono = ?
       WHERE id_usuario = ?`,
      [nombre, apellido, correo, telefono, id]
    );

    // Devolver los datos actualizados para la aplicación.
    return res.status(200).json({
      mensaje: "Perfil actualizado exitosamente.",
      usuario: {
        id_usuario: Number(id),
        nombre,
        apellido,
        correo,
        telefono,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);

    return res.status(500).json({
      error: "Error interno del servidor al actualizar el perfil.",
    });
  }
};


/**
 * Cambiar la contraseña de un usuario.
 * Verifica la contraseña actual y guarda la nueva utilizando bcrypt.
 */
const cambiarContrasena = async (req, res) => {
  try {
    const { id } = req.params;
    const { contrasenaActual, contrasenaNueva } = req.body;

    // Comprobar que se hayan enviado los datos necesarios.
    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({
        error: "Completa todos los campos obligatorios.",
      });
    }

    // Exigir una contraseña nueva de al menos 8 caracteres.
    if (contrasenaNueva.length < 8) {
      return res.status(400).json({
        error: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
    }

    // Buscar la contraseña almacenada para este usuario.
    const [usuarios] = await db.query(
      "SELECT id_usuario, password FROM usuarios WHERE id_usuario = ?",
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        error: "No se encontró el usuario.",
      });
    }

    const usuario = usuarios[0];

    // Comprobar la contraseña actual comparándola con su hash.
    const contrasenaCorrecta = await bcrypt.compare(
      contrasenaActual,
      usuario.password
    );

    if (!contrasenaCorrecta) {
      return res.status(401).json({
        error: "La contraseña actual es incorrecta.",
      });
    }

    // Generar un hash para no almacenar la contraseña nueva en texto plano.
    const nuevoHash = await bcrypt.hash(contrasenaNueva, 10);

    // Guardar el nuevo hash en la base de datos.
    await db.query(
      "UPDATE usuarios SET password = ? WHERE id_usuario = ?",
      [nuevoHash, id]
    );

    return res.status(200).json({
      mensaje: "La contraseña se actualizó correctamente.",
    });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);

    return res.status(500).json({
      error: "Error interno del servidor al cambiar la contraseña.",
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  actualizarPerfil,
  cambiarContrasena,
};