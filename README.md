# Azure Service Bus Lab (Node.js)

Laboratorio de entrada para iniciantes em Cloud Computing, focado no fluxo de mensageria com Azure Service Bus (queue) usando Node.js.

## Por que usar fila (queue)?

Filas sao usadas para desacoplar sistemas e aumentar resiliencia.

Exemplos reais:
- E-commerce: o checkout envia o pedido para a fila e servicos separados processam pagamento, estoque e notificacao.
- Pico de acesso (Black Friday): a aplicacao continua aceitando pedidos enquanto o processamento ocorre em ritmo controlado.
- Tolerancia a falhas: se o consumidor cair, as mensagens continuam na fila ate o servico voltar.

## O que voce vai aprender

- Criar namespace e queue no Azure Service Bus.
- Configurar autenticacao passwordless com RBAC.
- Enviar mensagens para a fila com Node.js.
- Receber mensagens da fila com Node.js.
- Validar as mensagens no Azure Portal e no Service Bus Explorer.

## Estrutura esperada do projeto

- `send.js`: envia um lote de mensagens JSON para a queue.
- `receive.js`: consome mensagens da queue por 20 segundos.
- `.env.example`: modelo das variaveis de ambiente.
- `.env`: configuracao local (nao versionar).
- `package.json`: dependencias e scripts do laboratorio.

## Pre-requisitos

- Conta no Azure com permissao para criar recursos.
- Node.js LTS (recomendado Node 18+).
    - Download: https://nodejs.org/en/download
- Git (opcional, para clonar o codigo do GitHub).
  - Download: https://git-scm.com/downloads
- Azure CLI instalado.
    - Download: https://learn.microsoft.com/cli/azure/install-azure-cli

## 1) Criar namespace no Azure Portal

1. Entre no Azure Portal.
2. Va em Service Bus e clique em Create.
3. Escolha Subscription e Resource Group.
4. Defina um nome unico para o namespace (exemplo: `sb-alura`).
5. Em Pricing tier, selecione Standard.
6. Clique em Review + create e depois Create.

## 2) Criar queue no namespace

1. Abra o namespace criado.
2. No menu esquerdo, Entities > Queues.
3. Clique em + Queue.
4. Informe um nome (exemplo: `queue`) e crie.

## 3) Configurar autenticacao passwordless (RBAC)

1. No namespace, abra Access control (IAM).
2. Clique em Add role assignment.
3. Selecione o role `Azure Service Bus Data Owner`.
4. Atribua esse role ao seu usuario Microsoft Entra.
5. Aguarde 1 a 8 minutos para propagacao.

Observacao importante:
- Ser `Owner` da subscription nao garante acesso de data plane ao Service Bus.
- Para enviar/receber mensagens, a role `Azure Service Bus Data Owner` é obrigatorio.

## 4) Preparar ambiente local

No terminal, na pasta do projeto:

```bash
npm install
az login --use-device-code
```

## 5) Configurar variaveis no `.env`

1. Edite o `.env` com seus valores reais:

```env
SERVICE_BUS_NAMESPACE=sb-alura
SERVICE_BUS_QUEUE_NAME=queue
```

Os scripts `send.js` e `receive.js` leem automaticamente esse arquivo via `dotenv`.

## 6) Enviar mensagens

```bash
npm run send
```

Saida esperada (exemplo):

```text
Sent 5 messages to queue: queue
```

## 7) Receber mensagens

```bash
npm run receive
```

Saida esperada (exemplo):

```text
Received message: {"id":"msg-001","tipo":"pedido","cliente":"ana","valor":120.5}
Received message: {"id":"msg-002","tipo":"pedido","cliente":"bruno","valor":89.9}
...
```

## 8) Validar no Azure Portal

1. No namespace, abra Overview.
2. Confira contadores de incoming/outgoing messages.
3. Abra a queue e confira Active message count.
4. Para inspecionar mensagens individuais, va em Entities > Queues > sua queue e abra o Service Bus Explorer (menu esquerdo).

## 9) Troubleshooting rapido

- Erro `Send claims are required` ou `Receive claims are required`:
  - rode `az login` no mesmo terminal.
  - confirme o papel `Azure Service Bus Data Owner` no namespace.
  - aguarde alguns minutos para propagacao do RBAC.
- Erro de variavel ausente:
  - confirme se o arquivo `.env` existe.
  - confirme as chaves `SERVICE_BUS_NAMESPACE` e `SERVICE_BUS_QUEUE_NAME`.

## 10) Limpeza de recursos

Ao final do laboratorio, exclua o namespace do Service Bus para evitar custos recorrentes.

## Referencias oficiais

- Service Bus Queue com Node.js (passwordless):
  https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-nodejs-how-to-use-queues?tabs=passwordless
- Azure CLI - instalacao:
  https://learn.microsoft.com/cli/azure/install-azure-cli
- Azure CLI - referencia:
  https://learn.microsoft.com/cli/azure/
