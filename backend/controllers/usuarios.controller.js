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
        rol: usuario.rol,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error("Error en el login:", error);
    return res.status(500).json({ error: "Error interno del servidor al iniciar sesión." });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario
};