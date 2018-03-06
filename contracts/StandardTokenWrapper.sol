pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./BasicTokenWrapper.sol";


contract StandardTokenWrapper is ERC20, BasicTokenWrapper {
    
    mapping(address => mapping(address => uint256)) internal allowed;

    function StandardTokenWrapper(address _token) public BasicTokenWrapper(_token) {
    }

    function allowance(address _owner, address _spender) public view returns(uint256) {
        return ERC20(prevToken).allowance(_owner, _spender) + allowed[_owner][_spender];
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns(bool) {
        require(_to != address(0));
        require(_value <= balanceOf(_from));
        require(_value <= allowance(_from, msg.sender));

        balances[_from] -= _value;
        balances[_to] += _value;
        allowed[_from][msg.sender] -= _value;
        Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns(bool) {
        allowed[msg.sender][_spender] = _value - ERC20(prevToken).allowance(msg.sender, _spender);
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function increaseApproval(address _spender, uint _addedValue) public returns(bool) {
        uint256 prevAllowance = allowance(msg.sender, _spender);
        uint256 currentAllowance = prevAllowance + _addedValue;
        require(prevAllowance <= currentAllowance);
        allowed[msg.sender][_spender] += _addedValue;
        Approval(msg.sender, _spender, currentAllowance);
        return true;
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns(bool) {
        uint256 prevAllowance = allowance(msg.sender, _spender);
        if (_subtractedValue > prevAllowance) {
            _subtractedValue = prevAllowance;
        }
        uint256 currentAllowance = prevAllowance - _subtractedValue;
        require(currentAllowance <= prevAllowance);
        allowed[msg.sender][_spender] -= _subtractedValue;
        Approval(msg.sender, _spender, currentAllowance);
        return true;
    }

}
