import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {decryptToken} from "../utilities/token";
import {Link, createLinkDeactivationEvent, generateShortAlias, saveLink} from "../datasets/link";
import {errorHandler} from "../error/errorHandler";
import {constructResponse} from "../utilities/response";
import {CustomError} from "../error/customError";

export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const {longLink, lifeTime} = JSON.parse(event.body as string);

        if (!longLink || !lifeTime) {
            throw new CustomError(400, "Both 'longLink' and 'lifeTime' are required in the request body.");
        }

        const {authorizationToken} = event.headers;
        const [_, token] = (authorizationToken as string).split(" ");
        const {email} = JSON.parse(await decryptToken(token));

        const shortAlias = await generateShortAlias();
        const link = new Link(email, longLink, lifeTime, shortAlias);

        // Перевірка властивостей link перед збереженням
        if (!link.longLink || !link.lifetime || !link.shortAlias || !link.PK || !link.SK) {
            throw new CustomError(500, "Internal server error: Invalid link properties.");
        }

        await saveLink(link);
        await createLinkDeactivationEvent(link.lifetime, link.createdAt, link.PK);

        return constructResponse(201, {shortLink: process.env.BASE_URL + link.shortAlias});
    } catch (error) {
        return errorHandler(error);
    }
};
