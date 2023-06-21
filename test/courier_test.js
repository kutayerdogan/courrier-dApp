const Courier = artifacts.require('Courier');

contract('Courier', (accounts) => {
  let courier = null;
  before(async () => {
    courier = await Courier.deployed();
  });

  it('Should book a new package', async () => {
    await courier.bookPackage(10, accounts[1], {from: accounts[0], value: 10});
    const package = await courier.packages(1);
    assert(package.weight.toNumber() === 10);
    assert(package.sender === accounts[0]);
    assert(package.receiver === accounts[1]);
    assert(package.status.toNumber() === 4);
  });

  it('Should pick up a package', async () => {
    await courier.pickPackage(1, {from: accounts[2]});
    const package = await courier.packages(1);
    assert(package.status.toNumber() === 0);
  });

  it('Should deliver a package', async () => {
    await courier.arrivedPackage(1, {from: accounts[2]});
    const package = await courier.packages(1);
    assert(package.status.toNumber() === 3);
  });

  it('Should confirm receipt of a package', async () => {
    await courier.receivedPackage(1, {from: accounts[1]});
    const package = await courier.packages(1);
    assert(package.status.toNumber() === 1);
  });

});
