import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("Using Merkle tree", function () {
  let usingMerkleTree: Contract;
  let leafNodes: Array<any>;
  let merkleTree: MerkleTree;
  let owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    carol: SignerWithAddress;

  this.beforeEach(async () => {
    await ethers.provider.send("hardhat_reset", []);

    [owner, alice, bob, carol] = await ethers.getSigners();

    const whitelist = [alice.address, bob.address, carol.address];

    leafNodes = whitelist.map((address) => {
      return keccak256(address);
    });

    merkleTree = new MerkleTree(leafNodes, keccak256, {
      sortPairs: true,
    });

    const rootHash = merkleTree.getRoot();

    console.log("Whitelist Merkle tree", merkleTree.toString());
    console.log("Whitelist root hash hex", ethers.utils.hexlify(rootHash));
    console.log(merkleTree.getHexProof(leafNodes[0]));

    const UsingMerkleTree = await ethers.getContractFactory(
      "UsingMerkleTree",
      owner
    );
    usingMerkleTree = await UsingMerkleTree.deploy(
      ethers.utils.hexlify(rootHash)
    );
    await usingMerkleTree.deployed();
  });

  it("should deploy", async () => {
    console.log("Airdrop address", usingMerkleTree.address);

    await usingMerkleTree
      .connect(alice)
      .claim(merkleTree.getHexProof(leafNodes[0]));

    await expect(
      usingMerkleTree.connect(alice).claim(merkleTree.getHexProof(leafNodes[0]))
    ).revertedWith("Already claimed");
  });
});
