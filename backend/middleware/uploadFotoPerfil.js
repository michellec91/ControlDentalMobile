
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Carpeta donde se guardarán las fotos de perfil.
const carpetaFotos = path.join(
    __dirname,
    "../uploads/perfiles"
);

// Crear la carpeta automáticamente si no existe.
fs.mkdirSync(carpetaFotos, { recursive: true });

// Configurar el nombre y la ubicación de cada archivo.
const almacenamiento = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, carpetaFotos);
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();

        // El nombre único evita que una foto sobrescriba otra.
        const nombreArchivo = `perfil-${req.params.id}-${Date.now()}${extension}`;

        callback(null, nombreArchivo);
    },
});

// Aceptar únicamente archivos de imagen.
const filtroImagen = (req, file, callback) => {
    const tiposPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (tiposPermitidos.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(
            new Error("Solo se permiten imágenes JPG, PNG o WEBP.")
        );
    }
};

// Limitar el tamaño de la imagen a 5 MB.
const uploadFotoPerfil = multer({
    storage: almacenamiento,
    fileFilter: filtroImagen,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = uploadFotoPerfil;
