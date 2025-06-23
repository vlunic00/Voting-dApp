"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3Context, VotingState } from '@/contexts/Web3Context';
import BallotABI from '@/contracts/build/contracts/Ballot.json';

interface Web3ProviderProps {
    children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    const [votingState, setVotingState] = useState<VotingState>('stopped');
    const [votingDuration, setVotingDuration] = useState<number | null>(null);

    useEffect(() => {
        const connectWallet = async () => {
            if (typeof window.ethereum === 'undefined') {
                console.error("Ethereum provider not detected. Please install MetaMask.");
                return;
            }

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);

                await provider.send("eth_requestAccounts", []);

                const signerInstance = await provider.getSigner();

                console.log("Wallet connected. Signer address:", await signerInstance.getAddress());
                setSigner(signerInstance);

            } catch (err: any) {
                console.error("Error connecting wallet:", err);
                setSigner(null);
            }
        };

        connectWallet();

        const handleAccountsChanged = () => {
            window.location.reload();
        };

        window.ethereum?.on('accountsChanged', handleAccountsChanged);

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        };

    }, []);


    useEffect(() => {
        const initializeContract = () => {
            if (signer) {
                const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
                if (!contractAddress) {
                    console.error("Contract address environment variable is not set.");
                    return;
                }
                try {
                    const contractInstance = new ethers.Contract(contractAddress, BallotABI.abi, signer);
                    setContract(contractInstance);
                    console.log("Contract initialized successfully.");
                } catch (err: any) {
                    console.error("Error initializing contract:", err);
                    setContract(null);
                }
            } else {
                setContract(null);
            }
        };

        initializeContract();

    }, [signer]);


    const startVote = (durationInSeconds: number) => {
        if (votingState === 'stopped') {
            console.log(`Vote started by admin for ${durationInSeconds} seconds.`);
            setVotingDuration(durationInSeconds);
            setVotingState('active');
        }
    };

    const contextValue = {
        signer,
        contract,
        votingState,
        votingDuration,
        startVote
    };

    return (
        <Web3Context.Provider value={contextValue}>
            {children}
        </Web3Context.Provider>
    );
};
