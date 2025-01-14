import type { Plugin } from "@ai16z/eliza";
import { walletProvider, getClient } from "./provider";
import { getAgentKitActions } from "./actions";

export const agentKitPlugin: Plugin = {
    name: "[AgentKit] Integration",
    description: "AgentKit integration plugin",
    providers: [walletProvider],
    evaluators: [],
    services: [],
    actions: await getAgentKitActions({
        getClient,
        config: {
            networkId: "base-sepolia",
        },
    }),
};

export default agentKitPlugin;
