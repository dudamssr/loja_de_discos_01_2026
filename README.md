
# Vinyl Control

## Sistema de Gerenciamento de Discos de Vinil

O Vinyl Control é uma aplicação web desenvolvida para auxiliar no gerenciamento de uma loja de discos de vinil. O projeto integra uma interface para interação com o usuário, uma API REST para processamento das operações e um banco de dados relacional para armazenamento das informações.

## Sobre o Projeto

O sistema foi desenvolvido com o objetivo de aplicar conhecimentos de desenvolvimento web, integração entre frontend e backend, persistência de dados e segurança da informação.

A aplicação contempla o cadastro e a autenticação de usuários, além de funcionalidades relacionadas ao catálogo de discos e ao controle de movimentações, conforme os recursos implementados no projeto.

## Tecnologias Utilizadas

- **HTML5:** estrutura das páginas web.
- **CSS3:** estilização e organização visual da interface.
- **JavaScript:** interatividade e comunicação com a API.
- **Node.js:** ambiente de execução do backend.
- **Express:** criação e gerenciamento das rotas da API.
- **Prisma ORM:** integração entre a aplicação e o banco de dados.
- **MariaDB:** armazenamento das informações.
- **bcryptjs:** geração de hash para proteção das senhas.
- **JWT (JSON Web Token):** autenticação de usuários.
- **CORS:** configuração de acesso entre diferentes origens.
- **dotenv:** gerenciamento de variáveis de ambiente.
- **Insomnia:** testes das requisições HTTP.
- **Git e GitHub:** versionamento e armazenamento do código-fonte.

## Funcionalidades

### Cadastro e Autenticação de Usuários

- Cadastro de usuários com nome, e-mail e senha.
- Verificação de e-mails já cadastrados.
- Armazenamento de senhas utilizando hash.
- Login com validação das credenciais.
- Geração de token JWT após autenticação bem-sucedida.

### Catálogo de Discos

A aplicação possui uma interface destinada à apresentação dos discos de vinil, com recursos para organização e consulta dos produtos.

As operações de cadastro, consulta, atualização e exclusão dependem das rotas e dos controladores implementados no backend.

### Controle de Movimentações

O projeto possui uma estrutura de backend destinada ao gerenciamento de movimentações relacionadas aos discos e ao estoque, conforme as regras definidas na aplicação.

## Arquitetura do Sistema

O Vinyl Control utiliza a arquitetura cliente-servidor, separando a interface visual das regras de negócio e do armazenamento de dados.

- **Frontend:** desenvolvido com HTML, CSS e JavaScript, responsável pela apresentação das informações e pela interação com o usuário.
- **Backend:** desenvolvido com Node.js e Express, responsável pelo processamento das requisições HTTP.
- **Banco de dados:** utiliza MariaDB para armazenar os registros.
- **Camada de acesso a dados:** utiliza Prisma ORM para intermediar a comunicação entre o backend e o banco de dados.

### Fluxo de Funcionamento

1. O usuário interage com a interface web.
2. O frontend envia uma requisição HTTP para a API.
3. O backend recebe a requisição e realiza as validações necessárias.
4. O Prisma executa as operações necessárias no banco de dados.
5. A API retorna uma resposta ao frontend.
6. A interface apresenta o resultado da operação.

## Banco de Dados

O projeto utiliza o MariaDB como sistema de gerenciamento de banco de dados relacional, com acesso realizado por meio do Prisma ORM.

A estrutura das entidades, seus atributos, as chaves primárias, as chaves estrangeiras e os relacionamentos seguem a definição presente no arquivo `schema.prisma`.

## Projeto desenvolvido por
- Eduarda Massaro dos Santos
- Lívia Morais Pereira
