// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.9.0;

/// @title Voting without delegation with tiebreak.
contract Ballot {
    struct Voter {
        uint weight;
        bool voted;
        uint vote;
    }

    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    function giveRightToVote(address voter) external {
        require(msg.sender == chairperson, "Only chairperson can give right to vote.");
        require(!voters[voter].voted, "The voter already voted.");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }

    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;
        proposals[proposal].voteCount += sender.weight;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0;
        uint tieCount = 0;

        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposalIndex = p;
                tieCount = 0; // Reset tie count when a new winner is found.
            } else if (proposals[p].voteCount == winningVoteCount && proposals[p].voteCount > 0) {
                tieCount++; // Increment tie count if a proposal matches the current winning vote count.
            }
        }

        if (tieCount > 0) {
            // Tie detected, return a large number to signify failure.
            return type(uint).max; // or any other value to show a failed vote.
        } else {
            return winningProposalIndex;
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        uint winningIndex = winningProposal();

        if (winningIndex == type(uint).max) {
            // Tie occurred, return an empty bytes32 to signify failure.
            return bytes32("");
        } else {
            winnerName_ = proposals[winningIndex].name;
        }
    }
}