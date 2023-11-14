import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";

let dynamoDBClient: DynamoDBClient | null = null;
let dynamoDBDocumentClient: DynamoDBDocumentClient | null = null;

const getDynamoDBClient = (): DynamoDBClient => {
    return dynamoDBClient ?? new DynamoDBClient({});
};

export const getDynamoDBDocumentClient = (): DynamoDBDocumentClient => {
    const marshallOptions = {
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    };
    const translateConfig = {marshallOptions};

    dynamoDBClient = dynamoDBClient ?? getDynamoDBClient();

    dynamoDBDocumentClient = dynamoDBDocumentClient ?? DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);

    return dynamoDBDocumentClient;
};