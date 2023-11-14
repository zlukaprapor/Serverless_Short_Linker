import {GetCommand, PutCommand} from "@aws-sdk/lib-dynamodb";
import {genToken} from "../utilities/token";
import {encryptPassword, verifyPassword} from "../utilities/password";
import {CustomError} from "../error/customError";
import {getDynamoDBDocumentClient} from "../utilities/dynamoClient";

// Клас, що представляє користувача
export class User {
    PK: string;
    SK: string;
    email: string;
    password: string;

    constructor(email: string, password: string) {
        this.PK = email;
        this.SK = email;
        this.email = email;
        this.password = password;
    }

    // Метод для отримання об'єкта користувача у форматі для збереження в базу даних
    toItem(): Record<string, unknown> {
        return {
            PK: this.PK,
            SK: this.SK,
            email: this.email,
            password: this.password,
        };
    }

    // Статичний метод для створення об'єкта користувача з запису бази даних
    static fromItem = (item: Record<string, unknown>): User => {
        return new User(item.email as string, item.password as string);
    };
}

// Функція для отримання користувача за його PK та SK
export const getUser = async (user: User): Promise<Record<string, any> | undefined> => {
    const dynamoClient = getDynamoDBDocumentClient();

    return (
        await dynamoClient.send(
            new GetCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    PK: user.PK,
                    SK: user.SK,
                },
            }),
        )
    ).Item;
};

// Функція для перевірки користувача за його об'єктом
export const verifyUser = async (user: User): Promise<string> => {
    try {
        const dynamoClient = getDynamoDBDocumentClient();

        const savedUser = await getUser(user);

        // Перевірка наявності користувача в базі даних
        if (!savedUser) {
            throw new CustomError(404, "User not found");
        }

        const passVerified = await verifyPassword(user.password, savedUser.password);

        // Перевірка пароля
        if (!passVerified) {
            throw new CustomError(403, "Wrong password provided");
        }

        // Повертає токен для авторизації
        return await genToken(savedUser);
    } catch (error) {
        throw error;
    }
};

// Функція для збереження користувача в базу даних
export const saveUser = async (user: User): Promise<string> => {
    try {
        const dynamoClient = getDynamoDBDocumentClient();

        // Перевірка наявності користувача в базі даних
        const foundUser = (
            await dynamoClient.send(
                new GetCommand({
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        PK: user.PK,
                        SK: user.SK,
                    },
                }),
            )
        ).Item;

        // Якщо користувача не знайдено, зберігає його та повертає токен
        if (!foundUser) {
            user.password = await encryptPassword(user.password);

            await dynamoClient.send(
                new PutCommand({
                    TableName: process.env.TABLE_NAME,
                    Item: user.toItem(),
                }),
            );

            return await genToken(user.toItem());
        } else {
            throw new CustomError(409, "User already exists");
        }
    } catch (error) {
        throw error;
    }
};
