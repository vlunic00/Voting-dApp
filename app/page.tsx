"use client";

import CandidateList from "@/components/CandidateList";
import Header from "@/components/Header";
import { ethers, decodeBytes32String, Contract, BrowserProvider} from "ethers";
import { useEffect, useState } from "react";
import Ballot from '../contracts/build/contracts/Ballot.json';



export default function Home() {

const [provider, setProvider] = useState<ethers.BrowserProvider | null>();
const [signer, setSigner] = useState<ethers.Signer>();
const [contract, setContract] = useState<ethers.Contract | null>(null);
const [candidates, setCandidates] = useState<string[]>([]);

useEffect(() => {
  async function initializeProvider() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const newSigner = await newProvider.getSigner();
        setSigner(newSigner);
        console.log("Signer set!")
      } catch (error) {
        console.error('Error initializing provider/signer:', error);
      }
    } else {
      console.error('MetaMask or other Ethereum provider not found');
      //Handle the lack of a provider.
    }
  }
  initializeProvider();

}, []);

useEffect(() => {

  async function initializeContract(){
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if(!contractAddress){
      console.error("Contract address is not set in environment variables.")
      return;
    }
    if(signer){

      const newContractInstance = new ethers.Contract(contractAddress, Ballot.abi, signer)
      setContract(newContractInstance)
      console.log(newContractInstance);
      await getCandidates(newContractInstance);
    }
    else{
      console.error("No signer for the contract!")
      return;
    }
  }
  
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
            console.log(web3.utils.toHex("A"))
            const name = ethers.decodeBytes32String(proposal.name);
            console.log(name);
            candidateNames.push(name);
          }
          setCandidates(candidateNames)
          console.log(candidateNames)
        }
        catch (error){
          console.error("Error fetching candidates: ", error)
        }
      }
  }
  
  initializeContract();
}, [signer])



  return (
    <div className="flex flex-col pt-[10vh] items-center">
    <Header />
    <div className="mt-20">
      <CandidateList />
    </div>
    </div>
  );
}
