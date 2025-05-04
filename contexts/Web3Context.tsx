import React, { createContext } from 'react';
import { ethers } from 'ethers';

interface IWeb3Context{
    contract: ethers.Contract | null;
    signer: ethers.Signer | null;
}

export const ContractContext = createContext<ethers.Contract | null>(null);
export const SignerContext = createContext<ethers.Signer | null>(null);