import { type Provider, type IAgentRuntime } from "@ai16z/eliza";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";

export async function getClient(): Promise<CdpAgentkit> {
    const config = {
        networkId: "base-sepolia",
    };
    return await CdpAgentkit.configureWithWallet(config);
}

export const walletProvider: Provider = {
    async get(runtime: IAgentRuntime): Promise<string | null> {
        try {
            const client = await getClient();
            const address = (await (client as any).wallet.addresses)[0].id;
            return `AgentKit Wallet Address: ${address}`;
        } catch (error) {
            console.error("Error in AgentKit provider:", error);
            return null;
        }
    },
};
