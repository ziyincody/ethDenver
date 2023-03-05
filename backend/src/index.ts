import { ethers } from "ethers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";

const dynamo = new DynamoDBClient({});
const document = DynamoDBDocumentClient.from(dynamo);

const METRICS_TABLE_NAME = `triangle-codytest-metrics`;
const PROVIDER_TABLE_NAME = `triangle-codytest-providers`;

const cache = new Map();

const metricsTracker = (
  provider: any,
  url: string,
  methodName: string,
  func: (...args: any[]) => Promise<any>
) => {
  return async (...args: any[]) => {
    const now = new Date();
    const p = await func(...args);
    const duration = new Date().getTime() - now.getTime();
    console.log(duration);
    // send duration to backend async
    writeToDB(provider, duration, url, methodName, now.toISOString());
    return p;
  };
};

const getAllProviders = async (networkId: string) => {
  const command = new ScanCommand({
    TableName: PROVIDER_TABLE_NAME,
    FilterExpression: "network = :network",
    ExpressionAttributeValues: {
      ":network": networkId,
    },
  });
  const { Items } = await document.send(command);
  return Items;
};

const writeToDB = async (
  provider: any,
  duration: number,
  url: string,
  methodName: string,
  timestamp: string
) => {
  const walletAddress = "0x0";
  const item = {
    "wallet_address-method_name-provider_id": `${walletAddress}-${methodName}-${provider.id}`,
    timestamp: timestamp,
    latency: duration,
    methodName: methodName,
    provider_url: url,
    provider_id: provider.id,
    request_status: 200,
    is_healthcheck: false,
    network: "goerli",
  };
  const command = new PutCommand({
    TableName: METRICS_TABLE_NAME,
    Item: item,
  });

  await document.send(command);
};

function weightedRandomSelection(providers: any[]) {
  // calculate the total weight of all the providers
  const totalWeight = providers.reduce(
    (acc, provider) => acc + parseFloat(provider.weight),
    0
  );
  console.log(totalWeight)

  // generate a random number between 0 and the total weight
  const randomNumber = Math.random() * totalWeight;

  // loop through the providers and find the provider whose weight brings the random number to 0 or below
  let cumulativeWeight = 0;
  for (const provider of providers) {
    cumulativeWeight += parseFloat(provider.weight);
    if (cumulativeWeight >= randomNumber) {
      return provider;
    }
  }
}

const loadBalance = async (req: Request) => {
  console.log(req.body);
  const network = req.body.network;
  const method = req.body.method;
  const isSend = req.body.isSend;
  const params = req.body.params;

  const providers = await getAllProviders(network);
  console.log(providers)

  // round robin randomly pick a provider
  const provider = weightedRandomSelection(providers!);

  const url = provider.provider_url;
  const rpcProvider = new ethers.providers.JsonRpcProvider(url);

  if (method === "eth_getBlock") {
    if (cache.has(params[0])) {
      return cache.get(params[0]);
    }
    const block = await metricsTracker(provider, url, method, async () => {
      return await rpcProvider.getBlock(params[0]);
    })();
    return block;
  }
};

(async () => {
  const app: Application = express();

  app.set("json spaces", 2);
  app.use((req, res, next) => {
    app.set("trust proxy", req.header("triangle-proxy") ? 2 : 1);
    return next();
  });
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());

  app.post("/", async (req: Request, res: Response) => {
    const out = await loadBalance(req);
    res.status(200).json(JSON.stringify(out));
  });

  app.listen(3005, () => console.log(`App listening on port 3005`));
})();
