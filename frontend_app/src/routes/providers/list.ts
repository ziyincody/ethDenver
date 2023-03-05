import { Request, Response } from "express";
import List from "../../models/List";
import Logger from "../../libs/Logger";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import Provider from "../../models/Provider";
import { getProviderMetrics } from "./retrieve";

const dynamo = new DynamoDBClient({});
const document = DynamoDBDocumentClient.from(dynamo);

const TXS_TABLE_NAME = `triangle-codytest-providers`;

export const getProviders = async (appId: string): Promise<any> => {
  const command = new ScanCommand({
    TableName: TXS_TABLE_NAME,
  });
  const output = await document.send(command);

  return output.Items?.filter((item) => item.app_id === appId);
};

const handler = async (req: Request, res: Response) => {
  try {
    const providers = await getProviders(req.triangle!.app!.id);
    const list = List.prepare(
      await Promise.all(
        providers.map(async (provider: any) => {
          const metrics = await getProviderMetrics(provider.id);
          return Provider.prepare(provider, metrics);
        })
      )
    );
    console.log(list);
    return res.json(list);
  } catch (err) {
    Logger.error(err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default {
  handler,
};
