"use client";

import React, { FormEvent, useEffect, useState } from 'react';
import { Contract, ethers, isAddress } from 'ethers';
import { ContractContext, SignerContext } from '@/contexts/Web3Context';

const GiveRightsPage: React.FC = () => {
    
    const contract = React.useContext(ContractContext);
    const signer = React.useContext(SignerContext);

    const [voterAddress, setVoterAddress] = useState<string>('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [chairpersonAddr, setChairpersonAddr] = useState<string | null>(null);
    const [isSignerChairperson, setIsSignerChairperson] = useState<boolean | null>(null);
    
    useEffect(() => {
        const checkChairpersonStatus = async () => {
            if (contract && signer) {
                try {
                    const fetchedChairpersonAddr = await contract.chairperson();
                    setChairpersonAddr(fetchedChairpersonAddr);
                    const currentSignerAddr = await signer.getAddress();
                    setIsSignerChairperson(currentSignerAddr.toLowerCase() === fetchedChairpersonAddr.toLowerCase());
                    console.log("Chairperson address:", fetchedChairpersonAddr);
                    console.log("Current signer:", currentSignerAddr);
                    console.log("Is signer chairperson?", currentSignerAddr.toLowerCase() === fetchedChairpersonAddr.toLowerCase());
                } catch (error) {
                    console.error("Failed to fetch chairperson/signer details:", error);
                    setMessage({ text: "Could not verify chairperson status.", type: 'error' });
                    setIsSignerChairperson(false);
                }
            } else {
                setIsSignerChairperson(null); // Reset if contract/signer not available
            }
        };
        checkChairpersonStatus();
    }, [contract, signer]);

    const handleGrantRights = async (event: FormEvent) => {
        event.preventDefault(); 
        setMessage(null);       

        // 1. Check if prerequisites are met
        if (!signer) {
            setMessage({ text: "Wallet not connected. Please connect as chairperson.", type: 'error' });
            return;
        }
        if (!contract) {
            setMessage({ text: "Contract not loaded. Please wait or reconnect.", type: 'error' });
            return;
        }
        // 2. Validate the input address
        if (!isAddress(voterAddress)) {
            setMessage({ text: "Invalid Ethereum address entered.", type: 'error' });
            return;
        }

        try {
            if (isSignerChairperson === false) {
                throw new Error("Only the chairperson can grant voting rights.");
            }
            if (isSignerChairperson === null) { 
                setMessage({ text: "Verifying chairperson status, please wait...", type: 'error' });
                return;
            }


            // 4. Call the contract function
            console.log(`Attempting to grant voting right to: ${voterAddress}`);
            const contractWithSigner = contract.connect(signer) as Contract;

            const tx: ethers.TransactionResponse = await contractWithSigner.giveRightToVote(voterAddress);

            setMessage({ text: `Transaction sent: ${tx.hash}. Waiting for confirmation...`, type: 'success' });
            console.log("Transaction sent:", tx.hash);

            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log("Transaction confirmed:", receipt);

            // --- Verification Step ---
            console.log(`Verifying voting rights for ${voterAddress} after transaction...`);
            const voterData = await contract.voters(voterAddress); // Call the public 'voters' mapping getter
            console.log("Voter data from contract:", voterData);

            const currentWeight = voterData.weight;
            console.log(`Current weight for ${voterAddress}: ${currentWeight.toString()}`);

            if (currentWeight.toString() === "1") {
                setMessage({ text: `Successfully granted voting right to ${voterAddress}! Verified.`, type: 'success' });
                console.log("Verification successful: Voter has the expected weight of 1.");
            } else {
                setMessage({ text: `Voting right granted to ${voterAddress}, but verification shows unexpected weight: ${currentWeight.toString()}`, type: 'error' });
                console.warn("Verification warning: Voter weight is not 1 after transaction.");
            }
            setVoterAddress(''); // Clear input field on success/attempt

        } catch (error: any) {
            console.error("Error granting voting right:", error);
            let reason = "An unknown error occurred.";
            if (error.reason) {
                reason = error.reason;
            } else if (error.data?.message) {
                 reason = error.data.message;
            } else if (error.message) {
                reason = error.message;
            }
            // Improve user feedback for known contract reverts
            if (reason.includes("Only chairperson can perform this action")) {
                 reason = "Authorization Failed: You are not the chairperson.";
            } else if (reason.includes("Voter already has voting rights")) {
                 reason = "Action Failed: This address already has voting rights.";
            }
            setMessage({ text: `Error: ${reason}`, type: 'error' });
        }
    };

    // Handle initial loading state of context values
    if (isSignerChairperson === null && (contract && signer)) { // contract and signer might be initially null
        return (
            <div className='flex flex-col justify-center items-center h-screen'>
                <p className='text-xl'>Verifying chairperson status...</p>
            </div>
        );
    }
    if (!contract || !signer) {
         return (
            <div className='flex flex-col justify-center items-center h-screen'>
                <p className='text-xl'>Connecting to blockchain services...</p>
                <p className='text-sm mt-2'>Please ensure your wallet (e.g., MetaMask) is connected and on the correct network.</p>
            </div>
        );
    }

    return (
        <div className='flex flex-col justify-center items-center h-screen p-4'>
            <h1 className='text-4xl mb-2'>Give Voting Rights</h1>
            {chairpersonAddr && (
                <p className='text-xs text-gray-500 mb-1'>
                    Chairperson: {chairpersonAddr}
                    {isSignerChairperson !== null && (
                        isSignerChairperson
                            ? <span className="ml-2 text-green-600">(You are the chairperson)</span>
                            : <span className="ml-2 text-red-600">(You are NOT the chairperson)</span>
                    )}
                </p>
            )}


            <form onSubmit={handleGrantRights} className='flex flex-col mt-5 w-full max-w-md'>
                 <label htmlFor="voterAddressInput" className="mb-1 text-sm font-medium text-gray-700 self-start">
                    Voter Address:
                </label>
                <input
                    id="voterAddressInput"
                    type="text"
                    placeholder="Enter address (0x...)"
                    value={voterAddress}
                    onChange={(e) => setVoterAddress(e.target.value)}
                    className='border-2 border-gray-300 p-2 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none'
                    disabled={isSignerChairperson === false}
                    required
                />
                <button
                    type="submit"
                    disabled={!contract || !signer || isSignerChairperson === false}
                    className={`mt-3 bg-blue-500 text-white p-2 rounded-md font-semibold transition duration-150 ease-in-out ${
                        !contract || !signer || isSignerChairperson === false
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-blue-600'
                    }`}
                >Give Voting Rights</button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded-md w-full max-w-md text-center break-words ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default GiveRightsPage;