
const express = require('express');
const router = express.Router();

const {
    cadastrarUsuario,
    login,
    listarUsuarios
} = require('../controllers/usuarioController');

router.post('/cadastro', cadastrarUsuario);
router.post('/login', login);
router.get('/listar', listarUsuarios);

module.exports = router;
