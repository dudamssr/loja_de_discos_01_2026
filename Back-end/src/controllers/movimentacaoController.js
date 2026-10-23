
const prisma = require('../data/prisma');

async function listarMovimentacoes(req, res) {
    try {
        const movimentacoes = await prisma.movimentacao.findMany({
            include: {
                disco: true,
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: { id: 'desc' }
        });

        res.json(movimentacoes);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: 'Erro ao listar movimentações.'
        });
    }
}

async function registrarMovimentacao(req, res) {
    try {
        const { tipo, quantidade, discoId, usuarioId, data } = req.body;

        const tipoNormalizado = String(tipo || '').toUpperCase();
        const qtd = Number(quantidade);
        const idDisco = Number(discoId);
        const idUsuario = Number(usuarioId);

        if (!['ENTRADA', 'SAIDA'].includes(tipoNormalizado)) {
            return res.status(400).json({
                erro: 'O tipo deve ser ENTRADA ou SAIDA.'
            });
        }

        if (
            !Number.isInteger(qtd) || qtd <= 0 ||
            !Number.isInteger(idDisco) || idDisco <= 0 ||
            !Number.isInteger(idUsuario) || idUsuario <= 0
        ) {
            return res.status(400).json({
                erro: 'Informe quantidade, disco e usuário válidos.'
            });
        }

        let dataMovimentacao = new Date();

        if (data !== undefined) {
            if (typeof data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
                return res.status(400).json({
                    erro: 'A data deve estar no formato AAAA-MM-DD.'
                });
            }

            dataMovimentacao = new Date(`${data}T12:00:00.000Z`);

            if (
                Number.isNaN(dataMovimentacao.getTime()) ||
                dataMovimentacao.toISOString().slice(0, 10) !== data
            ) {
                return res.status(400).json({ erro: 'Data inválida.' });
            }
        }

        const movimentacao = await prisma.$transaction(async (tx) => {
            const disco = await tx.disco.findUnique({
                where: { id: idDisco }
            });

            if (!disco) {
                const erro = new Error('Disco não encontrado.');
                erro.status = 404;
                throw erro;
            }

            const usuario = await tx.usuario.findUnique({
                where: { id: idUsuario }
            });

            if (!usuario) {
                const erro = new Error('Usuário não encontrado.');
                erro.status = 404;
                throw erro;
            }

            if (tipoNormalizado === 'SAIDA') {
                const atualizacao = await tx.disco.updateMany({
                    where: {
                        id: idDisco,
                        quantidade: { gte: qtd }
                    },
                    data: {
                        quantidade: { decrement: qtd }
                    }
                });

                if (atualizacao.count === 0) {
                    const erro = new Error(
                        'Estoque insuficiente para realizar a saída.'
                    );
                    erro.status = 409;
                    throw erro;
                }
            } else {
                await tx.disco.update({
                    where: { id: idDisco },
                    data: {
                        quantidade: { increment: qtd }
                    }
                });
            }

            return tx.movimentacao.create({
                data: {
                    tipo: tipoNormalizado,
                    quantidade: qtd,
                    data: dataMovimentacao,
                    discoId: idDisco,
                    usuarioId: idUsuario
                },
                include: {
                    disco: true,
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true
                        }
                    }
                }
            });
        });

        res.status(201).json({
            mensagem: 'Movimentação registrada com sucesso.',
            movimentacao,
            estoqueBaixo:
                movimentacao.disco.quantidade <=
                movimentacao.disco.estoqueMinimo
        });
    } catch (erro) {
        if (erro.status) {
            return res.status(erro.status).json({ erro: erro.message });
        }

        console.error(erro);
        res.status(500).json({
            erro: 'Erro ao registrar movimentação.'
        });
    }
}

module.exports = {
    listarMovimentacoes,
    registrarMovimentacao
};
