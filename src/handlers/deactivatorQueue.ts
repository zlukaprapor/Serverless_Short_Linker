import {SQSEvent, SQSRecord} from "aws-lambda";
import {sendEmail} from "../utilities/sesClient";

interface EmailData {
    user: string;
    longLink: string;
    shortAlias: string;
}

const parseEmailData = (record: SQSRecord): EmailData => {
    try {
        return JSON.parse(record.body) as EmailData;
    } catch (error) {
        throw new Error(`Error parsing SQS record: ${error.message}`);
    }
};

const generateEmailContent = (longLink: string, shortAlias: string): string => {
    return `Short link ${process.env.BASE_URL}${shortAlias} for ${longLink} was deactivated`;
};

const sendDeactivationEmail = async (user: string, longLink: string, shortAlias: string): Promise<void> => {
    try {
        const subject = "Deactivation";
        const message = generateEmailContent(longLink, shortAlias);
        await sendEmail(user, subject, message);
    } catch (error) {
        throw new Error(`Error sending deactivation email: ${error.message}`);
    }
};

export const main = async (event: SQSEvent): Promise<void> => {
    try {
        for (const record of event.Records) {
            const {user, longLink, shortAlias} = parseEmailData(record);
            await sendDeactivationEmail(user, longLink, shortAlias);
        }
    } catch (error) {
        console.error(`Error in SQS event handler: ${error.message}`);
        throw new Error("Internal server error");
    }
};
