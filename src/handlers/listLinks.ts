import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {SchedulerClient, ListSchedulesCommand} from "@aws-sdk/client-scheduler";
import {decryptToken} from "../utilities/token";
import {listLinks} from "../datasets/link";
import {errorHandler} from "../error/errorHandler";
import {constructResponse} from "../utilities/response";

const getEmailFromToken = async (authorizationToken: string): Promise<string> => {
    try {
        const authorizerArr = authorizationToken.split(" ");
        const {email} = JSON.parse(await decryptToken(authorizerArr[1]));
        return email;
    } catch (error) {
        throw new Error(`Error extracting email from authorization token: ${error.message}`);
    }
};

const fetchUserLinks = async (email: string): Promise<Record<string, any>[] | undefined> => {
    try {
        return await listLinks(email);
    } catch (error) {
        throw new Error(`Error fetching user links: ${error.message}`);
    }
};

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const {authorizationToken} = event.headers;
        const email = await getEmailFromToken(authorizationToken as string);
        const links = await fetchUserLinks(email);

        return constructResponse(200, {listLinks: links});
    } catch (error) {
        return errorHandler(error);
    }
};
