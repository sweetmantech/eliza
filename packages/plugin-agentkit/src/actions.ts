import {
    type Action,
    generateText,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    ModelClass,
    type State,
    composeContext,
    generateObjectV2,
} from "@ai16z/eliza";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit, type Tool } from "@coinbase/cdp-langchain";

type GetAgentKitActionsParams = {
    getClient: () => Promise<CdpAgentkit>;
    config?: {
        networkId?: string;
    };
};

const AVAILABLE_TOOLS = {
    GET_WALLET_DETAILS: "getWalletDetails",
    DEPLOY_NFT: "deployNFT",
    DEPLOY_TOKEN: "deployToken",
    GET_BALANCE: "getBalance",
    MINT_NFT: "mintNFT",
    REGISTER_BASENAME: "registerBasename",
    REQUEST_FAUCET_FUNDS: "requestFaucetFunds",
    TRADE: "trade",
    TRANSFER: "transfer",
    WOW_BUY_TOKEN: "wowBuyToken",
    WOW_SELL_TOKEN: "wowSellToken",
    WOW_CREATE_TOKEN: "wowCreateToken",
} as const;

/**
 * Get all AgentKit actions
 */
export async function getAgentKitActions({
    getClient,
    config,
}: GetAgentKitActionsParams): Promise<Action[]> {
    // Initialize CDP AgentKit Toolkit and get tools
    const agentkit = await getClient();
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();
    console.log("SWEETMAN------------------------");

    // Map each tool to an Eliza action
    const actions = tools.map((tool: Tool) => ({
        name: tool.name.toUpperCase(),
        description: tool.description,
        similes: [],
        validate: async () => true,
        handler: async (
            runtime: IAgentRuntime,
            message: Memory,
            state: State | undefined,
            options?: Record<string, unknown>,
            callback?: HandlerCallback
        ): Promise<boolean> => {
            try {
                const client = await getClient();
                console.log("SWEETMAN CLIENT------------------------", client);
                let currentState =
                    state ?? (await runtime.composeState(message));
                currentState =
                    await runtime.updateRecentMessageState(currentState);

                // Generate parameters based on the tool's schema
                const parameterContext = composeParameterContext(
                    tool,
                    currentState
                );
                const parameters = await generateParameters(
                    runtime,
                    parameterContext,
                    tool
                );

                // Execute the tool based on its type
                const result = await executeToolAction(
                    tool,
                    parameters,
                    client
                );

                // Generate response
                const responseContext = composeResponseContext(
                    tool,
                    result,
                    currentState
                );
                const response = await generateResponse(
                    runtime,
                    responseContext
                );

                callback?.({ text: response, content: result });
                return true;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                callback?.({
                    text: `Error executing action ${tool.name}: ${errorMessage}`,
                    content: { error: errorMessage },
                });
                return false;
            }
        },
        examples: [],
    }));
    console.log("SWEETMAN ACTIONS------------------------", actions);
    return actions;
}

async function executeToolAction(
    tool: Tool,
    parameters: any,
    client: CdpAgentkit
): Promise<unknown> {
    const toolkit = new CdpToolkit(client);
    const tools = toolkit.getTools();
    const selectedTool = tools.find((t) => t.name === tool.name);

    if (!selectedTool) {
        throw new Error(`Tool ${tool.name} not found`);
    }

    return await selectedTool.call(parameters);
}

function composeParameterContext(tool: any, state: State): string {
    const contextTemplate = `{{recentMessages}}

Given the recent messages, extract the following information for the action "${tool.name}":
${tool.description}
`;
    return composeContext({ state, template: contextTemplate });
}

async function generateParameters(
    runtime: IAgentRuntime,
    context: string,
    tool: any
): Promise<unknown> {
    const { object } = await generateObjectV2({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
        schema: tool.schema,
    });

    return object;
}

function composeResponseContext(
    tool: any,
    result: unknown,
    state: State
): string {
    const responseTemplate = `
# Action Examples
{{actionExamples}}

# Knowledge
{{knowledge}}

# Task: Generate dialog and actions for the character {{agentName}}.
About {{agentName}}:
{{bio}}
{{lore}}

{{providers}}

{{attachments}}

# Capabilities
Note that {{agentName}} is capable of reading/seeing/hearing various forms of media, including images, videos, audio, plaintext and PDFs. Recent attachments have been included above under the "Attachments" section.

The action "${tool.name}" was executed successfully.
Here is the result:
${JSON.stringify(result)}

{{actions}}

Respond to the message knowing that the action was successful and these were the previous messages:
{{recentMessages}}
`;
    return composeContext({ state, template: responseTemplate });
}

async function generateResponse(
    runtime: IAgentRuntime,
    context: string
): Promise<string> {
    return generateText({
        runtime,
        context,
        modelClass: ModelClass.LARGE,
    });
}
