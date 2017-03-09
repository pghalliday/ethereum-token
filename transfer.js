const fs = require('fs');
const path = require('path');
const promisify = require('es6-promisify');
const constants = require('./lib/constants');
const web3 = require('./lib/web3');
const getFirstLine = require('./lib/get-first-line');

const preadFile = promisify(fs.readFile);
const pgetCoinbase = promisify(web3.eth.getCoinbase, web3.eth);
const punlockAccount = promisify(web3.personal.unlockAccount, web3.personal);

const to = process.argv[2];
const value = process.argv[3];

async function callContract({
  passPhraseFile,
  addressFile,
  abiFile,
  method,
  args,
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
  console.log('get coinbase account');
  const coinbase = await pgetCoinbase();
  console.log('read pass phrase');
  const coinbasePassPhrase = await preadFile(passPhraseFile, 'utf8');
  console.log('unlock account');
  console.log(await punlockAccount(coinbase, getFirstLine(coinbasePassPhrase)));
  console.log('call contract');
  const pmethod = promisify(contract[method], contract);
  let transactionHash;
  const done = new Promise((resolve, reject) => {
    contract.Transfer({
      from: coinbase,
      to: args[0],
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        if (result.transactionHash === transactionHash) {
          resolve(transactionHash);
        }
      }
    });
  });
  transactionHash = await pmethod(...args, {
    from: coinbase,
  });
  return await done;
}

callContract({
  passPhraseFile: constants.passPhraseFile,
  addressFile: constants.addressFile,
  abiFile: constants.abiFile,
  method: constants.method,
  args: [to, parseInt(value)],
}).then((result) => {
  console.log(`result: ${result}`);
}).catch((error) => console.error(error.stack));
