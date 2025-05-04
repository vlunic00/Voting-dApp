"use client";

import CandidateList from "@/components/CandidateList";
import Header from "@/components/Header";
import { ethers, decodeBytes32String, Contract, BrowserProvider} from "ethers";
import { useEffect, useState } from "react";
import Ballot from '../contracts/build/contracts/Ballot.json';
import Link from "next/link";
import React from "react";
import { ContractContext, SignerContext } from "@/contexts/Web3Context";

export default function Home() {

const [candidates, setCandidates] = useState<string[]>([]);

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



  return (
    console.log(contract, signer),
    <ContractContext.Provider value={contract}>
      <SignerContext.Provider value={signer}>
        <div className="flex flex-col pt-[10vh] items-center">
        <Header />
        <Link href={"/give-rights"} className="px-4 py-2 mt-5 border-2 border-slate-600 cursor-pointer rounded-2xl">Give voting rights</Link>
        <div className="mt-20">
          <CandidateList candidates={candidates} />
        </div>
        </div>
      </SignerContext.Provider>
    </ContractContext.Provider>
  );
}
