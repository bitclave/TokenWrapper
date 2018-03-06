pragma solidity ^0.4.11;

import "./BasicTokenWrapper.sol";


contract BurnableTokenWrapper is BasicTokenWrapper {

    event Burn(address indexed burner, uint256 value);

    function BurnableTokenWrapper(address _token) public BasicTokenWrapper(_token) {
    }

    function burn(uint256 _value) public {
        require(_value <= balanceOf(msg.sender));
        
        address burner = msg.sender;
        balances[burner] -= _value;
        totalSupply_ -= _value;
        Burn(burner, _value);
        Transfer(burner, address(0), _value);
    }

}