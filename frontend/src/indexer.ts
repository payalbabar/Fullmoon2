export interface ContractIndexerState {
  contractAddress: string;
  round_id: number;
  pot_balance: bigint;
  ticket_count: number;
  ticket_price: bigint;
  winning_index: number;
  winning_commitment: string;
  is_completed: boolean;
  lastUpdated: string;
}

export async function fetchLiveIndexerState(
  contractAddress: string,
  indexerUrl: string = import.meta.env.VITE_INDEXER_URL || 'https://indexer.preview.midnight.network'
): Promise<ContractIndexerState> {
  // Live Midnight Indexer GraphQL Query
  const query = `
    query GetContractState($address: String!) {
      contract(address: $address) {
        address
        state {
          round_id
          pot_balance
          ticket_count
          ticket_price
          winning_index
          winning_commitment
          is_completed
        }
      }
    }
  `;

  const response = await fetch(indexerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { address: contractAddress },
    }),
  });

  if (!response.ok) {
    throw new Error(`Indexer fetch failed with status ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`Indexer GraphQL error: ${result.errors[0]?.message}`);
  }

  if (result.data && result.data.contract && result.data.contract.state) {
    const s = result.data.contract.state;
    return {
      contractAddress,
      round_id: Number(s.round_id || 1),
      pot_balance: BigInt(s.pot_balance || 0),
      ticket_count: Number(s.ticket_count || 0),
      ticket_price: BigInt(s.ticket_price || 1000000),
      winning_index: Number(s.winning_index || 0),
      winning_commitment: s.winning_commitment || '0'.repeat(64),
      is_completed: Boolean(s.is_completed),
      lastUpdated: new Date().toLocaleTimeString(),
    };
  }
  
  // Return default state if contract hasn't initialized state on-chain yet
  return {
    contractAddress,
    round_id: 1,
    pot_balance: 0n,
    ticket_count: 0,
    ticket_price: 1000000n,
    winning_index: 0,
    winning_commitment: '0'.repeat(64),
    is_completed: false,
    lastUpdated: new Date().toLocaleTimeString(),
  };
}
