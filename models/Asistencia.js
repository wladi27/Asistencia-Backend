const mongoose = require('mongoose');

const asistenciaSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  fecha: { type: Date, default: Date.now },
  tipo: { type: String, enum: ['Entrada', 'Salida'], required: true },
});

module.exports = mongoose.model('Asistencia', asistenciaSchema);
