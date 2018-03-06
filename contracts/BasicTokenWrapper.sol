pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";
import "zeppelin-solidity/contracts/lifecycle/Pausable.sol";


contract BasicTokenWrapper is ERC20Basic {

    ERC20Basic prevToken;
    mapping(address => uint256) balances;
    uint256 totalSupply_;

    function BasicTokenWrapper(address _token) public {
        prevToken = ERC20Basic(_token);
        require(Pausable(prevToken).paused());
    }

    function balanceOf(address _owner) public view returns(uint256 balance) {
        return prevToken.balanceOf(_owner) + balances[_owner];
    }

    function totalSupply() public view returns (uint256) {
        return prevToken.totalSupply() + totalSupply_;
    }

    function transfer(address _to, uint256 _value) public returns(bool) {
        require(_to != address(0));
        require(_value <= balanceOf(msg.sender));

        balances[msg.sender] -= _value;
        balances[_to] += _value;
        Transfer(msg.sender, _to, _value);
        return true;
    }

}
