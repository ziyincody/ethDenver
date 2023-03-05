import { Request, Response } from "express";
import Logger from "../../libs/Logger";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import Provider from "../../models/Provider";
var uuid = require("uuid");
import * as yup from "yup";

const dynamo = new DynamoDBClient({});
const document = DynamoDBDocumentClient.from(dynamo);

const TXS_TABLE_NAME = `triangle-codytest-providers`;

const schema = {
  body: yup.object({
    provider_url: yup.string().trim().required(),
    provider_category: yup.string().trim().max(64).required(),
    provider_label: yup.string().trim().max(64).required(),
  }),
};

export const putProvider = async (
  app_id: string,
  provider_url: string,
  provider_label: string,
  provider_category: string,
  network: string,
  weight: string
): Promise<any> => {
  const item = {
    id: `provider_${uuid.v1()}`,
    app_id,
    provider_url,
    provider_label,
    provider_category,
    network,
    weight,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const command = new PutCommand({
    TableName: TXS_TABLE_NAME,
    Item: item,
  });
  await document.send(command);
  return item;
};

const handler = async (req: Request, res: Response) => {
  try {
    const provider = await putProvider(
      req.triangle!.app!.id,
      req.body.provider_url,
      req.body.provider_label,
      req.body.provider_category,
      req.body.network,
      req.body.weight
    );
    return res.json({ ...Provider.prepare(provider, []) });
  } catch (err) {
    Logger.error(err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default {
  handler,
  schema,
};
