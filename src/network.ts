export interface NetworkConfig {
  name: 'preview' | 'preprod' | 'undeployed' | 'local';
  nodeUrl: string;
  indexerUrl: string;
  proofServerUrl: string;
  faucetUrl: string;
}

export const PREVIEW_NETWORK_CONFIG: NetworkConfig = {
  name: 'preview',
  nodeUrl: 'https://rpc.preview.midnight.network',
  indexerUrl: 'https://indexer.preview.midnight.network',
  proofServerUrl: 'https://proof.preview.midnight.network',
  faucetUrl: 'https://faucet.preview.midnight.network',
};

export const PREPROD_NETWORK_CONFIG: NetworkConfig = {
  name: 'preprod',
  nodeUrl: 'https://rpc.preprod.midnight.network',
  indexerUrl: 'https://indexer.preprod.midnight.network',
  proofServerUrl: 'https://proof.preprod.midnight.network',
  faucetUrl: 'https://faucet.preprod.midnight.network',
};

export const LOCAL_NETWORK_CONFIG: NetworkConfig = {
  name: 'local',
  nodeUrl: 'http://localhost:9944',
  indexerUrl: 'http://localhost:8088',
  proofServerUrl: 'http://localhost:6300',
  faucetUrl: 'http://localhost:8080/faucet',
};

export function getNetworkConfig(networkName: string = process.env.MIDNIGHT_NETWORK || 'preview'): NetworkConfig {
  if (networkName === 'local') {
    return LOCAL_NETWORK_CONFIG;
  }
  if (networkName === 'preprod') {
    return PREPROD_NETWORK_CONFIG;
  }
  return PREVIEW_NETWORK_CONFIG;
}
