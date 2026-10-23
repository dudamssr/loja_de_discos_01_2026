
const express = require('express');
const router = express.Router();

const {
    listarDiscos,
    buscarDisco,
    cadastrarDisco,
    editarDisco,
    excluirDisco
} = require('../controllers/discoController');

router.get('/', listarDiscos);
router.get('/:id', buscarDisco);
router.post('/', cadastrarDisco);
router.put('/:id', editarDisco);
router.delete('/:id', excluirDisco);

module.exports = router;
