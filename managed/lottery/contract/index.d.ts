import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  enter(context: __compactRuntime.CircuitContext<PS>,
        ticket_0: Uint8Array,
        salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  draw(context: __compactRuntime.CircuitContext<PS>, randomValue_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  claim(context: __compactRuntime.CircuitContext<PS>,
        ticket_0: Uint8Array,
        salt_0: Uint8Array,
        userAddr_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  newRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  enter(context: __compactRuntime.CircuitContext<PS>,
        ticket_0: Uint8Array,
        salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  draw(context: __compactRuntime.CircuitContext<PS>, randomValue_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  claim(context: __compactRuntime.CircuitContext<PS>,
        ticket_0: Uint8Array,
        salt_0: Uint8Array,
        userAddr_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  newRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  commitment(ticket_0: Uint8Array, salt_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  commitment(context: __compactRuntime.CircuitContext<PS>,
             ticket_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  enter(context: __compactRuntime.CircuitContext<PS>,
        ticket_0: Uint8Array,
        salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  draw(context: __compactRuntime.CircuitContext<PS>, randomValue_0: bigint): __compactRuntime.CircuitResults<PS, bigint>;
  claim(context: __compactRuntime.CircuitContext<PS>,
        ticket_0: Uint8Array,
        salt_0: Uint8Array,
        userAddr_0: { bytes: Uint8Array }): __compactRuntime.CircuitResults<PS, []>;
  newRound(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly roundStatus: number;
  readonly entrants: bigint;
  readonly pool: bigint;
  readonly entryFee: bigint;
  entries: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: bigint): boolean;
    lookup(key_0: bigint): Uint8Array;
    [Symbol.iterator](): Iterator<[bigint, Uint8Array]>
  };
  readonly winningIndex: bigint;
  readonly winner: { is_some: boolean, value: { bytes: Uint8Array } };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>, fee_0: bigint): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
