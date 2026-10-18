
const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// Guardar la ruta de la foto en la base de datos.
const guardarFotoPerfil = async (req, res) => {
    try {
        const { id } = req.params;

        // Comprobar que se haya seleccionado una imagen.
        if (!req.file) {
            return res.status(400).json({
                error: "Selecciona una imagen para continuar.",
            });
        }

        // Comprobar que el usuario exista.
        const [usuarios] = await db.query(
            "SELECT id_usuario, imagen_perfil FROM usuarios WHERE id_usuario = ?",
            [id]
        );

        if (usuarios.length === 0) {
            // Si el usuario no existe, eliminar la imagen recién subida.
            fs.unlink(req.file.path, () => { });

            return res.status(404).json({
                error: "No se encontró el usuario.",
            });
        }

        const usuario = usuarios[0];

        // Guardar la ruta relativa de la imagen.
        const rutaFoto = `/uploads/perfiles/${req.file.filename}`;

        await db.query(
            "UPDATE usuarios SET imagen_perfil = ? WHERE id_usuario = ?",
            [rutaFoto, id]
        );

        // Eliminar la foto anterior si estaba guardada en nuestro servidor.
        if (usuario.imagen_perfil) {
            const nombreAnterior = path.basename(usuario.imagen_perfil);
            const rutaAnterior = path.join(
                __dirname,
                "../uploads/perfiles",
                nombreAnterior
            );

            if (fs.existsSync(rutaAnterior)) {
                fs.unlink(rutaAnterior, (error) => {
                    if (error) {
                        console.error("No se pudo eliminar la foto anterior:", error);
                    }
                });
            }
        }

        return res.status(200).json({
            mensaje: "Foto de perfil actualizada correctamente.",
            imagen_perfil: rutaFoto,
        });
    } catch (error) {
        // Si ocurrió un error, eliminar la imagen que se acaba de subir.
        if (req.file) {
            fs.unlink(req.file.path, () => { });
        }

        console.error("Error al guardar la foto de perfil:", error);

        return res.status(500).json({
            error: "Error interno al guardar la foto de perfil.",
        });
    }
};

module.exports = {
    guardarFotoPerfil,
};
