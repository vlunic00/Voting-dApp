"use client";

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { ethers, Contract, decodeBytes32String } from "ethers";

import { Web3Context } from "@/contexts/Web3Context";
import Header from "@/components/Header";
import CandidateList from "@/components/CandidateList";
import VoteResolution from "@/components/VoteResolution";

export default function Home() {
    const { contract, signer, votingState, votingDuration } = useContext(Web3Context);

    const [candidates, setCandidates] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isChairperson, setIsChairperson] = useState<boolean | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);


    useEffect(() => {
        const checkStatus = async () => {
            if (contract && signer) {
                try {
                    const chairpersonAddr = await contract.chairperson();
                    const signerAddr = await signer.getAddress();
                    setIsChairperson(chairpersonAddr.toLowerCase() === signerAddr.toLowerCase());
                } catch { setIsChairperson(false); }
            } else {
                setIsChairperson(null);
            }
        };
        checkStatus();
    }, [contract, signer]);

    useEffect(() => {
        const getCandidates = async (c: Contract) => {
            try {
                const count = Number((await c.getProposalCount()).toString());
                const names = [];
                for (let i = 0; i < count; i++) {
                    const proposal = await c.proposals(i);
                    names.push(decodeBytes32String(proposal.name));
                }
                setCandidates(names);
            } catch (err: any) { setError(`Failed to load candidates: ${err.message}`); }
        };
        if (contract) getCandidates(contract);
    }, [contract]);

    const handleTimeUp = () => {
        setIsTimeUp(true);
    };

    const isVotingCurrentlyActive = votingState === 'active' && !isTimeUp;

    const renderStatusComponent = () => {
        const finalState = isTimeUp ? 'finished' : votingState;

        switch (finalState) {
            case 'stopped':
                return (
                    <div className="text-center p-8 border-2 border-dashed rounded-2xl mb-8 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-2">Voting Inactive</h2>
                        <p className="text-md text-slate-600">The election has not started yet.</p>
                        {isChairperson && (
                            <p className="text-md text-slate-500 mt-2">
                                Please visit the <Link href="/admin" className="text-blue-600 underline font-semibold">Admin Panel</Link> to begin.
                            </p>
                        )}
                    </div>
                );
            case 'active':
                return votingDuration ? (
                    <VoteResolution votingDuration={votingDuration} onTimeUp={handleTimeUp} />
                ) : null;
            case 'finished':
                return <VoteResolution votingDuration={0} onTimeUp={() => {}} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col pt-[10vh] items-center px-4">
            <Header />
            {signer && isChairperson && (
                <div className="flex space-x-4">
                    <Link href={"/give-rights"} className="px-4 py-2 mt-5 border-2 border-slate-600 cursor-pointer rounded-2xl hover:bg-slate-100 transition">
                        Manage Voter Rights
                    </Link>
                    <Link href={"/admin"} className="px-4 py-2 mt-5 bg-blue-500 text-white cursor-pointer rounded-2xl hover:bg-blue-600 transition">
                        Admin Panel
                    </Link>
                </div>
            )}

            <div className="mt-10 w-full flex flex-col items-center">
                {error && <p className="mt-4 text-red-500">{error}</p>}
                
                {renderStatusComponent()}

                <CandidateList candidates={candidates} isVotingActive={isVotingCurrentlyActive} />
            </div>
        </div>
    );
}