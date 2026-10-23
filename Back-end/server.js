
require('dotenv').config({
    path: require('path').join(__dirname, '.env')
});

const express = require('express');
const cors = require('cors');

const discoRoutes = require('./src/routes/discoRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const movimentacaoRoutes = require('./src/routes/movimentacaoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

console.log(
    'JWT_SECRET carregado:',
    Boolean(process.env.JWT_SECRET)
);

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API Vinyl Control funcionando!'
    });
});

app.use('/discos', discoRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/movimentacoes', movimentacaoRoutes);

app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada.',
        caminho: req.originalUrl
    });
});

const PORT = process.env.PORT || 3000;

const servidor = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

async function encerrarServidor() {
    servidor.close(async () => {
        try {
            const prisma = require('./src/data/prisma');
            await prisma.$disconnect();
            console.log('Conexão com o banco encerrada.');
            process.exit(0);
        } catch (erro) {
            console.error('Erro ao encerrar o Prisma:', erro);
            process.exit(1);
        }
    });
}

process.on('SIGINT', encerrarServidor);
process.on('SIGTERM', encerrarServidor);
