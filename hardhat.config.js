require("@nomiclabs/hardhat-waffle");

// Setting up for Polygon
const projectID = "e2d0987d41a546a38b1f1288985bf5d1";

module.exports = {
  networks: {
    hardhat: {
      chainID: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectID}`,
      accounts: []
    },
    mainnet: {
      url: `https://polygon-mumbai.infura.io/v3/${projectID}`,
      accounts: []
    }
  },
  solidity: "0.8.4",
};
