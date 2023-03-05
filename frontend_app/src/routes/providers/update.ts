import { Request, Response } from "express";
import * as yup from "yup";

import Apikey from "../../models/Apikey";
import Knex from "../../libs/Knex";
import Logger from "../../libs/Logger";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import Provider from "../../models/Provider";
import { getProvider } from "./retrieve";

const dynamo = new DynamoDBClient({});
const document = DynamoDBDocumentClient.from(dynamo);

const PROVIDERS_TABLE_NAME = `triangle-codytest-providers`;

const schema = {
  body: yup.object({ name: yup.string().trim().max(256).required() }),
};

const handler = async (req: Request, res: Response) => {
  try {
    console.log(req.params.id);
    console.log(req.body.weight);
    const params = new UpdateCommand({
      TableName: PROVIDERS_TABLE_NAME,
      Key: { id: req.params.id },
      UpdateExpression: `set #weight = :weight`,
      ExpressionAttributeNames: {
        "#weight": "weight",
      },
      ExpressionAttributeValues: {
        ":weight": req.body.weight, // TODO: check size
      },
    });

    await document.send(params);
    const provider = await getProvider(req.params.id);

    return res.json(Provider.prepare(provider, provider.metrics));
  } catch (err) {
    Logger.error(err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default {
  handler,
  schema,
};
