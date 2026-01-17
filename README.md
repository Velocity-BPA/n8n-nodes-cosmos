# n8n-nodes-cosmos

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Cosmos Hub blockchain providing 12 resources and 80+ operations for ATOM transactions, staking, governance, and IBC cross-chain transfers. Includes real-time WebSocket triggers for blockchain event monitoring.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Cosmos](https://img.shields.io/badge/Cosmos-Hub-2E3148)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

### Action Node (Cosmos)
- **12 Resource Categories**: Account, Staking, Distribution, Governance, IBC Transfer, Bank, Auth, Slashing, Mint, Transaction, Block, Tendermint
- **80+ Operations**: Complete coverage of Cosmos SDK modules
- **Transaction Signing**: Full support for sending transactions with mnemonic-based signing
- **IBC Transfers**: Pre-configured channels for 12 major Cosmos chains
- **Real-time Data**: Query account balances, staking info, governance proposals, and more

### Trigger Node (Cosmos Trigger)
- **WebSocket Events**: Real-time blockchain event monitoring
- **20 Event Types**: New blocks, transactions, transfers, delegations, governance, IBC, and more
- **Custom Queries**: Build your own Tendermint event queries
- **Auto-reconnection**: Resilient WebSocket connections

## Installation

### Community Nodes (Recommended)

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-cosmos`
4. Accept the risks and install

### Manual Installation

```bash
# Navigate to your n8n installation directory
cd ~/.n8n

# Install the package
npm install n8n-nodes-cosmos
```

### Development Installation

```bash
# Clone or extract the package
cd n8n-nodes-cosmos

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-cosmos

# Restart n8n
```

## Credentials Setup

### Cosmos Network (Required)

| Field | Description | Example |
|-------|-------------|---------|
| Network | Select Mainnet, Testnet, or Custom | `Mainnet` |
| Mnemonic | 24-word BIP39 recovery phrase | `word1 word2 ... word24` |
| HD Path | Derivation path (Cosmos standard) | `m/44'/118'/0'/0/0` |
| Gas Price | Transaction gas price in uatom | `0.025` |
| Gas Adjustment | Multiplier for gas estimation | `1.3` |

**Custom Network Fields** (when Network = Custom):
| Field | Description |
|-------|-------------|
| LCD Endpoint | REST API URL |
| RPC Endpoint | Tendermint RPC URL |
| WebSocket Endpoint | WebSocket URL for triggers |
| Address Prefix | Bech32 prefix |

## Resources & Operations

### Account
| Operation | Description |
|-----------|-------------|
| Get Account Info | Retrieve account details |
| Get Balance | Get ATOM balance |
| Get All Balances | Get all token balances |
| Transfer | Send ATOM |
| Transfer Token | Send any token by denom |
| Validate Address | Check address format |
| Get Delegations | View staking delegations |
| Get Unbonding | View unbonding delegations |
| Get Redelegations | View redelegations |
| Get Rewards | View staking rewards |

### Staking
| Operation | Description |
|-----------|-------------|
| Get Validators | List all validators |
| Get Validator | Get validator details |
| Get Validator Delegations | List delegations to validator |
| Delegate | Stake ATOM to validator |
| Undelegate | Unstake ATOM (21-day unbonding) |
| Redelegate | Move stake between validators |
| Get Delegation | Get specific delegation |
| Get Unbonding Delegation | Get unbonding details |
| Get Staking Pool | View total bonded/unbonded |
| Get Staking Params | Get staking parameters |

### Distribution
| Operation | Description |
|-----------|-------------|
| Get Delegation Rewards | Get rewards from validator |
| Get All Rewards | Get total pending rewards |
| Withdraw Rewards | Claim rewards from validator |
| Withdraw All Rewards | Claim all rewards |
| Get Withdraw Address | Get reward destination |
| Get Community Pool | View community pool |
| Get Validator Commission | Get validator commission |
| Get Delegator Validators | List delegated validators |

### Governance
| Operation | Description |
|-----------|-------------|
| Get Proposals | List governance proposals |
| Get Proposal | Get proposal details |
| Get Proposal Deposits | List deposits |
| Get Proposal Votes | List votes |
| Get Proposal Tally | Get vote count |
| Vote | Cast vote (Yes/No/Abstain/NoWithVeto) |
| Get Vote | Get specific vote |
| Get Gov Params | Get governance parameters |

### IBC Transfer
| Operation | Description |
|-----------|-------------|
| IBC Transfer | Send to another chain (pre-configured) |
| IBC Transfer Direct | Send via specific channel |
| Get Channels | List IBC channels |
| Get Channel | Get channel details |
| Get Connections | List IBC connections |
| Get Connection | Get connection details |
| Get Clients | List light clients |
| Get Denom Trace | Trace IBC token origin |
| Get Denom Traces | List all denom traces |
| Get Available Destinations | List pre-configured chains |

### Bank
| Operation | Description |
|-----------|-------------|
| Get Total Supply | Total token supply |
| Get Supply Of | Supply of specific denom |
| Get Denom Metadata | Denomination metadata |
| Get All Denom Metadata | List all metadata |
| Get Spendable Balances | Spendable account balances |
| Get Send Enabled | Check send status |

### Auth
| Operation | Description |
|-----------|-------------|
| Get Account | Account with auth info |
| Get Accounts | List all accounts |
| Get Module Accounts | List module accounts |
| Get Module Account | Get specific module account |
| Get Params | Auth module parameters |

### Slashing
| Operation | Description |
|-----------|-------------|
| Get Signing Infos | Validator signing info |
| Get Signing Info | Specific validator info |
| Get Slashing Params | Slashing parameters |

### Mint
| Operation | Description |
|-----------|-------------|
| Get Inflation | Current inflation rate |
| Get Annual Provisions | Annual provisions |
| Get Mint Params | Mint parameters |

### Transaction
| Operation | Description |
|-----------|-------------|
| Get Transaction | Get by hash |
| Get Transactions by Events | Search by events |
| Search Transactions | RPC-based search |
| Get Transactions by Height | Block transactions |
| Simulate | Estimate gas |
| Broadcast Transaction | Submit transaction |

### Block
| Operation | Description |
|-----------|-------------|
| Get Latest Block | Most recent block |
| Get Block by Height | Block at height |
| Get Block Results | Block events/results |
| Get Validator Set | Validators at height |
| Get Latest Validator Set | Current validators |
| Get Blockchain | Block range info |

### Tendermint
| Operation | Description |
|-----------|-------------|
| Get Node Info | Node information |
| Get Sync Status | Sync progress |
| Get Net Info | Network peers |
| Get Health | Node health |
| Get Status | Full node status |
| Get Genesis | Chain genesis |
| Get Consensus State | Consensus info |
| Get Consensus Params | Consensus parameters |
| Get Unconfirmed Txs | Mempool transactions |
| ABCI Info | ABCI application info |

## Trigger Node Events

| Event | Description |
|-------|-------------|
| New Block | Every new block |
| New Transaction | Every transaction |
| Transfer Received | ATOM received at address |
| Transfer Sent | ATOM sent from address |
| Delegation Created | New delegation |
| Delegation Updated | Delegation changed |
| Undelegation Started | Unbonding initiated |
| Undelegation Completed | Unbonding finished |
| Redelegation Started | Stake moved |
| Rewards Withdrawn | Rewards claimed |
| Proposal Created | New proposal |
| Proposal Voting Started | Voting period started |
| Proposal Voted | Vote cast |
| Proposal Passed | Proposal approved |
| Proposal Rejected | Proposal rejected |
| IBC Transfer Sent | Outgoing IBC transfer |
| IBC Transfer Received | Incoming IBC transfer |
| Validator Slashed | Slashing event |
| Validator Jailed | Validator jailed |
| Custom Query | Custom Tendermint query |

## Usage Examples

### Check Balance

```javascript
// Configure Cosmos node with:
// Resource: Account
// Operation: Get Balance
// Address: cosmos1abc...
```

### Delegate to Validator

```javascript
// Configure Cosmos node with:
// Resource: Staking
// Operation: Delegate
// Validator Address: cosmosvaloper1...
// Amount: 10 (ATOM)
// Memo: "Staking via n8n"
```

### IBC Transfer to Osmosis

```javascript
// Configure Cosmos node with:
// Resource: IBC Transfer
// Operation: IBC Transfer
// Destination Chain: Osmosis
// Receiver: osmo1abc...
// Amount: 5 (ATOM)
```

### Monitor Transfers

```javascript
// Configure Cosmos Trigger with:
// Event Type: Transfer Received
// Watch Address: cosmos1abc...
```

## Cosmos Hub Concepts

### ATOM Token
- Native staking token of Cosmos Hub
- Denomination: `uatom` (micro-ATOM)
- 1 ATOM = 1,000,000 uatom
- Used for staking, governance, and transaction fees

### Staking
- Delegate ATOM to validators to earn rewards
- 21-day unbonding period when undelegating
- Redelegation moves stake instantly between validators
- Slashing risk if validator misbehaves

### Governance
- Proposals require deposit to enter voting
- Voting period typically 14 days
- Vote options: Yes, No, Abstain, NoWithVeto
- NoWithVeto votes can block proposals

### IBC (Inter-Blockchain Communication)
- Cross-chain token transfers
- Channels connect chains
- Timeout ensures funds return if transfer fails
- Pre-configured channels for major chains

## Networks

| Network | Chain ID | LCD Endpoint |
|---------|----------|--------------|
| Mainnet | cosmoshub-4 | https://rest.cosmos.directory/cosmoshub |
| Testnet | theta-testnet-001 | https://rest.state-sync-01.theta-testnet.polypore.xyz |

## IBC Destinations

| Chain | Channel | Prefix |
|-------|---------|--------|
| Osmosis | channel-141 | osmo |
| Juno | channel-207 | juno |
| Secret Network | channel-235 | secret |
| Stargaze | channel-730 | stars |
| Noble | channel-536 | noble |
| Akash | channel-184 | akash |
| Kava | channel-277 | kava |
| Injective | channel-220 | inj |
| Stride | channel-391 | stride |
| Celestia | channel-617 | celestia |
| dYdX | channel-750 | dydx |
| Neutron | channel-569 | neutron |

## Error Handling

The node handles common Cosmos errors:

| Code | Description | Resolution |
|------|-------------|------------|
| 4 | Insufficient funds | Check balance |
| 5 | Unauthorized | Verify mnemonic/address |
| 11 | Out of gas | Increase gas adjustment |
| 12 | Memo too large | Keep memo under 256 bytes |
| 13 | Insufficient fee | Increase gas price |
| 19 | TX in mempool | Wait and retry |
| 32 | Wrong sequence | Retry transaction |

## Security Best Practices

1. **Protect Your Mnemonic**: Never share your 24-word phrase
2. **Use Testnet First**: Test workflows on testnet before mainnet
3. **Monitor Transactions**: Set up alerts for unexpected activity
4. **Limit Funds**: Use dedicated wallets with limited funds for automation
5. **Secure n8n Instance**: Protect your n8n installation

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode
npm run dev
```

## Project Structure

```
n8n-nodes-cosmos/
├── credentials/           # Credential definitions
├── nodes/
│   └── Cosmos/
│       ├── Cosmos.node.ts        # Main action node
│       ├── CosmosTrigger.node.ts # Trigger node
│       ├── actions/              # Resource actions
│       ├── transport/            # API clients
│       ├── constants/            # Configuration
│       └── utils/                # Utilities
├── test/                  # Test files
├── scripts/               # Build scripts
└── package.json
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Cosmos SDK Docs](https://docs.cosmos.network/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-cosmos/issues)
- **Commercial Support**: licensing@velobpa.com

## Acknowledgments

- [Cosmos SDK](https://github.com/cosmos/cosmos-sdk) - Blockchain framework
- [CosmJS](https://github.com/cosmos/cosmjs) - JavaScript SDK
- [n8n](https://n8n.io) - Workflow automation platform
- [Cosmos Directory](https://cosmos.directory) - RPC endpoints
