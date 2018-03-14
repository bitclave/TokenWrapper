pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./BasicTokenWrapper.sol";


contract StandardTokenWrapper is StandardToken, BasicTokenWrapper {
    
    mapping(address => mapping(address => bool)) internal migratedAllowed;

    modifier migrateAllowedIfNeeded(address _owner, address _spender) {
        if (!migratedAllowed[_owner][_spender]) {
            allowed[_owner][_spender] = ERC20(prevToken).allowance(_owner, _spender);
            migratedAllowed[_owner][_spender] = true;
        }
        _;
    }

    function StandardTokenWrapper(address _token) public BasicTokenWrapper(_token) {
    }

    function allowance(address _owner, address _spender) public view returns(uint256) {
        if (!migratedAllowed[_owner][_spender]) {
            return ERC20(prevToken).allowance(_owner, _spender);
        }
        return super.allowance(_owner, _spender);
    }

    function transferFrom(address _from, address _to, uint256 _value) migrateAllowedIfNeeded(_from, msg.sender) migrateBalancesIfNeeded(_from) public returns(bool) {
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) migrateAllowedIfNeeded(msg.sender, _spender) public returns(bool) {
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue) migrateAllowedIfNeeded(msg.sender, _spender) public returns(bool) {
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue) migrateAllowedIfNeeded(msg.sender, _spender) public returns(bool) {
        return super.decreaseApproval(_spender, _subtractedValue);
    }

}
