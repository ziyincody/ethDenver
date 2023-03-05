import { Request, Response } from "express";
import List from "../../models/List";
import Logger from "../../libs/Logger";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import Provider from "../../models/Provider";

const dynamo = new DynamoDBClient({});
const document = DynamoDBDocumentClient.from(dynamo);

const PROVIDERS_TABLE_NAME = `triangle-codytest-providers`;
const METRICS_TABLE_NAME = `triangle-codytest-metrics`;

export const getProvider = async (id: string): Promise<any> => {
  const command = new GetCommand({
    TableName: PROVIDERS_TABLE_NAME,
    Key: {
      id: id,
    },
  });
  const output = await document.send(command);

  return output.Item;
};

export const getProviderMetrics = async (id: string): Promise<any> => {
  const command: QueryCommand = new QueryCommand({
    ExpressionAttributeValues: { ":provider_id": id },
    KeyConditionExpression: "provider_id = :provider_id",
    IndexName: "provider_id",
    TableName: METRICS_TABLE_NAME,
  });
  const output = await document.send(command);

  return output.Items;
};

const handler = async (req: Request, res: Response) => {
  try {
    const provider = await getProvider(req.params.id);
    const metrics = await getProviderMetrics(req.params.id);
    console.log(metrics);
    return res.json({ ...Provider.prepare(provider, metrics) });
  } catch (err) {
    Logger.error(err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default {
  handler,
};
