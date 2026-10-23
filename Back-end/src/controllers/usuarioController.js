
const prisma = require('../data/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function cadastrarUsuario(req, res) {
    try {
        const { nome, email, senha } = req.body;

        if (
            typeof nome !== 'string' || !nome.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof senha !== 'string' || !senha
        ) {
            return res.status(400).json({
                erro: 'Informe nome, e-mail e senha.'
            });
        }

        if (senha.length < 6) {
            return res.status(400).json({
                erro: 'A senha deve ter pelo menos 6 caracteres.'
            });
        }

        const emailNormalizado = email.trim().toLowerCase();

        const existente = await prisma.usuario.findUnique({
            where: { email: emailNormalizado }
        });

        if (existente) {
            return res.status(409).json({
                erro: 'Este e-mail já está cadastrado.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const usuario = await prisma.usuario.create({
            data: {
                nome: nome.trim(),
                email: emailNormalizado,
                senha: senhaHash
            },
            select: {
                id: true,
                nome: true,
                email: true
            }
        });

        return res.status(201).json(usuario);
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao cadastrar usuário.'
        });
    }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (
            typeof email !== 'string' || !email.trim() ||
            typeof senha !== 'string' || !senha
        ) {
            return res.status(400).json({
                erro: 'Informe e-mail e senha.'
            });
        }

        const usuario = await prisma.usuario.findUnique({
            where: { email: email.trim().toLowerCase() }
        });

        if (!usuario) {
            return res.status(401).json({
                erro: 'E-mail ou senha incorretos.'
            });
        }

        let senhaValida = false;

        if (usuario.senha.startsWith('$2')) {
            senhaValida = await bcrypt.compare(
                senha,
                usuario.senha
            );
        } else {
            senhaValida = senha === usuario.senha;

            if (senhaValida) {
                const senhaHash = await bcrypt.hash(senha, 10);

                await prisma.usuario.update({
                    where: { id: usuario.id },
                    data: { senha: senhaHash }
                });
            }
        }

        if (!senhaValida) {
            return res.status(401).json({
                erro: 'E-mail ou senha incorretos.'
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                erro: 'JWT_SECRET não foi configurado no .env.'
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            mensagem: 'Login realizado com sucesso.',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (erro) {
        console.error(erro);
        return res.status(500).json({
            erro: 'Erro ao realizar login.'
        });
    }
}

async function listarUsuarios(req, res) {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                tipo: true,
                dataCadastro: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        return res.status(200).json(usuarios);
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);

        return res.status(500).json({
            erro: 'Erro ao listar usuários.'
        });
    }
}

module.exports = {
    cadastrarUsuario,
    login,
    listarUsuarios
};
