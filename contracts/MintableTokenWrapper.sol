pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "./StandardTokenWrapper.sol";


contract MintableTokenWrapper is StandardTokenWrapper, Ownable {

    event Mint(address indexed to, uint256 amount);
    event MintFinished();

    bool public mintingFinished = false;

    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    function MintableTokenWrapper(address _token) public StandardTokenWrapper(_token) {
        require(MintableToken(prevToken).mintingFinished());
    }

    function mint(address _to, uint256 _amount) onlyOwner canMint public returns(bool) {
        uint256 prevTotalSupply = totalSupply();
        uint256 currentTotalSupply = prevTotalSupply + _amount;
        require(prevTotalSupply <= currentTotalSupply);
        totalSupply_ += _amount;
        balances[_to] += _amount;
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }

    function finishMinting() onlyOwner canMint public returns(bool) {
        mintingFinished = true;
        MintFinished();
        return true;
    }

}