import { Action, IAgentRuntime, HandlerCallback } from "@elizaos/core";
import { Twilio } from "twilio";
import { getConfig } from "./providers";
import { extractPhoneNumber } from "./extractors";

export const MAKE_CALL: Action = {
    name: "MAKE_CALL",
    description: "Make an outbound phone call using Twilio",
    similes: ["call", "dial", "phone"],
    validate: async () => true,
    handler: async (
        runtime: IAgentRuntime,
        message: any,
        state: any,
        options: any,
        callback?: HandlerCallback
    ) => {
        try {
            const config = getConfig(runtime);
            const client = new Twilio(config.accountSid, config.authToken);

            // Extract phone number from message
            const toNumber = extractPhoneNumber(message.text);
            if (!toNumber) {
                throw new Error("No valid phone number found in message");
            }

            // Create TwiML for the call
            const twiml = `
                <Response>
                    <Say>Hello, this is ${runtime.character.name}. ${message.text}</Say>
                </Response>
            `;

            // Make the call
            const call = await client.calls.create({
                to: toNumber,
                from: config.fromNumber,
                twiml: twiml,
            });

            const response = `Initiated call to ${toNumber} (Call SID: ${call.sid})`;
            callback?.({ text: response, content: call });
            return true;
        } catch (error) {
            console.error("Error making Twilio call:", error);
            callback?.({
                text: `Failed to make call: ${error.message}`,
                content: { error: error.message },
            });
            return false;
        }
    },
};
