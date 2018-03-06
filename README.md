# TokenWrapper

[![Build Status](https://travis-ci.org/bitclave/TokenWrapper.svg?branch=master)](https://travis-ci.org/bitclave/TokenWrapper)
[![Coverage Status](https://coveralls.io/repos/github/bitclave/TokenWrapper/badge.svg)](https://coveralls.io/github/bitclave/TokenWrapper)

BitClave implementation of TokenWrapper contract to upgrade any existing pausable OpenZeppelin token

# Installation

1. Install [truffle](http://truffleframework.com) globally with `npm install -g truffle`
2. Install [ganache-cli](https://github.com/trufflesuite/ganache-cli) globally with `npm install -g ganache-cli`
3. Install local packages with `npm install`
4. Run ganache-cli in separate terminal `scripts/rpc.sh`
5. Run tests with `npm test`

On macOS you also need to install watchman: `brew install watchman`

# Features

1. Add any functionality to your token without migrating any holders
2. Requires token to be at least `Pausable`
3. Supports a lot of OpenZeppelin tokens:
    - `BasicTokenWrapper` for `BasicToken`
    - `StandardTokenWrapper` for `StandardToken`
    - `MintableTokenWrapper` for `MintableToken`
    - `BurnableTokenWrapper` for `BurnableToken`
    - More coming soon ...

# Example of simple MyToken upgrade

```solidity
contract MyToken is StandardToken, PausableToken {

    string public constant symbol = "MYT";
    string public constant name = "MyToken";
    uint8 public constant decimals = 18;
    string public constant version = "1.0";

    function MyToken() public {
        totalSupply_ = 1000000 * 10**decimals;
        balances[msg.sender] = totalSupply_;
    }
    
}
```

You just need to `pause()` it and create new upgraded token, based on the previous one:

```solidity
contract MyToken2 is StandardTokenWrapper, PausableToken {

    string public constant symbol = "MYT";
    string public constant name = "MyToken";
    uint8 public constant decimals = 18;
    string public constant version = "2.0";

    function MyToken2(address _token) public StandardTokenWrapper(_token) {
    }

    // Modern approve method from ERC827
    function approve(address _spender, uint256 _value, bytes _data) public returns(bool) {
        require(_spender != address(this));
        super.approve(_spender, _value);
        require(_spender.call(_data));
        return true;
    }

}
```
