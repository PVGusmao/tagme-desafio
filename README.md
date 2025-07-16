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

## Configuração da API

A URL base é injetada via `API_BASE_URL` (ver `app/app.config.ts`).  
Caso queira apontar para outra API, altere o valor lá ou crie um provider customizado.