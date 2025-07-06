"use client";

import React, { useState, useContext } from 'react';
import { ethers, Contract } from 'ethers';
import { ContractContext, SignerContext } from '@/contexts/Web3Context';

type CandidateListProps = {
    candidates: string[];
    isVotingActive: boolean;
};

function CandidateList({ candidates, isVotingActive }: CandidateListProps) {
    const contract = useContext(ContractContext);
    const signer = useContext(SignerContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<{ name: string; index: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleVoteClick = (candidateName: string, candidateIndex: number) => {
        if (!isVotingActive) return;
        setMessage(null); 
        setSelectedCandidate({ name: candidateName, index: candidateIndex });
        setIsModalOpen(true); 
    };

    const handleConfirmVote = async () => {
        if (!contract || !signer || !selectedCandidate) {
            setMessage({ text: "Error: Contract/Signer not available or no candidate selected.", type: 'error' });
            setIsModalOpen(false);
            return;
        }
        setIsLoading(true);
        setMessage(null);
        try {
            const contractWithSigner = contract.connect(signer) as Contract;
            const tx: ethers.TransactionResponse = await contractWithSigner.vote(selectedCandidate.index);
            setMessage({ text: `Transaction sent: ${tx.hash}. Waiting for confirmation...`, type: 'success' });
            await tx.wait();
            setMessage({ text: `Successfully voted for ${selectedCandidate.name}!`, type: 'success' });
        } catch (error: any) {
            let reason = "An unknown error occurred.";
            if (error.reason) reason = error.reason;
            else if (error.data?.message) reason = error.data.message;
            else if (error.message) reason = error.message;

            if (reason.includes("Has no right to vote")) reason = "You do not have the right to vote.";
            else if (reason.includes("Already voted")) reason = "You have already cast your vote.";
            setMessage({ text: `Error: ${reason}`, type: 'error' });
        } finally {
            setIsLoading(false);
            setIsModalOpen(false);
        }
    };

    if (!candidates || candidates.length === 0) {
        return (
            <div className="p-8 border-2 border-slate-600 rounded-2xl w-full max-w-lg">
                <p className="py-2 text-center">Loading candidates...</p>
            </div>
        );
    }

    return (
        <div className="p-8 border-2 border-slate-600 rounded-2xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Candidates</h2>
            <div className="flex flex-col space-y-3">
                {candidates.map((candidate, index) => (
                    <button
                        key={index}
                        onClick={() => handleVoteClick(candidate, index)}
                        className="py-3 px-4 text-lg text-center bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-blue-500 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {candidate}
                    </button>
                ))}
            </div>

            {isLoading && <p className="text-center mt-4">Processing your vote...</p>}
            {message && (
                <div className={`mt-4 p-3 rounded-md text-center break-words ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

        {isModalOpen && selectedCandidate && (
            // Modal backdrop
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                {/* Modal content */}
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                    <h3 className="text-xl font-bold text-center">Confirm Your Vote</h3>
                    <p className="text-center my-4">Are you sure you want to vote for <span className="font-semibold">{selectedCandidate.name}</span>?</p>
                    <div className="flex justify-around mt-6">
                        <button
                            onClick={() => setIsModalOpen(false)} // Just close the modal
                            className="px-6 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmVote} // This will trigger the transaction
                            className={`px-6 py-2 border rounded-md text-white ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Voting...' : 'Yes, Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    );
}

export default CandidateList;