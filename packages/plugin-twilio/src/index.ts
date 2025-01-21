import { Plugin } from "@elizaos/core";
import { MAKE_CALL } from "./actions";

export const twilioPlugin: Plugin = {
    name: "Twilio Integration",
    description: "Enables outbound phone calls using Twilio",
    providers: [],
    evaluators: [],
    services: [],
    actions: [MAKE_CALL],
};

export default twilioPlugin;
