// contracts/NFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
// Current is for demo purposes

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

// Contract to mint NFTs
// We inherit form ERC721URIStorage, because we want our tokens to support URI storage
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // unique identifier for each token
    address contractAddress; // Address of the marketplace contract

    // We will pass the address of our marketplace contract to this constructor 
    constructor(address marketplaceAddress) ERC721("Metaverse Tokens", "METT") {
        contractAddress = marketplaceAddress;
    }

    // Mints new tokens
    // takes in the URI of the new token
    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment(); // increment tokenIds
        uint256 newItemId = _tokenIds.current(); // set the ID of this token to the current tokenID

        // Call the mint function with the address of the sender and ID of the token 
        // The mint function is included in our inheritance of ERC721URIStorage
        // msg.sender is the address of the account that calls this funciton
        _mint(msg.sender, newItemId);

        // comes from ERC721URIStorage
        // set the URI for the token
        _setTokenURI(newItemId, tokenURI);

        // Give marketplace contract permision to transact these tokens with other accounts
        setApprovalForAll(contractAddress, true);

        // return new item ID used in the front end
        return newItemId;
    }
}