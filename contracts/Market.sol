// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

// Import openzeppling library
import "@openzeppelin/contracts/utils/Counters.sol"; // import a counter to count NFTs 
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

// This is our NFT Market Contract
// ReentracyGuard gives the contract protection against reentrancy attacks
contract NFTMarket is ReentrancyGuard {

  // Need to keep track of:
  // Number of items that I have bought 
  // Number of items that I have created
  // Number of Items that are not sold



  using Counters for Counters.Counter;
  Counters.Counter private _itemIds; // id of each market item
  Counters.Counter private _itemsSold; // number of items sold


  // We are giving a commission to the owner as a listing fee
  address payable owner;  // address of the owner of the contract
  uint256 listingPrice = 0.025 ether; // listing fee

  // contructor 
  // sets the owner of the contract to be the address/account that deploys it. 
  constructor() {
    owner = payable(msg.sender);
  }


  // Struct for market item
  struct MarketItem {
    uint itemId; // id market item
    address nftContract; // minting contract address
    uint256 tokenId;// Id of the token in the minting contract
    address payable seller; // Account of seller (whoever puts it up for sale)
    address payable owner; // account of owner
    uint256 price;  // price
    bool sold; // issold
  }

  // hashmap that maps market item ID to struct of the market item 
  mapping(uint256 => MarketItem) private idToMarketItem;


  // event for when a market item is created
  // used to broadcast information about the newly created market item
  // used to update front end??
  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );


  /* Returns the listing fee of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }
  
  /* Places an item for sale on the marketplace */
  // Creates a market item and puts it up for sale
  // uses nonReentrant modifier to prevent reentry attack
  // This function is marked as "payable" which means that funds sent to it will automatically be stored in the address of the Smart Contract 
  // takes in: 
  // address of the NFT contract
  // Token ID from NFT contract
  // Price of token 
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {

    // Price needs to be greater than 0
    require(price > 0, "Price must be at least 1 wei");

    // listing fee must be sent in this transaction
    require(msg.value == listingPrice, "Price must be equal to listing price");

    // FUNDS ARE STORED IN THE SMART CONTRACT AUTOMATICALLY

    _itemIds.increment(); // increment market item ids
    uint256 itemId = _itemIds.current(); //set ID for current item 
  
    // add new market item to idToMarketItem hashmap
    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender), // whoever puts it for sale
      payable(address(0)), // owner is set to empty address because noone owns the token yet
      price,
      false
    );

    // **POSSIBLE stretch GOAL, TO ALLOW USERS TO CANCEL THEIR POSTINGS

    // Transfer Ownership of token from seller to this smart contract
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    // Emit MarketItemCreated event
    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

    function resellToken(address nftContract, uint256 itemId) public payable {
        uint price = idToMarketItem[itemId].price; // price of the market item
        uint256 tokenId = idToMarketItem[itemId].tokenId; // token ID of the market item
      require(idToMarketItem[itemId].owner == msg.sender, "Only item owner can perform this operation");
      require(msg.value == price, "Price must be equal to listing price");
      idToMarketItem[itemId].sold = false;
      idToMarketItem[itemId].price = price;
      idToMarketItem[itemId].seller = payable(msg.sender);
      idToMarketItem[itemId].owner = payable(address(0));
      _itemsSold.decrement();
          IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    }
    
  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  // sell an item
  // takes in:
  // NFT Cotract address
  // Market Item id
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price; // price of the market item
    uint tokenId = idToMarketItem[itemId].tokenId; // token ID of the market item

    // check that the price of the item is included in this transaction 
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");

    // transfer funds to seller
    idToMarketItem[itemId].seller.transfer(msg.value);

    // transfer ownership of token to buyer (account that called this function)
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

    // set new owner in the struct for this market item 
    idToMarketItem[itemId].owner = payable(msg.sender);
    
    // set to sold
    idToMarketItem[itemId].sold = true;

    // increment sold counter
    _itemsSold.increment();

    // pay the owner
    payable(owner).transfer(listingPrice);
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns onlyl items that a user has purchased */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}