"use client";

import CandidateList from "@/components/CandidateList";
import Header from "@/components/Header";
import Link from 'next/link'
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Ballot from '../build/contracts/Ballot.json';



export default function Home() {

const [provider, setProvider] = useState<ethers.BrowserProvider | null>();
const [signer, setSigner] = useState<ethers.Signer>();
const [contract, setContract] = useState<ethers.Contract | null>(null);

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
      } catch (error) {
        console.error('Error initializing provider/signer:', error);
        // Handle the error (e.g., display an error message)
      }
    } else {
      console.error('MetaMask or other Ethereum provider not found');
      //Handle the lack of a provider.
    }
  }

  initializeProvider();

}, []);

console.log(signer)

function initializeContract(){
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  if(!contractAddress){
    console.error("Contract address is not set in environment variables.")
    return;
  }
  if(signer){
    const contract = new ethers.Contract(contractAddress, Ballot.abi, signer)
  }
  else{
    console.error("No signer for the contract!")
    return;
  }
}

initializeContract();


  return (
    <div className="flex flex-col pt-[10vh] items-center">
    <Header />
    <div className="mt-20">
      <CandidateList />
    </div>
    </div>
  );
}
