"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { Web3Context, VotingState } from '@/contexts/Web3Context'; // Adjust path
import BallotABI from '@/contracts/build/contracts/Ballot.json'; // Adjust path to your ABI

// Define the props for the provider component
interface Web3ProviderProps {
    children: ReactNode; // To wrap other components
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
    // State for ethers objects
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    // Global state for the election, managed here
    const [votingState, setVotingState] = useState<VotingState>('stopped');
    const [votingDuration, setVotingDuration] = useState<number | null>(null);

    // --- EFFECT 1: Connect to Wallet and Set Signer ---
    useEffect(() => {
        const connectWallet = async () => {
            // Check if MetaMask (or another EIP-1193 provider) is installed
            if (typeof window.ethereum === 'undefined') {
                console.error("Ethereum provider not detected. Please install MetaMask.");
                // Optionally, set an error state here to show in the UI
                return;
            }

            try {
                // Use ethers.BrowserProvider to wrap the window.ethereum object
                // This is the modern standard for ethers v6 and replaces Web3Provider from v5
                const provider = new ethers.BrowserProvider(window.ethereum);

                // Request account access from the user
                await provider.send("eth_requestAccounts", []);

                // Get the signer, which represents the connected account
                const signerInstance = await provider.getSigner();

                console.log("Wallet connected. Signer address:", await signerInstance.getAddress());
                setSigner(signerInstance);

            } catch (err: any) {
                console.error("Error connecting wallet:", err);
                // Handle errors, such as user rejecting the connection request
                setSigner(null);
            }
        };

        connectWallet();

        // Optional: Add listeners for account or network changes
        const handleAccountsChanged = () => {
            // Reload the page to re-initialize the connection state
            window.location.reload();
        };

        window.ethereum?.on('accountsChanged', handleAccountsChanged);

        // Cleanup function to remove the listener
        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        };

    }, []); // The empty dependency array ensures this runs only once on mount


    // --- EFFECT 2: Initialize Contract once Signer is Available ---
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
                // If signer is null (e.g., wallet disconnected), clear the contract
                setContract(null);
            }
        };

        initializeContract();

    }, [signer]); // This effect re-runs whenever the signer state changes


    // --- Function to control the election state, passed via context ---
    const startVote = (durationInSeconds: number) => {
        // Only allow starting if the vote is currently stopped
        if (votingState === 'stopped') {
            console.log(`Vote started by admin for ${durationInSeconds} seconds.`);
            setVotingDuration(durationInSeconds);
            setVotingState('active');
        }
    };

    // The value provided to all consuming components
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
