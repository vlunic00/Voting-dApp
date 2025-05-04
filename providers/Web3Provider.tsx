"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { ContractContext, SignerContext } from '../contexts/Web3Context';
import Ballot from '../contracts/build/contracts/Ballot.json';

interface Web3ProviderProps {
    children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        const connectWallet = async () => {
                if (typeof window.ethereum !== 'undefined') {
                  try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
            
                    const newProvider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(newProvider);
            
                    const newSigner = await newProvider.getSigner();
                    setSigner(newSigner);
                    console.log("Signer set!")
                  } catch (error) {
                    console.error('Error initializing provider/signer:', error);
                  }
                } else {
                  console.error('MetaMask or other Ethereum provider not found');
                }
              }
              connectWallet();
        }, []);

    useEffect(() => {
        async function initializeContract(){
            const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
            if(!contractAddress){
              console.error("Contract address is not set in environment variables.")
              return;
            }
            if(signer){
        
              const newContractInstance = new ethers.Contract(contractAddress, Ballot.abi, signer)
              setContract(newContractInstance)
              console.log(newContractInstance);            }
            else{
              console.error("No signer for the contract!")
              return;
            }
          }

          initializeContract();
    }, [signer]);

    return (
        <ContractContext.Provider value={contract}>
            <SignerContext.Provider value={signer}>
                {children}
            </SignerContext.Provider>
        </ContractContext.Provider>
    );
};




