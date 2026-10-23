
const API_URL = "http://localhost:3000";

async function enviarDados(rota, dadosFormulario) {
    const resposta = await fetch(`${API_URL}${rota}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dadosFormulario)
    });

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            dados.erro ||
            dados.mensagem ||
            "Não foi possível concluir a operação."
        );
    }

    return dados;
}

function mostrarMensagem(elemento, mensagem, erro = false) {
    elemento.textContent = mensagem;
    elemento.classList.toggle("error", erro);
}

document.querySelectorAll(".toggle-password").forEach(botao => {
    botao.addEventListener("click", () => {
        const campo = document.getElementById(botao.dataset.target);

        if (!campo) return;

        const mostrar = campo.type === "password";
        campo.type = mostrar ? "text" : "password";
        botao.textContent = mostrar ? "Ocultar" : "Mostrar";
    });
});

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async evento => {
        evento.preventDefault();

        const mensagem = document.getElementById("loginMessage");
        const botao = document.getElementById("loginButton");

        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;

        botao.disabled = true;
        botao.textContent = "Entrando...";
        mostrarMensagem(mensagem, "Verificando seus dados...");

        try {
            const dados = await enviarDados("/usuarios/login", {
                email,
                senha
            });

            if (!dados.token) {
                throw new Error("A API não retornou o token de acesso.");
            }

            localStorage.setItem("vinylToken", dados.token);

            if (dados.usuario) {
                localStorage.setItem(
                    "vinylUsuario",
                    JSON.stringify(dados.usuario)
                );

                localStorage.setItem(
                    "nomeUsuario",
                    dados.usuario.nome || ""
                );
            }

            mostrarMensagem(mensagem, "Login realizado com sucesso!");

            window.location.replace("./index.html");
        } catch (erro) {
            mostrarMensagem(mensagem, erro.message, true);
        } finally {
            botao.disabled = false;
            botao.innerHTML = 'Entrar <span>↗</span>';
        }
    });
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async evento => {
        evento.preventDefault();

        const mensagem = document.getElementById("registerMessage");
        const botao = document.getElementById("registerButton");

        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmarSenha =
            document.getElementById("confirmarSenha").value;

        if (senha.length < 6) {
            mostrarMensagem(
                mensagem,
                "A senha precisa ter pelo menos 6 caracteres.",
                true
            );
            return;
        }

        if (senha !== confirmarSenha) {
            mostrarMensagem(
                mensagem,
                "As senhas informadas não são iguais.",
                true
            );
            return;
        }

        botao.disabled = true;
        botao.textContent = "Criando conta...";
        mostrarMensagem(mensagem, "Enviando cadastro...");

        try {
            await enviarDados("/usuarios/cadastro", {
                nome,
                email,
                senha
            });

            mostrarMensagem(
                mensagem,
                "Cadastro realizado! Redirecionando para o login..."
            );

            registerForm.reset();

            window.setTimeout(() => {
                window.location.href = "./login.html";
            }, 1500);
        } catch (erro) {
            mostrarMensagem(mensagem, erro.message, true);
        } finally {
            botao.disabled = false;
            botao.innerHTML = 'Criar conta <span>↗</span>';
        }
    });
}
