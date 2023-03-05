import type { Chain } from '@wagmi/core';
import { InjectedConnector } from '@wagmi/core';
import { CoinbaseWalletConnector } from '@wagmi/core/connectors/coinbaseWallet';
import { WalletConnectConnector } from '@wagmi/core/connectors/walletConnect';
import type { ModalConnectorsOpts, WalletConnectProviderOpts } from './types';
export declare const NAMESPACE = "eip155";
export declare function walletConnectProvider<C extends Chain>({ projectId }: WalletConnectProviderOpts): import("@wagmi/core/dist/index-35b6525c").C<C, import("@ethersproject/providers").JsonRpcProvider, import("@ethersproject/providers").WebSocketProvider>;
export declare function modalConnectors({ appName, chains, version, projectId }: ModalConnectorsOpts): (WalletConnectConnector | InjectedConnector | CoinbaseWalletConnector)[];
