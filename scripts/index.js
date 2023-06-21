// index.js
const { Web3 } = require('web3');

const { setupLoader } = require('@openzeppelin/contract-loader');

async function main() {
    // Connect to the local Ethereum network
    const web3 = new Web3('http://localhost:8545');

    const senderPrivateKey = '0xe118a61eebb3bd688ecaef5c7df45041a37e51d3ac098eb8cf8013c0b0638e7a'; // Get this from ganache(it changes every time you restart ganache)
    const courierPrivateKey = '0x5dab4910cfdd151864a9213fabd5ca5d5da9ab14f620ef6f33657e9e989db65b';  // Assuming this is the courier's private key
    const receiverPrivateKey = '0x562e7155d1b83d1197acb399354a63630feeecfe4fdff4fdf8af95d697e2e618';  // Assuming this is the receiver's private key

    const sender = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
    const courier = web3.eth.accounts.privateKeyToAccount(courierPrivateKey);
    const receiver = web3.eth.accounts.privateKeyToAccount(receiverPrivateKey);

    const loader = setupLoader({ provider: web3.eth.currentProvider }).truffle;

    const Courier = loader.fromArtifact('Courier');

    const courierContract = await Courier.deploy().send({ from: sender.address, gas: 5000000 });

    console.log(`Deployed Courier contract to ${courierContract.options.address}`);

    const packageId = '1'; // Assuming package ID is 1
    const packageValue = 5;
    await courierContract.methods.bookPackage(packageValue, receiver.address).send({ from: sender.address, gas: 5000000, value: packageValue });

    console.log(`Added package with ID ${packageId}`);

    await courierContract.methods.pickPackage(packageId).send({ from: courier.address, gas: 5000000 });

    console.log(`Courier picked up package with ID ${packageId}`);

    await courierContract.methods.updatePackageLocation(packageId, 40.7128, -74.0060).send({ from: courier.address, gas: 5000000 });

    console.log(`Updated package location for ID ${packageId}`);

    await courierContract.methods.arrivedPackage(packageId).send({ from: courier.address, gas: 5000000 });

    console.log(`Courier delivered package with ID ${packageId}`);

    await courierContract.methods.receivedPackage(packageId).send({ from: receiver.address, gas: 5000000 });

    console.log(`Receiver received package with ID ${packageId}`);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });