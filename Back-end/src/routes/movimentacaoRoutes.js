
const express = require('express');
const router = express.Router();

const {
    listarMovimentacoes,
    registrarMovimentacao
} = require('../controllers/movimentacaoController');

router.get('/', listarMovimentacoes);
router.post('/', registrarMovimentacao);

module.exports = router;
