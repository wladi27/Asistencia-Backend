const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  foto: { type: String, required: true }, // Ruta de la foto
});

module.exports = mongoose.model('Usuario', usuarioSchema);
