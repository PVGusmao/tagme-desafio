# Item CRUD

Aplicação web desenvolvida em Angular 17 para cadastro (Create, Read, Update, Delete) de itens genéricos com imagem. O back-end é simulado localmente via [json-server](https://github.com/typicode/json-server).

## Visão Geral

* Lista de itens em cartões estilizados com rotação e posição aleatória, criando efeito de "polaroids espalhadas".
* Cadastro, edição e exclusão de itens através de _modais_ reutilizáveis.
* Upload e recorte de imagem no lado do cliente utilizando **ngx-image-cropper**.
* Tema claro/escuro com persistência em *localStorage*.
* Interface responsiva e estilização com **Tailwind CSS**.
* Comunicação HTTP isolada em `ItemService` consumindo a API exposta pelo **json-server**.

## Tecnologias Principais

* Angular 17
* TypeScript
* Tailwind CSS 3
* json-server (API fake)
* ngx-image-cropper
* RxJS

## Estrutura de Pastas (resumida)

```
src/
 ├── app/
 │   ├── components/      # Componentes de UI reutilizáveis (modais, etc.)
 │   ├── items/           # Modelo e serviço HTTP
 │   ├── screen/          # Telas principais (item-list)
 │   └── shared/          # Serviços utilitários
 └── assets/              # Recursos estáticos
```

## Pré-requisitos

1. Node.js ≥ 18
2. Angular CLI (global)  
   ```bash
   npm install -g @angular/cli
   ```

## Instalação

Dentro da pasta do projeto **item-crud**:

```bash
cd item-crud
npm install
```

## Executando em modo de desenvolvimento

```bash
npm start
```

O script acima executa dois processos em paralelo:

1. `ng serve --open` – Front-end em http://localhost:4200  
2. `json-server --watch ../db.json --port 3000` – API fake em http://localhost:3000

A aplicação abrirá automaticamente no navegador e recarregará a cada salvamento.

## Scripts úteis

| Comando                 | Descrição                                  |
| ----------------------- | ------------------------------------------ |
| `npm start`             | Serve Angular + json-server simultaneamente|
| `npm run build`         | Gera build de produção em `dist/`          |
| `npm run test`          | Executa testes unitários via Karma         |
| `ng generate ...`       | Scaffolding de componentes/serviços        |

## Configuração da API

A URL base é injetada via `API_BASE_URL` (ver `app/app.config.ts`).  
Caso queira apontar para outra API, altere o valor lá ou crie um provider customizado.

## Criação de build de produção

```bash
npm run build
```
Os artefatos otimizados ficarão em `item-crud/dist/`.

## Testes

```bash
npm run test
```
Executa os testes unitários com _watch_ ativo.

## Contribuindo

1. Fork/clone do repositório.
2. Crie sua branch: `git checkout -b minha-feature`.
3. Commit: `git commit -m 'Minha feature'`.
4. Push: `git push origin minha-feature`.
5. Abra um pull request.

## Licença

Projeto desenvolvido para fins de estudo/desafio. Sinta-se livre para utilizar como base.
