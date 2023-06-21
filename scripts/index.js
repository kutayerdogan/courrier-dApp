const {Web3} = require('web3');

// Connect to the local Ethereum network
const web3 = new Web3('http://localhost:8545');
async function main() {
  // Retrieve the accounts
  web3.eth.getAccounts().then(console.log);
  const accounts = await web3.eth.getAccounts();
  const sender = accounts[0];
  const courier = accounts[1];
  const receiver = accounts[2];

  // Compile and deploy the Courier contract
  const contractData = require('./build/contracts/Courier.json');
  const contract = new web3.eth.Contract(contractData.abi);

  const deployTransaction = contract.deploy({
    data: contractData.bytecode,
  });

  const gas = await deployTransaction.estimateGas();
  const courierContract = await deployTransaction.send({
    from: sender,
    gas: gas,
  });

  console.log(`Deployed Courier contract to ${courierContract.options.address}`);

  // Book a package
  const packageId = '1';
  const packageValue = web3.utils.toWei('5', 'ether');

  await courierContract.methods.bookPackage(packageValue, receiver).send({
    from: sender,
    gas: '1000000',
    value: packageValue,
  });

  console.log(`Added package with ID ${packageId}`);

  // Pick up the package
  await courierContract.methods.pickPackage(packageId).send({
    from: courier,
    gas: '1000000',
  });

  console.log(`Courier picked up package with ID ${packageId}`);

  // Mark the package as arrived
  await courierContract.methods.arrivedPackage(packageId).send({
    from: courier,
    gas: '1000000',
  });

  console.log(`Courier delivered package with ID ${packageId}`);

  // Confirm package receipt
  await courierContract.methods.receivedPackage(packageId).send({
    from: receiver,
    gas: '1000000',
  });

  console.log(`Receiver received package with ID ${packageId}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
