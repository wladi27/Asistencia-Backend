const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { Canvas, Image, ImageData } = require('canvas');
const faceapi = require('face-api.js');
const path = require('path');

// Cargar modelos de face-api.js
const MODEL_URL = path.join(__dirname, '../public/models');

Promise.all([
  faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL),
]).then(() => console.log('Modelos cargados'));

// Registro de usuario
exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, contraseña, foto } = req.body;
  try {
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) return res.status(400).json({ msg: 'Usuario ya existe' });

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      contraseña: await bcrypt.hash(contraseña, 10),
      foto,
    });

    await nuevoUsuario.save();
    res.status(201).json({ msg: 'Usuario registrado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Login de usuario
exports.loginUsuario = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ msg: 'Credenciales incorrectas' });

    const esValido = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValido) return res.status(400).json({ msg: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Validar asistencia
exports.validarAsistencia = async (req, res) => {
  const { usuarioId, imagenBase64 } = req.body;

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });

    // Convertir la imagen base64 a un objeto de imagen
    const img = await faceapi.fetchImage(imagenBase64);
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

    if (detections.length > 0) {
      const usuarioFoto = await faceapi.fetchImage(usuario.foto);
      const usuarioDescriptor = await faceapi.detectSingleFace(usuarioFoto).withFaceLandmarks().withFaceDescriptor();

      const distancia = faceapi.euclideanDistance(detections[0].descriptor, usuarioDescriptor.descriptor);

      if (distancia < 0.6) { // Umbral de distancia
        // Registrar asistencia
        const nuevaAsistencia = new Asistencia({ usuarioId, tipo: 'Entrada' });
        await nuevaAsistencia.save();
        return res.status(200).json({ msg: 'Asistencia registrada' });
      } else {
        return res.status(400).json({ msg: 'No coincide la imagen' });
      }
    } else {
      return res.status(400).json({ msg: 'No se detectó rostro' });
    }
  } catch (error) {
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};
