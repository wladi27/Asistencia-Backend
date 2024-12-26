const express = require('express');
const { registrarUsuario, loginUsuario, validarAsistencia } = require('../controllers/authController');
const router = express.Router();

// Registro
router.post('/registro', registrarUsuario);

// Login
router.post('/login', loginUsuario);

// Validar asistencia
router.post('/validar-asistencia', validarAsistencia);

module.exports = router;
