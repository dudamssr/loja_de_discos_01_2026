VINYL CONTROL - FRONT-END

ESTRUTURA
index.html
css/style.css
js/app.js

COMO EXECUTAR
1. Deixe o MySQL/XAMPP ligado.
2. Entre na pasta api e execute: npm run dev (ou o comando que você já usa para iniciar o servidor).
3. Confirme que a API está em http://localhost:3000.
4. Abra esta pasta no VS Code.
5. Clique com o botão direito em index.html e escolha "Open with Live Server".

ROTAS USADAS
GET    /discos
POST   /discos
PUT    /discos/:id
DELETE /discos/:id
POST   /movimentacoes

IMPORTANTE
- O front usa a API existente em http://localhost:3000.
- Não recria nem altera o banco.
- O formulário de movimentação usa usuário ID 1 como valor inicial; esse ID precisa existir na tabela usuarios.
- Se o navegador mostrar erro de CORS, confira se app.use(cors()) está habilitado no server.js.
- O preço mostrado é o campo precoCusto que existe no schema atual; não é um preço de venda.
- As capas são ilustrações decorativas geradas com CSS; o banco atual não possui campo de imagem.
