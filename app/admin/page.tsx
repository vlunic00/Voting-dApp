"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Web3Context } from '@/contexts/Web3Context';
import { ContractContext, SignerContext } from '@/contexts/Web3Context';

const AdminPage: React.FC = () => {

    const contract = useContext(ContractContext);
    const signer = useContext(SignerContext);

    const { startVote } = useContext(Web3Context);

    const [durationMinutes, setDurationMinutes] = useState<string>('5');
    const [isLoading, setIsLoading] = useState(false);
    const [isChairperson, setIsChairperson] = useState<boolean | null>(null);
    const router = useRouter();

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

        startVote(duration * 60);

        router.push('/');
    };

    if (isChairperson === null) {
        return <div className="flex justify-center items-center h-screen"><p>Verifying authorization...</p></div>;
    }
    if (isChairperson === false) {
        return <div className="flex justify-center items-center h-screen"><p>You are not authorized to view this page.</p></div>;
    }

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