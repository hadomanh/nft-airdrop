// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract UsingMerkleTree is Ownable {

    // Previously generated in JS code
    // 0x should be prepended
    bytes32 public merkleRootHash;

    mapping (address => bool) public whitelistClaimed;

    event Claimed(address _address);

    constructor (bytes32 _merkleRootHash) {
        merkleRootHash = _merkleRootHash;
    }

    function setMerkelRootHash(bytes32 _merkleRootHash) public onlyOwner {
        merkleRootHash = _merkleRootHash;
    }

    function claim(bytes32[] calldata _merkleProof) external {

        require(!whitelistClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_merkleProof, merkleRootHash, leaf), "Invalid proof");
        whitelistClaimed[msg.sender] = true;

        // TODO: distribute the airdrop to user

        emit Claimed(msg.sender);
    }

}
