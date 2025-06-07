# Meu Guru 👋

Ajuda online para resolver exercícios acadêmicos

## Começando

1. Instale as dependências

   ```bash
   npm install
   ```

2. Inicie o app

   ```bash
   npx expo start
   ```

   Não estou usando prebuild para o projeto, utilizei Expo GO, não é recomendado para além de testes, se fosse para ambientes de produção tem que usar o Expo Prebuild

## Variáveis de Ambiente

Para executar este projeto, você precisará adicionar as seguintes variáveis de ambiente ao seu arquivo `.env`. Você pode copiar o arquivo `.env.example` para criá-lo.

`EXPO_PUBLIC_OPENROUTER_API_KEY`: Sua chave de API para o OpenRouter.

`EXPO_PUBLIC_USE_OPENAI`: Defina como `"true"` se quiser usar a API do OpenAI diretamente. Se definido como `"false"` ou não presente, será usado o OpenRouter por padrão.

`EXPO_PUBLIC_OPENAI_API_KEY`: Sua chave de API para o OpenAI. Isso só é necessário se `EXPO_PUBLIC_USE_OPENAI` estiver definido como `"true"`.

### Usando OpenAI

Se o app estiver sendo avaliado, você pode querer usar a API do OpenAI diretamente. Para fazer isso:

1.  Crie um arquivo `.env` na raiz do projeto.
2.  Adicione as seguintes linhas a ele:

        ```
        EXPO_PUBLIC_OPENROUTER_API_KEY=keyopenrouter
        EXPO_PUBLIC_OPENAI_API_KEY=keyopenai
        EXPO_PUBLIC_USE_OPENAI=true
        EXPO_PUBLIC_OPENAI_MODEL="gpt-4.1-mini"
        EXPO_PUBLIC_OPENROUTER_MODEL="openai/gpt-4o-mini"

    ```

        Você pode ignorar `EXPO_PUBLIC_OPENROUTER_API_KEY` se estiver usando OpenAI.
    ```

Utilizei Openrouter para testes pois ele tem 200 chamadas free por dia mas tem api compativel com a openai https://openrouter.ai/

Na saída, você encontrará opções para abrir o app em:

- [Expo Go](https://expo.dev/go), um sandbox limitado para experimentar o desenvolvimento de apps com Expo
