# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, 
a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

**If using Windows use the `Run as administrator` Command Prompt** 

To run locally

```shell
npm intall 
```
```shell
npm install hardhat
```

create a local network with different accounts
```shell
npx hardhat node 
```
output will look like 
```shell
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:XXXX/

Accounts
========

WARNING: These accounts, and their private keys, are publicly known.
Any funds sent to them on Mainnet or any other live network WILL BE LOST.

Account #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```
Now use one of these private keys to import a new account from a wallet provider like wallet connect.

in a different terminal window, this will deploy the contracts
```shell
npx hardhat run scripts/deploy.js --network localhost
```

to run the frontend app, this will setup a webserver on localhost:3000
```shell
npm run dev
```




