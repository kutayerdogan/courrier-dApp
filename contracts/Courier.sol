pragma solidity ^0.5.0;

contract Courier {
    enum PackageStatus {
        inTransit,
        received,
        cancelled,
        arrived,
        booked
    }

    struct Package {
        uint id;
        uint weight;
        address payable sender;
        PackageStatus status;
        address payable receiver;
    }

    uint public packageCount;
    uint MULTIPLIER = 1;
    mapping (uint => address payable) public packageCourierId;
    mapping (address => uint) public pendingDeliveryCharge;
    mapping (uint => Package) public packages;
    mapping (address => uint[]) public senderPackages;
    mapping (address => uint[]) public receiverPackages;
    event PackageBooked(uint id, address sender, address receiver, uint weight);
    event PackagePicked(uint id, address courier, address sender, address receiver);
    event PackageArrived(uint id, address courier, address sender, address receiver);
    event PackageReceived(uint id, address courier, address sender, address receiver);
    event PackageCancelled(uint id, address courier, address sender, address receiver);

    function bookPackage(uint _weight, address payable _receiver) public payable returns (uint) {
        require(msg.value == _weight * MULTIPLIER, "Incorrect amount");

        packageCount++;
        uint id = packageCount;

        packages[id] = Package(id, _weight, msg.sender, PackageStatus.booked, _receiver);
        pendingDeliveryCharge[msg.sender] += msg.value;

        emit PackageBooked(id, msg.sender, _receiver, _weight);

        return id;
    }

    function pickPackage(uint _id) public {
        Package storage currentPackage = packages[_id];
        require(currentPackage.status == PackageStatus.booked, "Package is already dispatched");
        currentPackage.status = PackageStatus.inTransit;

        packageCourierId[_id] = msg.sender;

        emit PackagePicked(_id, msg.sender, currentPackage.sender, currentPackage.receiver);
    }

    function arrivedPackage(uint _id) public {
        Package storage currentPackage = packages[_id];
        require(currentPackage.status == PackageStatus.inTransit, "Package was not in transit for it to arrive");
        currentPackage.status = PackageStatus.arrived;

        emit PackageArrived(_id, msg.sender, currentPackage.sender, currentPackage.receiver);
    }

    function receivedPackage(uint _id) public returns (bool) {
        Package storage currentPackage = packages[_id];
        require(currentPackage.receiver == msg.sender && currentPackage.status == PackageStatus.arrived, "Package arrived at wrong receiver");

        uint deliveryCharge = currentPackage.weight * MULTIPLIER;
        address payable courier = packageCourierId[_id];

        if (address(currentPackage.sender).send(deliveryCharge)) {
            currentPackage.status = PackageStatus.received;
            pendingDeliveryCharge[currentPackage.sender] -= deliveryCharge;

            emit PackageReceived(_id, courier, currentPackage.sender, currentPackage.receiver);

            return true;
        } else {
            return false;
        }
    }

    function cancelPackage(uint _id) public returns (bool) {
        Package storage currentPackage = packages[_id];
        require(msg.sender == currentPackage.sender, "You do not have authorization to cancel package");

        uint deliveryCharge = currentPackage.weight * MULTIPLIER;
        address payable courier = packageCourierId[_id];

        if (currentPackage.status == PackageStatus.inTransit) {
            if (courier.send(deliveryCharge)) {
                currentPackage.status = PackageStatus.cancelled;
                pendingDeliveryCharge[currentPackage.sender] -= deliveryCharge;
                emit PackageCancelled(_id, courier, currentPackage.sender, currentPackage.receiver);
                return true;
            } else {
                return false;
            }
        } else if (currentPackage.status == PackageStatus.booked) {
            currentPackage.status = PackageStatus.cancelled;
            return true;
        } else {
            return false;
        }
    }
    

    event PackageLocationUpdated(uint id, address courier, uint latitude, uint longitude);

    // Function to update the current location of a package during transit
    function updatePackageLocation(uint _id, uint _latitude, uint _longitude) public {
        Package storage currentPackage = packages[_id];
        require(currentPackage.status == PackageStatus.inTransit, "Package is not in transit");

        emit PackageLocationUpdated(_id, msg.sender, _latitude, _longitude);
    }
}
