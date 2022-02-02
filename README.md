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

in a different terminal window, this will deploy the contracts
```shell
npx hardhat run scripts/deploy.js --network localhost
```

to run the frontend app, this will setup a webserver on localhost:3000
```shell
npm run dev
```



