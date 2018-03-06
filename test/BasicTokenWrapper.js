// @flow
'use strict'

const BigNumber = web3.BigNumber;
const expect = require('chai').expect;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BasicToken = artifacts.require('./impl/BasicTokenImpl.sol');
const BasicTokenWrapper = artifacts.require('./BasicTokenWrapper.sol');

contract('BasicTokenWrapper', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {

    it('should fail on initialization on non-paused token', async function() {
        const token = await BasicToken.new();
        const wrapper = await BasicTokenWrapper.new(token.address).should.be.rejectedWith(EVMRevert);
    })

    it('should success on initialization on paused token', async function() {
        const token = await BasicToken.new();
        await token.pause();
        const wrapper = await BasicTokenWrapper.new(token.address);
    })

    it('should correctly display balances', async function() {
        const token = await BasicToken.new();
        await token.transfer(wallet1, 1000);
        await token.transfer(wallet2, 2000);
        await token.transfer(wallet3, 3000);
        await token.pause();

        const wrapper = await BasicTokenWrapper.new(token.address);
        (await wrapper.balanceOf.call(wallet1)).should.be.bignumber.equal(1000);
        (await wrapper.balanceOf.call(wallet2)).should.be.bignumber.equal(2000);
        (await wrapper.balanceOf.call(wallet3)).should.be.bignumber.equal(3000);
        (await wrapper.balanceOf.call(_)).should.be.bignumber.equal(1000000 - 1000 - 2000 - 3000);
        (await wrapper.totalSupply.call()).should.be.bignumber.equal(1000000);
    })

    it('should correctly transfer balances', async function() {
        const token = await BasicToken.new();
        await token.pause();

        const wrapper = await BasicTokenWrapper.new(token.address);
        await wrapper.transfer(wallet1, 1000);
        await wrapper.transfer(wallet2, 2000);
        await wrapper.transfer(wallet3, 3000);

        (await wrapper.balanceOf.call(wallet1)).should.be.bignumber.equal(1000);
        (await wrapper.balanceOf.call(wallet2)).should.be.bignumber.equal(2000);
        (await wrapper.balanceOf.call(wallet3)).should.be.bignumber.equal(3000);
        (await wrapper.balanceOf.call(_)).should.be.bignumber.equal(1000000 - 1000 - 2000 - 3000);
        (await wrapper.totalSupply.call()).should.be.bignumber.equal(1000000);
    })

    it('should not allow to transfer too many tokens', async function() {
        const token = await BasicToken.new();
        await token.pause();

        const wrapper = await BasicTokenWrapper.new(token.address);
        await wrapper.transfer(wallet1, 1000001).should.be.rejectedWith(EVMRevert);
        await wrapper.transfer(wallet1, "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF").should.be.rejectedWith(EVMRevert);
    })

})
