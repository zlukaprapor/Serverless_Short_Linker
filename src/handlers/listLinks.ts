import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SchedulerClient, ListSchedulesCommand } from "@aws-sdk/client-scheduler";
import { decryptToken } from "../utilities/token";
import { listLinks } from "../datasets/link";
import { errorHandler } from "../error/errorHandler";
import { constructResponse } from "../utilities/response";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { authorizationToken } = event.headers;
    const authorizerArr = (authorizationToken as string).split(" ");
    const { email } = JSON.parse(await decryptToken(authorizerArr[1]));

    const links = await listLinks(email);

    return constructResponse(200, { listLinks: links });
  } catch (error) {
    return errorHandler(error);
  }
};
