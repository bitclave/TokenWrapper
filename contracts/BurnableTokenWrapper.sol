pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "./BasicTokenWrapper.sol";


contract BurnableTokenWrapper is BurnableToken, BasicTokenWrapper {

    function BurnableTokenWrapper(address _token) public BasicTokenWrapper(_token) {
    }

    function burn(uint256 _value) migrateBalancesIfNeeded(msg.sender) public {
        super.burn(_value);
    }

}