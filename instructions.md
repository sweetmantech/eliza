# Instructions

## goal: create AgentKit plugin

## steps

1. ✅ tell me how to run the project
2. ✅ activate the packages/plugin-goat. tell me how to properly verify the plug in is working.
3. ✅ plan the creation of a new plugin for AgentKit. reference packages/plugin-goat.
4. P1: plugin-agentkit actions.ts - map tools
    - map Agentkit tools
    - enumerate in switch
    - minimize amount of work for net-new action
        - if zero - awesome
        - if 10 min - fine too
    - reference: Reference AgentKit usage (see below)
5. index - add tools
6. index.ts - update for createAgentKitPlugin
7. wallet.ts - update to use AgentKit wallet
8. actions.ts - map the AgentKit tools
    - enumerate in switch
    - minimize amount of work for net-new action
        - if zero - awesome
        - if 10 min - fine too

### running the project

pnpm start --character="characters/recoup.character.json"

### Plugin Structure (based on plugin-goat)

```
packages/plugin-agentkit/
├── src/
│   ├── index.ts       # Main plugin definition and exports
│   ├── provider.ts    # Wallet/authentication provider
│   └── actions.ts     # Tool implementations
├── package.json       # Dependencies and metadata
└── tsconfig.json      # TypeScript configuration
```

### Implementation Plan:

a. **Package Setup**

- Create new package directory `packages/plugin-agentkit`
- Initialize with `package.json` and TypeScript config
- Add dependencies:

```json
{
    "dependencies": {
        "@ai16z/eliza": "workspace:*",
        "agentkit-sdk": "^1.0.0" // Replace with actual SDK
    }
}
```

b. **Provider Implementation (provider.ts)**

- Create AgentKit walletProvider
- Create AkentKit getWalletClient
- Handle API key management
- Implement connection state management
- Follow plugin-goat's provider pattern:

```typescript
export const agentKitProvider: Provider = {
    async get(runtime, message, state): Promise<string | null> {
        // Authentication and state management
    },
};
```

c. **Actions Implementation (actions.ts)**

- Map AgentKit tools to Eliza actions
- Follow plugin-goat's action creation pattern
- Implement parameter handling and response generation
- Structure:

```typescript
export async function getAgentKitActions({
    getClient,
    tools,
    config,
}): Promise<Action[]> {
    // Map tools to actions
}
```

d. **Plugin Definition (index.ts)**

- Export plugin configuration
- Register providers and actions
- Structure:

```typescript
export const agentKitPlugin: Plugin = {
    name: "[AgentKit] Integration",
    description: "AgentKit integration plugin",
    providers: [agentKitProvider],
    actions: [
        ...(await getAgentKitActions({
            getClient,
            tools: [
                /* AgentKit tools */
            ],
            config: {
                /* configuration */
            },
        })),
    ],
};
```

### Reference AgentKit usage

```
import { ChatOpenAI } from "@langchain/openai";
import { LLM_MODEL } from "../consts.js";
import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import validateEnvironment from "./validateEnvironment.js";

// Add this right after imports and before any other code
validateEnvironment();

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: LLM_MODEL,
    });

    // Configure CDP AgentKit with new wallet each time
    const config = {
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    // Initialize CDP AgentKit with new wallet
    const agentkit = await CdpAgentkit.configureWithWallet(config);

    const walletAddress = await agentkit.wallet.addresses[0].id;

    // Initialize CDP AgentKit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();
    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "AgentKit Launchpad" },
    };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
          You are an AI Musician Agent designed to help musicians promote and manage their latest music releases using onchain technology. Your primary goal is to assist musicians in running successful campaigns for their latest singles.

          Core capabilities:
          - Create and manage NFT collections for music releases
          - Set up and manage onchain wallets for music revenue
          - Deploy social tokens for fan engagement
          - Handle smart contracts for music rights
          - Manage promotional campaigns for releases

          If you ever need funds, you can request them from the faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request funds from the user. Before executing your first action, get the wallet details to see what network you're on.

          If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more information.

          Be concise and helpful with your responses. Focus on music industry-specific use cases and explain onchain concepts in terms that musicians would understand. Refrain from restating your tools' descriptions unless explicitly requested.
          `,
    });

    // Get wallet address to return
    return { agent, config: agentConfig, walletAddress };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

export default initializeAgent;
```
