import React, { createContext } from 'react';
import { ethers } from 'ethers';

export type VotingState = 'stopped' | 'active' | 'finished';

interface IWeb3Context {
    contract: ethers.Contract | null;
    signer: ethers.Signer | null;
    votingState: VotingState;
    votingDuration: number | null;
    startVote: (durationInSeconds: number) => void;
}

export const Web3Context = createContext<IWeb3Context>({
    contract: null,
    signer: null,
    votingState: 'stopped',
    votingDuration: null,
    startVote: () => { console.error("startVote function not yet initialized"); },
});

export const ContractContext = createContext<ethers.Contract | null>(null);
export const SignerContext = createContext<ethers.Signer | null>(null);