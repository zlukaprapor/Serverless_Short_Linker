import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {redirectLink} from "../datasets/link";
import {CustomError} from "../error/customError";
import {errorHandler} from "../error/errorHandler";
import {constructResponse} from "../utilities/response";

const getShortAliasFromEvent = (event: APIGatewayProxyEvent): string => {
    const shortAlias = event.pathParameters?.shortAlias as string;
    if (!shortAlias) {
        throw new CustomError(404, "Short link not found");
    }
    return shortAlias;
};

const performRedirect = async (shortAlias: string): Promise<APIGatewayProxyResult> => {
    try {
        const link = await redirectLink(shortAlias);

        if (!link) {
            throw new CustomError(404, "Short link not found");
        }

        return {
            statusCode: 301,
            headers: {
                Location: link.longLink,
            },
            body: "",
        };
    } catch (error) {
        // Обробка помилок під час перенаправлення
        throw new CustomError(500, `Error redirecting: ${error.message}`);
    }
};

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const shortAlias = getShortAliasFromEvent(event);
        return await performRedirect(shortAlias);
    } catch (error) {
        // Обробка головної помилки та відправлення на обробник помилок
        return errorHandler(error);
    }
};
