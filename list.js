const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const constants = require('./lib/constants');
const web3 = require('./lib/web3');

const preadFile = promisify(fs.readFile);
const pgetAccounts = promisify(web3.eth.getAccounts, web3.eth);

const to = process.argv[2];
const value = process.argv[3];

async function listBalances({
  addressFile,
  abiFile,
}) {
  console.log('read abi');
  const abiJson = await preadFile(abiFile, 'utf8');
  const abi = JSON.parse(abiJson);
  console.log('create contract factory');
  const contractFactory = web3.eth.contract(abi);
  console.log('read contract address');
  const address = await preadFile(addressFile, 'utf8');
  console.log('get contract');
  const contract = contractFactory.at(address);
  console.log('get accounts');
  const accounts = await pgetAccounts();
  console.log('get balances');
  const pmethod = promisify(contract.balanceOf, contract);
  const promises = accounts.map((account) => {
    return pmethod(account)
    .then((balance) => {
      return {
        account,
        balance: balance.toString(),
      };
    });
  });
  return await Promise.all(promises);
}

listBalances({
  addressFile: constants.addressFile,
  abiFile: constants.abiFile,
}).then((result) => {
  console.log(result);
}).catch((error) => console.error(error.stack));
