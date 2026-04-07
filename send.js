const { ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

function log(message) {
  console.log(`[send ${new Date().toISOString()}] ${message}`);
}

const namespace = process.env.SERVICE_BUS_NAMESPACE;
const queueName = process.env.SERVICE_BUS_QUEUE_NAME;

if (!namespace || !queueName) {
  console.error(
    "Missing environment variables. Set SERVICE_BUS_NAMESPACE and SERVICE_BUS_QUEUE_NAME in .env file."
  );
  process.exit(1);
}

const fullyQualifiedNamespace = `${namespace}.servicebus.windows.net`;
const credential = new DefaultAzureCredential();

const messages = [
  { body: { id: "msg-001", tipo: "pedido", cliente: "ana", valor: 120.5 } },
  { body: { id: "msg-002", tipo: "pedido", cliente: "bruno", valor: 89.9 } },
  { body: { id: "msg-003", tipo: "cancelamento", cliente: "carla", motivo: "estoque" } },
  { body: { id: "msg-004", tipo: "pedido", cliente: "diego", valor: 39.0 } },
  { body: { id: "msg-005", tipo: "pedido", cliente: "elisa", valor: 240.75 } }
];

async function main() {
  log("Starting sender script");
  log(`Namespace: ${fullyQualifiedNamespace}`);
  log(`Queue: ${queueName}`);
  log(`Messages prepared: ${messages.length}`);

  const sbClient = new ServiceBusClient(fullyQualifiedNamespace, credential);
  const sender = sbClient.createSender(queueName);

  try {
    log("Creating message batch");
    let batch = await sender.createMessageBatch();
    let sentBatches = 0;

    for (const message of messages) {
      if (!batch.tryAddMessage(message)) {
        log(`Current batch full. Sending batch #${sentBatches + 1}`);
        await sender.sendMessages(batch);
        sentBatches += 1;
        batch = await sender.createMessageBatch();

        if (!batch.tryAddMessage(message)) {
          throw new Error("Message too big to fit in a batch");
        }
      }
    }

    log(`Sending final batch #${sentBatches + 1}`);
    await sender.sendMessages(batch);
    sentBatches += 1;
    log(`Batches sent: ${sentBatches}`);
    console.log(`Sent ${messages.length} messages to queue: ${queueName}`);
  } finally {
    log("Closing sender and client");
    await sender.close();
    await sbClient.close();
    log("Sender script finished");
  }
}

main().catch((err) => {
  console.error(`[send ${new Date().toISOString()}] Error occurred:`, err);
  process.exit(1);
});
