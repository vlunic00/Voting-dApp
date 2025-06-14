"use client";

import CandidateList from "@/components/CandidateList";
import VoteResolution from "@/components/VoteResolution";
import Header from "@/components/Header";
import { ethers, Contract} from "ethers";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";
import { ContractContext, SignerContext } from "@/contexts/Web3Context";

export default function Home() {

const [candidates, setCandidates] = useState<string[]>([]);
const [error, setError] = useState<string | null>(null);
const [isVotingOpen, setIsVotingOpen] = useState(true);

const contract = React.useContext(ContractContext);
const signer = React.useContext(SignerContext);

useEffect(() => {
  async function getCandidates(connectedContract:ethers.Contract|null){
    const ethers = require('ethers')
    if(connectedContract){
      try{
          const proposalCountBigNumber = await connectedContract.getProposalCount();
          const proposalCountString = proposalCountBigNumber.toString()
          const proposalCount = Number(proposalCountString);
          console.log("Proposal count:", proposalCount);
          const candidateNames: string[] = [];
          console.log(proposalCount);          
          for (let i = 0; i < proposalCount; i++) {
            const proposal = await connectedContract.proposals(i);
            // Convert bytes32 to string
            const name = ethers.decodeBytes32String(proposal.name);
            candidateNames.push(name);
          }
          setCandidates(candidateNames)
          console.log(candidateNames)
        }
        catch (error){
          console.error("Error fetching candidates: ", error)
          setCandidates([]);
        }
      }
      else{
        console.log("No contract!");
        setCandidates([]);
      }
  }
  
  if (contract) {
    getCandidates(contract);
  }
  else {
    console.log("No contract!");
    setCandidates([]);
  }
}, [contract, signer]);

    const handleTimeUp = () => {
        console.log("Voting period has ended.");
        setIsVotingOpen(false);
    };

  return (
    console.log(contract, signer),
<div className="flex flex-col pt-[10vh] items-center px-4">
            <Header />
            {signer && (
                <Link href={"/give-rights"} className="px-4 py-2 mt-5 border-2 border-slate-600 cursor-pointer rounded-2xl hover:bg-slate-100 transition">
                    Give Voting Rights
                </Link>
            )}

            <div className="mt-10 w-full flex flex-col items-center">
                <VoteResolution
                    votingDuration={120}
                    onTimeUp={handleTimeUp}
                />

                {isVotingOpen ? (
                    <CandidateList candidates={candidates} />
                ) : (
                    <div className="p-8 border-2 border-dashed border-slate-400 rounded-2xl text-center">
                        <p className="text-xl text-slate-600">The voting period has ended.</p>
                    </div>
                )}

                {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>
        </div>
  );
}
