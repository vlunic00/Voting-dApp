import CandidateList from "@/components/CandidateList";
import Header from "@/components/Header";
import Link from 'next/link'
import Web3 from "web3";


export default function Home() {
  const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
  return (
    <div className="flex flex-col pt-[10vh] items-center">
    <Header />
    <div className="mt-20">
      <CandidateList />
    </div>
    </div>
  );
}
