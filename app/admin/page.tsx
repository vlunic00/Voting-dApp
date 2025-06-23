"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting after starting the vote
import { Web3Context } from '@/contexts/Web3Context'; // Adjust path if needed
import { ContractContext, SignerContext } from '@/contexts/Web3Context'; // Assuming you kept separate contexts

const AdminPage: React.FC = () => {
    // If you have a single Web3Context
    // const { signer, contract, startVote } = useContext(Web3Context);

    // If you have separate contexts
    const contract = useContext(ContractContext);
    const signer = useContext(SignerContext);
    // You'll need to get startVote from the main context or pass it down

    // For this example, let's assume you've combined them into Web3Context
    const { startVote } = useContext(Web3Context);


    // --- Local state for this page ---
    const [durationMinutes, setDurationMinutes] = useState<string>('5');
    const [isLoading, setIsLoading] = useState(false);
    const [isChairperson, setIsChairperson] = useState<boolean | null>(null);
    const router = useRouter(); // Hook to programmatically navigate

    // Verify chairperson status
    useEffect(() => {
        const checkStatus = async () => {
            if (contract && signer) {
                try {
                    const chairpersonAddr = await contract.chairperson();
                    const signerAddr = await signer.getAddress();
                    setIsChairperson(chairpersonAddr.toLowerCase() === signerAddr.toLowerCase());
                } catch {
                    setIsChairperson(false);
                }
            }
        };
        checkStatus();
    }, [contract, signer]);


    const handleStartClick = () => {
        setIsLoading(true);
        const duration = parseInt(durationMinutes, 10);
        if (isNaN(duration) || duration <= 0) {
            alert("Please enter a valid, positive number for the duration.");
            setIsLoading(false);
            return;
        }

        // Call the globally shared startVote function from the context
        startVote(duration * 60);

        // Redirect the chairperson to the homepage to see the active election
        router.push('/');
    };

    // Render loading or unauthorized state
    if (isChairperson === null) {
        return <div className="flex justify-center items-center h-screen"><p>Verifying authorization...</p></div>;
    }
    if (isChairperson === false) {
        return <div className="flex justify-center items-center h-screen"><p>You are not authorized to view this page.</p></div>;
    }

    // Render the admin panel if authorized
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-lg p-8 text-center bg-white border-2 border-blue-600 rounded-2xl shadow-xl">
                <h1 className="text-3xl font-bold mb-4">Election Admin Panel</h1>
                <p className="mb-6 text-gray-700">Set the duration and start the election.</p>
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-3">
                        <label htmlFor="duration" className="font-semibold text-lg">Voting Duration:</label>
                        <input
                            id="duration"
                            type="number"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            className="p-2 border-2 rounded-md w-24 text-center text-lg"
                            min="1"
                            disabled={isLoading}
                        />
                        <span className="font-semibold text-lg">Minutes</span>
                    </div>
                    <button
                        onClick={handleStartClick}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-blue-500 text-white font-bold text-lg rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300"
                    >
                        {isLoading ? "Starting..." : "Start Voting Period"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;