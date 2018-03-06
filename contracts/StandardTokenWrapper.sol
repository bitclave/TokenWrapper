pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "./BasicTokenWrapper.sol";


contract StandardTokenWrapper is StandardToken, BasicTokenWrapper {
    
    mapping(address => mapping(address => bool)) internal migratedAllowed;

    function StandardTokenWrapper(address _token) public BasicTokenWrapper(_token) {
    }

    function allowance(address _owner, address _spender) public view returns(uint256) {
        if (!migratedAllowed[_owner][_spender]) {
            return ERC20(prevToken).allowance(_owner, _spender);
        }
        return allowed[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool) {
        if (!migratedBalances[_from]) {
            balances[_from] = prevToken.balanceOf(_from);
            migratedBalances[_from] = true;
        }
        if (!migratedAllowed[_from][msg.sender]) {
            allowed[_from][msg.sender] = ERC20(prevToken).allowance(_from, msg.sender);
            migratedAllowed[_from][msg.sender] = true;
        }
        return super.transferFrom(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns(bool) {
        if (!migratedAllowed[msg.sender][_spender]) {
            migratedAllowed[msg.sender][_spender] = true;
        }
        return super.approve(_spender, _value);
    }

    function increaseApproval(address _spender, uint _addedValue) public returns(bool) {
        if (!migratedAllowed[msg.sender][_spender]) {
            allowed[msg.sender][_spender] = ERC20(prevToken).allowance(msg.sender, _spender);
            migratedAllowed[msg.sender][_spender] = true;
        }
        return super.increaseApproval(_spender, _addedValue);
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns(bool) {
        if (!migratedAllowed[msg.sender][_spender]) {
            allowed[msg.sender][_spender] = ERC20(prevToken).allowance(msg.sender, _spender);
            migratedAllowed[msg.sender][_spender] = true;
        }
        return super.decreaseApproval(_spender, _subtractedValue);
    }

}
