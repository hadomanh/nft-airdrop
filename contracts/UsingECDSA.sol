// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract UsingECDSA is EIP712("UsingECDSA", "1.0") {

    bytes32 public constant AIRDROP_ROLE = keccak256("AIRDROP_ROLE");

    mapping (address => uint256) public tokenId;

    mapping (address => bool) public whitelistClaimed;

    event Claimed(address _address);

    constructor (address[] memory _whitelist, uint256 _fromTokenId) {
        for (uint256 i = 0; i < _whitelist.length; i++) {
            tokenId[_whitelist[i]] = _fromTokenId++;
        }
    }

    function redeem(bytes calldata signature) external {

        require(!whitelistClaimed[msg.sender], "Already claimed");
        require(_verify(msg.sender, signature), "Invalid signature");

        // TODO: distribute the airdrop to user

        whitelistClaimed[msg.sender] = true;

        emit Claimed(msg.sender);
    }

    function _verify(address signer, bytes memory signature)
    internal view returns (bool)
    {

        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            keccak256("NFT(address account,uint256 tokenId)"),
            signer,
            tokenId[signer]
        )));

        return SignatureChecker.isValidSignatureNow(signer, digest, signature);
    }

}
