import {ScheduledEvent} from "aws-lambda";
import {getLink, updateLink} from "../datasets/link";
import {sendMessageToQueue} from "../utilities/sqsClient";
import {Link} from "../datasets/link";

export const main = async (event: ScheduledEvent): Promise<void> => {
    try {
        const link = await getLinkFromEvent(event);
        await deactivateLink(link);
        await sendDeactivationMessage(link);
    } catch (error) {
        handleError(error);
    }
};

const getLinkFromEvent = async (event: ScheduledEvent): Promise<Link> => {
    try {
        // Логіка отримання посилання з події
        const link = await getLink(event.detail.PK);
        return link;
    } catch (error) {
        throw new Error(`Failed to get link from event: ${error.message}`);
    }
};

const deactivateLink = async (link: Link): Promise<void> => {
    try {
        link.deactivated = true;
        await updateLink(link);
    } catch (error) {
        throw new Error(`Failed to deactivate link: ${error.message}`);
    }
};

const sendDeactivationMessage = async (link: Link): Promise<void> => {
    try {
        await sendMessageToQueue(JSON.stringify(link));
    } catch (error) {
        throw new Error(`Failed to send deactivation message: ${error.message}`);
    }
};

const handleError = (error: any): void => {
    console.error(`Error in scheduled event handler: ${error.message}`);

};
