pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/BasicToken.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract BasicTokenWrapper is BasicToken {

    ERC20Basic prevToken;
    mapping(address => bool) migratedBalances;
    
    modifier migrateBalancesIfNeeded(address _owner) {
        if (!migratedBalances[_owner]) {
            balances[_owner] += prevToken.balanceOf(_owner);
            migratedBalances[_owner] = true;
        }
        _;
    }

    function BasicTokenWrapper(address _token) public {
        require(Pausable(_token).paused());
        prevToken = ERC20Basic(_token);
        totalSupply_ = ERC20Basic(_token).totalSupply();
    }

    function balanceOf(address _owner) public view returns(uint256 balance) {
        if (!migratedBalances[_owner]) {
            return prevToken.balanceOf(_owner) + super.balanceOf(_owner);
        }
        return super.balanceOf(_owner);
    }

    function transfer(address _to, uint256 _value) migrateBalancesIfNeeded(msg.sender) public returns(bool) {
        return super.transfer(_to, _value);
    }

}
