import {APIGatewayProxyResult} from "aws-lambda";
import {CustomError} from "./customError";

export const errorHandler = (error: unknown): APIGatewayProxyResult => {
    const headers = {"content-type": "application/json"};

    console.error(error);

    if (error instanceof CustomError) {
        return createErrorResponse(error.statusCode, error.message, headers);
    } else {
        return createErrorResponse(500, "Internal server error", headers);
    }
};

const createErrorResponse = (statusCode: number, errorMessage: string, headers: Record<string, string>): APIGatewayProxyResult => {
    return {
        statusCode,
        headers,
        body: JSON.stringify({
            Error: errorMessage,
        }),
    };
};
