pragma solidity ^0.4.9;

contract mortal {
    address owner;

    function mortal() {
        owner = msg.sender;
    }

    function kill() {
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract token is mortal {
    mapping (address => uint256) public balanceOf;
    string public name;
    uint8 public decimals;
    string public symbol;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    function token(
        uint256 initialSupply,
        string tokenName,
        uint8 decimalUnits,
        string tokenSymbol
    ) {
        balanceOf[msg.sender] = initialSupply;
        name = tokenName;
        symbol = tokenSymbol;
        decimals = decimalUnits;
    }

    function transfer(address _to, uint256 _value) {
        if (balanceOf[msg.sender] < _value) throw;
        if (balanceOf[_to] + _value < balanceOf[_to]) throw;
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        Transfer(msg.sender, _to, _value);
    }
}
