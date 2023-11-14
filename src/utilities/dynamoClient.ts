import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let dynamoDBClient: DynamoDBClient | null = null;
let dynamoDBDocumentClient: DynamoDBDocumentClient | null = null;

// Отримання екземпляра DynamoDBClient
const getDynamoDBClient = (): DynamoDBClient => {
  return dynamoDBClient ?? new DynamoDBClient({});
};

// Отримання екземпляра DynamoDBDocumentClient
export const getDynamoDBDocumentClient = (): DynamoDBDocumentClient => {
  const marshallOptions = {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const translateConfig = { marshallOptions };

  // Якщо екземпляр DynamoDBClient ще не існує, створюємо його
  dynamoDBClient = dynamoDBClient ?? getDynamoDBClient();

  // Якщо екземпляр DynamoDBDocumentClient ще не існує, створюємо його з екземпляром DynamoDBClient
  dynamoDBDocumentClient = dynamoDBDocumentClient ?? DynamoDBDocumentClient.from(dynamoDBClient, translateConfig);

  return dynamoDBDocumentClient;
};