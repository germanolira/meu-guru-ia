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

- `EXPO_PUBLIC_OPENROUTER_API_KEY`: Sua chave de API do OpenRouter.
- `EXPO_PUBLIC_USE_OPENAI`: Defina como "true" se quiser usar a API do OpenAI diretamente. Caso contrário, o OpenRouter será usado por padrão.
- `EXPO_PUBLIC_OPENAI_API_KEY`: Sua chave de API do OpenAI. Necessária apenas se `EXPO_PUBLIC_USE_OPENAI` estiver como "true".

### Usando OpenAI

Caso o app esteja sendo avaliado, talvez você queira usar a API do OpenAI diretamente. Para isso:

1. Crie um arquivo `.env` na raiz do projeto.
2. Adicione as seguintes linhas:

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=keyopenrouter
EXPO_PUBLIC_OPENAI_API_KEY=keyopenai
EXPO_PUBLIC_USE_OPENAI=true
EXPO_PUBLIC_OPENAI_MODEL="gpt-4.1-mini"
EXPO_PUBLIC_OPENROUTER_MODEL="openai/gpt-4o-mini"
```

Você pode ignorar `EXPO_PUBLIC_OPENROUTER_API_KEY` se estiver usando apenas o OpenAI.

> **Nota:** A chave abaixo é do OpenRouter e está sendo deixada pública intencionalmente apenas para fins de teste. Ela possui US\$2 de crédito e não representa risco de segurança:
>
> ```env
> EXPO_PUBLIC_OPENROUTER_API_KEY=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
> ```

Utilizei o OpenRouter para testes, pois ele oferece 200 chamadas gratuitas por dia e é compatível com a API da OpenAI.

Consulte os modelos disponíveis no OpenRouter:

- [Todos os modelos disponíveis no OpenRouter](https://openrouter.ai/models)
- [Modelos da OpenAI no OpenRouter](https://openrouter.ai/models?q=openai)

Na saída do terminal, você encontrará opções para abrir o app no [Expo Go](https://expo.dev/go), um ambiente sandbox para testar apps com Expo.

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
- Suporte a pesquisas:

  - Se estiver usando OpenAI, utiliza o [Web Search da OpenAI](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses).
  - Caso contrário, utiliza o [Web Search do OpenRouter](https://openrouter.ai/docs/features/web-search).

---

## Funcionalidades Futuras

- Envio de documentos e imagens no chat.
- Integração entre web e app via deep linking: o usuário será redirecionado diretamente para a tela de chat com o ID correspondente (por exemplo, `/chat/123`), proporcionando uma experiência fluida entre plataformas.
- Acesso a pesquisas acadêmicas públicas (papers) via deep research ou pesquisas na web.
- Expansão da funcionalidade da câmera para permitir o uso das imagens no chat, atualmente a funcionalidade câmera não está funcionando, apenas mockado.
