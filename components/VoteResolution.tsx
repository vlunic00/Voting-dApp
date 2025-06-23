"use client";

import React, { useState, useEffect, useContext } from 'react';
import { ContractContext } from '@/contexts/Web3Context';
import { ethers, Contract } from 'ethers'; // Direct import for decodeBytes32String (ethers v6)

interface VoteResolutionProps {
    votingDuration: number;
    onTimeUp: () => void;
}

const VoteResolution: React.FC<VoteResolutionProps> = ({ votingDuration, onTimeUp }) => {
    const contract = useContext(ContractContext);

    const [timeLeft, setTimeLeft] = useState(votingDuration);
    const [result, setResult] = useState<string | null>(null);
    const [isLoadingWinner, setIsLoadingWinner] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timerInterval = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [timeLeft]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            determineWinner();
        }
    }, [timeLeft, contract]);

    const determineWinner = async () => {
        if (!contract) {
            setResult("Error: Contract not connected.");
            return;
        }

        console.log("Time is up! Determining the winner...");
        setIsLoadingWinner(true);

        try {
            const winnerNameBytes32 = await contract.winnerName();
            console.log("Raw winnerName() result (bytes32):", winnerNameBytes32);

            const emptyBytes32 = "0x" + "00".repeat(32);
            if (winnerNameBytes32 === emptyBytes32) {
                console.log("Tie detected!");
                setResult("Result: It's a tie!");
            } else {
                const winnerName = ethers.decodeBytes32String(winnerNameBytes32);
                console.log("Winner is:", winnerName);
                setResult(`Winner: ${winnerName}`);
            }
        } catch (error: any) {
            console.error("Error determining winner:", error);
            setResult(`Error fetching winner: ${error.reason || error.message}`);
        } finally {
            setIsLoadingWinner(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full max-w-lg p-6 mb-8 text-center bg-white border-2 border-slate-600 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Election Status</h2>
            {timeLeft > 0 ? (
                <div>
                    <p className="text-lg text-gray-700">Time Left to Vote:</p>
                    <p className="text-5xl font-mono font-bold my-2 text-blue-600">{formatTime(timeLeft)}</p>
                </div>
            ) : isLoadingWinner ? (
                <p className="text-xl font-semibold text-gray-700">Declaring winner...</p>
            ) : (
                <p className="text-2xl font-bold text-green-600">{result}</p>
            )}
        </div>
    );
};

export default VoteResolution;