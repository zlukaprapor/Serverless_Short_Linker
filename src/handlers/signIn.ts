import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import {User, verifyUser} from "../datasets/user";
import {errorHandler} from "../error/errorHandler";
import {constructResponse} from "../utilities/response";

const getUserDataFromEvent = (event: APIGatewayProxyEvent): { email: string, password: string } => {
    try {
        const {email, password} = JSON.parse(event.body as string);

        if (!email || !password) {
            throw new Error("Email and password are required.");
        }

        return {email, password};

    } catch (error) {
        // Обробка помилок парсингу або відсутності обов'язкових полів
        throw new Error(`Invalid request data: ${error.message}`);
    }
};
export const main = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        // Отримання даних користувача з події API Gateway
        const {email, password} = getUserDataFromEvent(event);

        const user = new User(email, password);

        const jweToken = await verifyUser(user);

        return constructResponse(200, {jweToken});

    } catch (error) {

        return errorHandler(error);

    }
};
