# Meu Guru 👋

Ajuda online para resolver exercícios acadêmicos.

---

## Começando

1. Instale as dependências:

```bash
npm install
```

2. Inicie o app:

```bash
npx expo start
```

Este projeto utiliza o Expo GO, indicado apenas para testes. Para ambientes de produção, recomenda-se usar o Expo Prebuild.

---

## Variáveis de Ambiente

Para executar este projeto, você precisará adicionar as seguintes variáveis de ambiente ao seu arquivo `.env`. Você pode copiar o arquivo `.env.example` como base:

- `EXPO_PUBLIC_OPENAI_API_KEY`: Sua chave de API do OpenAI.

### Configuração da OpenAI

1. Crie um arquivo `.env` na raiz do projeto.
2. Adicione a seguinte linha:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sua_chave_openai_aqui
```

---

## Tecnologias Utilizadas

- **Expo Router**: Gerenciamento de rotas.
- **React Query**: Chamadas à API.
- **Zustand**: Gerenciamento de estado.
- **Async Storage**: Armazenamento local.
- **Expo Haptics**: Feedback tátil.
- **React Native Web**: Renderização de LaTeX (pode ser otimizado futuramente).
- **React Native Markdown Display**: Exibição de conteúdo em Markdown.
- **NativeWind**: Estilização baseada no TailwindCSS.
- **LegendList**: Utilizado para listas pesadas, com operações em background. [Repositório no GitHub](https://github.com/LegendApp/legend-list)
- **Expo Icons**: Ícones para o app.

---

## Funcionalidades

- Chat com envio de mensagens e resposta automatizada.
- Histórico de conversas com listagem.
- Página de debug para resetar dados locais e retornar ao onboarding.
- Geração automática de título para mensagens (realiza uma requisição extra após a resposta).
- Copiar texto das respostas.
- Geração de áudio (TTS) a partir das mensagens.
- Suporte ao uso da câmera.
- Suporte a pesquisas web usando o [Web Search da OpenAI](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses).

---

## Funcionalidades Futuras

- Envio de documentos e imagens no chat.
- Integração entre web e app via deep linking: o usuário será redirecionado diretamente para a tela de chat com o ID correspondente (por exemplo, `/chat/123`), proporcionando uma experiência fluida entre plataformas.
- Acesso a pesquisas acadêmicas públicas (papers) via deep research ou pesquisas na web.
- Expansão da funcionalidade da câmera para permitir o uso das imagens no chat, atualmente a funcionalidade câmera não está funcionando, apenas mockado.
