const prisma = require('../data/prisma');

async function listarDiscos(req, res) {
    try {
        const { busca } = req.query;

        const discos = await prisma.disco.findMany({
            where: busca
                ? {
                    OR: [
                        { titulo: { contains: busca } },
                        { artista: { contains: busca } }
                    ]
                }
                : undefined,
            orderBy: { id: 'asc' }
        });

        res.json(discos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao listar discos.' });
    }
}

async function buscarDisco(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: 'ID inválido.' });
        }

        const disco = await prisma.disco.findUnique({ where: { id } });

        if (!disco) {
            return res.status(404).json({ erro: 'Disco não encontrado.' });
        }

        res.json(disco);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao buscar disco.' });
    }
}

async function cadastrarDisco(req, res) {
    try {
        const { titulo, artista, precoCusto, quantidade, estoqueMinimo } = req.body;

        if (
            typeof titulo !== 'string' || !titulo.trim() ||
            typeof artista !== 'string' || !artista.trim() ||
            precoCusto === undefined || quantidade === undefined
        ) {
            return res.status(400).json({
                erro: 'Informe título, artista, preço e quantidade.'
            });
        }

        const preco = Number(precoCusto);
        const qtd = Number(quantidade);
        const minimo = Number(estoqueMinimo ?? 1);

        if (
            !Number.isFinite(preco) || preco < 0 ||
            !Number.isInteger(qtd) || qtd < 0 ||
            !Number.isInteger(minimo) || minimo < 0
        ) {
            return res.status(400).json({ erro: 'Valores inválidos.' });
        }

        const disco = await prisma.disco.create({
            data: {
                titulo: titulo.trim(),
                artista: artista.trim(),
                precoCusto: preco,
                quantidade: qtd,
                estoqueMinimo: minimo
            }
        });

        res.status(201).json(disco);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: 'Erro ao cadastrar disco.' });
    }
}

async function editarDisco(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: 'ID inválido.' });
        }

        const { titulo, artista, precoCusto, quantidade, estoqueMinimo } = req.body;
        const data = {};

        if (titulo !== undefined) {
            if (typeof titulo !== 'string' || !titulo.trim()) {
                return res.status(400).json({ erro: 'Título inválido.' });
            }
            data.titulo = titulo.trim();
        }

        if (artista !== undefined) {
            if (typeof artista !== 'string' || !artista.trim()) {
                return res.status(400).json({ erro: 'Artista inválido.' });
            }
            data.artista = artista.trim();
        }

        if (precoCusto !== undefined) {
            const valor = Number(precoCusto);
            if (!Number.isFinite(valor) || valor < 0) {
                return res.status(400).json({ erro: 'Preço inválido.' });
            }
            data.precoCusto = valor;
        }

        if (quantidade !== undefined) {
            const valor = Number(quantidade);
            if (!Number.isInteger(valor) || valor < 0) {
                return res.status(400).json({ erro: 'Quantidade inválida.' });
            }
            data.quantidade = valor;
        }

        if (estoqueMinimo !== undefined) {
            const valor = Number(estoqueMinimo);
            if (!Number.isInteger(valor) || valor < 0) {
                return res.status(400).json({ erro: 'Estoque mínimo inválido.' });
            }
            data.estoqueMinimo = valor;
        }

        const disco = await prisma.disco.update({
            where: { id },
            data
        });

        res.json(disco);
    } catch (erro) {
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: 'Disco não encontrado.' });
        }

        console.error(erro);
        res.status(500).json({ erro: 'Erro ao editar disco.' });
    }
}

async function excluirDisco(req, res) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ erro: 'ID inválido.' });
        }

        await prisma.disco.delete({ where: { id } });

        res.json({ mensagem: 'Disco excluído com sucesso.' });
    } catch (erro) {
        if (erro.code === 'P2025') {
            return res.status(404).json({ erro: 'Disco não encontrado.' });
        }

        if (erro.code === 'P2003') {
            return res.status(409).json({
                erro: 'Este disco possui movimentações e não pode ser excluído.'
            });
        }

        console.error(erro);
        res.status(500).json({ erro: 'Erro ao excluir disco.' });
    }
}

module.exports = {
    listarDiscos,
    buscarDisco,
    cadastrarDisco,
    editarDisco,
    excluirDisco
};
