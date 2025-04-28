


function CandidateList( {candidates} ){
    return(
        <div className="p-8 border-2 border-slate-600 rounded-2xl">
            {candidates.map((candidate: string) => (
                <p className="py-2">{candidate}</p>
            ))}
        </div>
    )
}

export default CandidateList;