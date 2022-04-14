import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Using ECDSA", function () {
  let usingECDSA: Contract;
  let owner: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    carol: SignerWithAddress;

  let chainId: any;
  let whitelist: any;
  let fromTokenId: any;

  this.beforeEach(async () => {
    await ethers.provider.send("hardhat_reset", []);

    ({ chainId } = await ethers.provider.getNetwork());

    [owner, alice, bob, carol] = await ethers.getSigners();

    whitelist = [alice.address, bob.address, carol.address];
    fromTokenId = 5;

    const UsingECDSA = await ethers.getContractFactory("UsingECDSA", owner);
    usingECDSA = await UsingECDSA.deploy(whitelist, fromTokenId);
    await usingECDSA.deployed();
  });

  it("should deploy", async () => {
    const domain = {
      name: "UsingECDSA",
      version: "1.0",
      chainId,
      verifyingContract: usingECDSA.address,
    };

    const types = {
      NFT: [
        { name: "account", type: "address" },
        { name: "tokenId", type: "uint256" },
      ],
    };

    const aliceSignature = await alice._signTypedData(domain, types, {
      account: alice.address,
      tokenId: 5,
    });

    const aliceInvalidSignature = await alice._signTypedData(domain, types, {
      account: alice.address,
      tokenId: 9,
    });

    await expect(
      usingECDSA.connect(alice).redeem(aliceInvalidSignature)
    ).revertedWith("Invalid signature");

    await expect(usingECDSA.connect(alice).redeem(aliceSignature))
      .emit(usingECDSA, "Claimed")
      .withArgs(alice.address);

    await expect(usingECDSA.connect(alice).redeem(aliceSignature)).revertedWith(
      "Already claimed"
    );

    await expect(usingECDSA.connect(bob).redeem(aliceSignature)).revertedWith(
      "Invalid signature"
    );
  });
});
