const { delay, ServiceBusClient } = require("@azure/service-bus");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

function log(message) {
  console.log(`[receive ${new Date().toISOString()}] ${message}`);
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

async function main() {
  log("Starting receiver script");
  log(`Namespace: ${fullyQualifiedNamespace}`);
  log(`Queue: ${queueName}`);

  const sbClient = new ServiceBusClient(fullyQualifiedNamespace, credential);
  const receiver = sbClient.createReceiver(queueName);
  let receivedCount = 0;

  const processMessage = async (message) => {
    receivedCount += 1;
    const body = typeof message.body === "object" ? JSON.stringify(message.body) : message.body;
    console.log(`Received message: ${body}`);
  };

  const processError = async (args) => {
    console.error(`[receive ${new Date().toISOString()}] Receiver error:`, args.error);
  };

  log("Subscribing receiver handlers");
  receiver.subscribe({
    processMessage,
    processError
  });

  log("Waiting 20 seconds for incoming messages");
  await delay(20000);

  log(`Messages received in this run: ${receivedCount}`);
  log("Closing receiver and client");
  await receiver.close();
  await sbClient.close();
  log("Receiver script finished");
}

main().catch((err) => {
  console.error(`[receive ${new Date().toISOString()}] Error occurred:`, err);
  process.exit(1);
});
