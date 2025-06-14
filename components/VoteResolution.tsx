"use client";

import React, { useState, useEffect, useContext } from 'react';
import { ContractContext } from '@/contexts/Web3Context';
import { ethers, Contract } from 'ethers'; // Direct import for decodeBytes32String (ethers v6)

interface VoteResolutionProps {
    // The total duration of the vote in seconds
    votingDuration: number;
    // A callback function to notify the parent component when time is up
    onTimeUp: () => void;
}

const VoteResolution: React.FC<VoteResolutionProps> = ({ votingDuration, onTimeUp }) => {
    const contract = useContext(ContractContext);

    // State to manage the countdown
    const [timeLeft, setTimeLeft] = useState(votingDuration);
    // State to hold the winner's name or the result of the election
    const [result, setResult] = useState<string | null>(null);
    // State for loading while fetching the winner
    const [isLoadingWinner, setIsLoadingWinner] = useState(false);

    // Effect to handle the countdown timer
    useEffect(() => {
        // Don't start the timer if time is already up
        if (timeLeft <= 0) return;

        // Set up an interval to decrement the timer every second
        const timerInterval = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        // Cleanup function to clear the interval when the component unmounts or timer finishes
        return () => clearInterval(timerInterval);
    }, [timeLeft]); // Dependency array ensures effect reruns only if timeLeft changes

    // Effect to handle what happens when the timer runs out
    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp(); // Notify the parent component that time is up
            determineWinner(); // Start the process of finding the winner
        }
    }, [timeLeft, contract]); // Run when timeLeft or contract changes

    // Function to call the contract and determine the winner
    const determineWinner = async () => {
        if (!contract) {
            setResult("Error: Contract not connected.");
            return;
        }

        console.log("Time is up! Determining the winner...");
        setIsLoadingWinner(true);

        try {
            // Call the winnerName() function from the smart contract
            const winnerNameBytes32 = await contract.winnerName();
            console.log("Raw winnerName() result (bytes32):", winnerNameBytes32);

            // An empty bytes32 string from the contract signifies a tie
            // 0x0000000000000000000000000000000000000000000000000000000000000000
            const emptyBytes32 = "0x" + "00".repeat(32);
            if (winnerNameBytes32 === emptyBytes32) {
                console.log("Tie detected!");
                setResult("Result: It's a tie!");
            } else {
                // Decode the bytes32 value into a readable string
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

    // Helper function to format the time into MM:SS
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