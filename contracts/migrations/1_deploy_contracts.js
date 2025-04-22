const Ballot = artifacts.require("Ballot");
const web3 = require('web3');
const ethers = require("ethers");

module.exports = async function (deployer) {

    const proposalNames = [
        ethers.encodeBytes32String("A"),
        ethers.encodeBytes32String("B"),
        ethers.encodeBytes32String("C"),
    ];
    await deployer.deploy(Ballot, proposalNames);
};