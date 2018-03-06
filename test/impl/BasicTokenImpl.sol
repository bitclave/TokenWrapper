pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/PausableToken.sol";


contract BasicTokenImpl is PausableToken {

    function BasicTokenImpl() public {
        balances[msg.sender] = 1000000;
        totalSupply_ = 1000000;
    }

}
