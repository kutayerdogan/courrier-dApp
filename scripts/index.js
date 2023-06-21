// index.js

const Web3 = require('web3');
const { setupLoader } = require('@openzeppelin/contract-loader');

async function main() {
    // Connect to the local Ethereum network
    const web3 = new Web3('http://localhost:8545');

    const senderPrivateKey = '0xdcd717b1009d92e086642261dd510e1400f908ab17ba134884fba2278602ea88'; // Get this from ganache(it changes every time you restart ganache)
    const courierPrivateKey = '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1';  // Assuming this is the courier's private key
    const receiverPrivateKey = '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c';  // Assuming this is the receiver's private key

    const sender = web3.eth.accounts.privateKeyToAccount(senderPrivateKey);
    const courier = web3.eth.accounts.privateKeyToAccount(courierPrivateKey);
    const receiver = web3.eth.accounts.privateKeyToAccount(receiverPrivateKey);

    const loader = setupLoader({ provider: web3 }).truffle;

    const Courier = loader.fromArtifact('Courier');

    const courierContract = await Courier.deploy().send({ from: sender.address, gas: 5000000 });

    console.log(`Deployed Courier contract to ${courierContract.options.address}`);

    const packageId = '1'; // Assuming package ID is 1
    const packageValue = 5;
    await courierContract.methods.addPackage(packageId, receiver.address).send({ from: sender.address, gas: 5000000, value: packageValue });

    console.log(`Added package with ID ${packageId}`);

 
    await courierContract.methods.pickPackage(packageId).send({ from: courier.address, gas: 5000000 });

    console.log(`Courier picked up package with ID ${packageId}`);

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
