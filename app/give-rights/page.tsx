"use client";

import React from 'react';
import { ethers } from 'ethers';
import { ContractContext, SignerContext } from '@/contexts/Web3Context';

const GiveRightsPage: React.FC = () => {
    
    const contract = React.useContext(ContractContext);
    const signer = React.useContext(SignerContext);
    
    return (
        console.log(contract, signer),
        <div className='flex flex-col justify-center items-center h-screen'>
            <h1 className='text-4xl'>Give Voting Rights</h1>
            <form className='flex flex-col mt-5'>
                <input type="text" placeholder="Enter address" className='border-2 border-gray-300 p-2 rounded-md' />
                <button className='mt-3 bg-blue-500 text-white p-2 rounded-md'>Give Rights</button>
            </form>
        </div>
    );
};

export default GiveRightsPage;