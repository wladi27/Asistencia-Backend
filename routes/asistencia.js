const express = require('express');
const Asistencia = require('../models/Asistencia');
const router = express.Router();

// Registrar asistencia
router.post('/', async (req, res) => {
  const { usuarioId, tipo } = req.body;
  try {
    const nuevaAsistencia = new Asistencia({ usuarioId, tipo });
    await nuevaAsistencia.save();
    res.status(201).json({ msg: 'Asistencia registrada' });
  } catch (error) {
    res.status(500).json({ msg: 'Error en el servidor' });
  }
});

module.exports = router;
