import CandidateList from "@/components/CandidateList";
import Header from "@/components/Header";
import Link from 'next/link'


export default function Home() {
  return (
    <div className="flex flex-col pt-[10vh] items-center">
    <Header />
    <div className="mt-20">
      <CandidateList />
    </div>
    </div>
  );
}
