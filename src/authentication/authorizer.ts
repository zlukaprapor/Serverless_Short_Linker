import {APIGatewayAuthorizerResult, PolicyDocument, APIGatewayRequestAuthorizerEvent} from "aws-lambda";
import {decryptToken} from "../utilities/";
import {User, getUser} from "../datasets/user";


export const main = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    try {

        const {headers, methodArn} = event;

        // Перевірка наявності заголовків та authorizationToken
        if (!headers || !headers.authorizationToken) {
            return generatePolicy("undefined", "Deny", methodArn);
        }

        // Отримання та розбиття authorizationToken
        const {authorizationToken} = headers;
        const [tokenType, tokenValue] = authorizationToken.split(" ");

        // Перевірка формату authorizationToken
        if (tokenType !== "Bearer" || !tokenValue) {
            return generatePolicy("undefined", "Deny", methodArn);
        }

        // Розшифрування та обробка токену
        const payload = await decryptToken(tokenValue);
        const user = User.fromItem(JSON.parse(payload));

        // Перевірка користувача
        if (!(await getUser(user))) {
            return generatePolicy(user.email, "Deny", methodArn);
        }

        // Авторизація успішна
        return generatePolicy(user.email, "Allow", methodArn);
    } catch (error) {
        // Обробка помилки авторизації
        throw new Error("Unauthorized");
    }
};


const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {

    const policyDocument: PolicyDocument = {
        Version: "2012-10-17",
        Statement: [
            {
                Action: "execute-api:Invoke",
                Effect: effect,
                Resource: resource,
            },
        ],
    };


    return {
        principalId,
        policyDocument,
    };
};