import Link from "next/link";


function ThankYouPage(){
    return(
        <div className="h-[100vh] w-full flex flex-col justify-center items-center">
            <h1 className="text-7xl">Thank you for voting!</h1>
            <button className="mt-10 py-2 px-4 rounded-xl border-2 border-slate-600"><Link href={'/'}>Go Back</Link></button>
        </div>
    )
}

export default ThankYouPage;