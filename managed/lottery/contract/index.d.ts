import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  deposit_entry(context: __compactRuntime.CircuitContext<PS>,
                secret_salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  draw_winner(context: __compactRuntime.CircuitContext<PS>,
              winning_ticket_0: bigint,
              vrf_reveal_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claim_prize(context: __compactRuntime.CircuitContext<PS>,
              secret_salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  deposit_entry(context: __compactRuntime.CircuitContext<PS>,
                secret_salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  draw_winner(context: __compactRuntime.CircuitContext<PS>,
              winning_ticket_0: bigint,
              vrf_reveal_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claim_prize(context: __compactRuntime.CircuitContext<PS>,
              secret_salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  deposit_entry(context: __compactRuntime.CircuitContext<PS>,
                secret_salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  draw_winner(context: __compactRuntime.CircuitContext<PS>,
              winning_ticket_0: bigint,
              vrf_reveal_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  claim_prize(context: __compactRuntime.CircuitContext<PS>,
              secret_salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly round_id: bigint;
  readonly pot_balance: bigint;
  readonly ticket_count: bigint;
  readonly ticket_price: bigint;
  readonly winning_index: bigint;
  readonly winning_commitment: Uint8Array;
  readonly is_completed: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
