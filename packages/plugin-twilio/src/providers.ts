import { IAgentRuntime } from "@elizaos/core";

export interface TwilioConfig {
    accountSid: string;
    authToken: string;
    fromNumber: string;
}

export function getConfig(runtime: IAgentRuntime): TwilioConfig {
    const accountSid = runtime.settings?.secrets?.TWILIO_ACCOUNT_SID;
    const authToken = runtime.settings?.secrets?.TWILIO_AUTH_TOKEN;
    const fromNumber = runtime.settings?.secrets?.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Missing required Twilio configuration");
    }

    return { accountSid, authToken, fromNumber };
}
