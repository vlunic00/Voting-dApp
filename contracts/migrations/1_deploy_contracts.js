const Ballot = artifacts.require("Ballot");
const web3 = require('web3');

module.exports = async function (deployer) {

    const proposalNames = [
        web3.utils.toHex("A"),
        web3.utils.toHex("B"),
        web3.utils.toHex("C")
    ];
    await deployer.deploy(Ballot, proposalNames);
};