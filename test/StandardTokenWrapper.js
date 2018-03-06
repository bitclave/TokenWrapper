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

const StandardToken = artifacts.require('./impl/StandardTokenImpl.sol');
const StandardTokenWrapper = artifacts.require('./StandardTokenWrapper.sol');

contract('StandardTokenWrapper', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {

    it('should correctly display allowance', async function() {
        const token = await StandardToken.new();
        await token.approve(wallet1, 1000);
        await token.approve(wallet2, 2000);
        await token.approve(wallet3, 3000);
        await token.pause();

        const wrapper = await StandardTokenWrapper.new(token.address);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(1000);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(2000);
        (await wrapper.allowance.call(_, wallet3)).should.be.bignumber.equal(3000);
    })

    it('should correctly approve', async function() {
        const token = await StandardToken.new();
        await token.approve(wallet1, 1000);
        await token.approve(wallet2, 2000);
        await token.approve(wallet3, 3000);
        await token.pause();

        const wrapper = await StandardTokenWrapper.new(token.address);

        await wrapper.approve(wallet1, 100);
        await wrapper.approve(wallet2, 200);
        await wrapper.approve(wallet3, 300);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(100);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(200);
        (await wrapper.allowance.call(_, wallet3)).should.be.bignumber.equal(300);

        await wrapper.approve(wallet1, 0);
        await wrapper.approve(wallet2, 0);
        await wrapper.approve(wallet3, 0);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(0);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(0);
        (await wrapper.allowance.call(_, wallet3)).should.be.bignumber.equal(0);
    })

    it('should not incorrectly increaseApproval', async function() {
        const token = await StandardToken.new();
        await token.approve(wallet1, 1000);
        await token.approve(wallet2, 2000);
        await token.approve(wallet3, 3000);
        await token.pause();

        const wrapper = await StandardTokenWrapper.new(token.address);
        await token.increaseApproval(wallet2, "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF").should.be.rejectedWith(EVMRevert);;
    })

    it('should correctly increaseApproval', async function() {
        const token = await StandardToken.new();
        await token.approve(wallet1, 1000);
        await token.approve(wallet2, 2000);
        await token.approve(wallet3, 3000);
        await token.pause();

        const wrapper = await StandardTokenWrapper.new(token.address);
        await wrapper.increaseApproval(wallet1, 1000);
        await wrapper.increaseApproval(wallet2, 2000);
        await wrapper.increaseApproval(wallet3, 3000);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(2000);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(4000);
        (await wrapper.allowance.call(_, wallet3)).should.be.bignumber.equal(6000);

        await wrapper.increaseApproval(wallet1, 0);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(2000);

        await wrapper.increaseApproval(wallet2, 1000000);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(1004000);
    })

    it('should correctly decreaseApproval', async function() {
        const token = await StandardToken.new();
        await token.approve(wallet1, 1000);
        await token.approve(wallet2, 2000);
        await token.approve(wallet3, 3000);
        await token.pause();

        const wrapper = await StandardTokenWrapper.new(token.address);
        await wrapper.decreaseApproval(wallet1, 100);
        await wrapper.decreaseApproval(wallet2, 200);
        await wrapper.decreaseApproval(wallet3, 300);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(900);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(1800);
        (await wrapper.allowance.call(_, wallet3)).should.be.bignumber.equal(2700);

        await wrapper.decreaseApproval(wallet1, 0);
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(900);

        await wrapper.decreaseApproval(wallet2, 1000000);
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(0);

        await wrapper.decreaseApproval(wallet3, "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
        (await wrapper.allowance.call(_, wallet3)).should.be.bignumber.equal(0);
    })

    it('should correctly transferFrom', async function() {
        const token = await StandardToken.new();
        await token.approve(wallet1, 1000);
        await token.approve(wallet2, 2000);
        await token.pause();

        const wrapper = await StandardTokenWrapper.new(token.address);
        await wrapper.increaseApproval(wallet1, 100); // 1100
        await wrapper.decreaseApproval(wallet2, 200); // 1800

        await wrapper.transferFrom(_, wallet1, 1200, {from: wallet1}).should.be.rejectedWith(EVMRevert);
        await wrapper.transferFrom(_, wallet2, 1801, {from: wallet1}).should.be.rejectedWith(EVMRevert);
        await wrapper.transferFrom(_, wallet1, "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", {from: wallet1}).should.be.rejectedWith(EVMRevert);

        await wrapper.transferFrom(_, wallet1, 0, {from: wallet1});
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(1100);
        (await wrapper.balanceOf.call(wallet1)).should.be.bignumber.equal(0);
        await wrapper.transferFrom(_, wallet1, 100, {from: wallet1});
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(1000);
        (await wrapper.balanceOf.call(wallet1)).should.be.bignumber.equal(100);
        await wrapper.transferFrom(_, wallet1, 1000, {from: wallet1});
        (await wrapper.allowance.call(_, wallet1)).should.be.bignumber.equal(0);
        (await wrapper.balanceOf.call(wallet1)).should.be.bignumber.equal(1100);

        await wrapper.transferFrom(_, wallet2, 0, {from: wallet2});
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(1800);
        (await wrapper.balanceOf.call(wallet2)).should.be.bignumber.equal(0);
        await wrapper.transferFrom(_, wallet2, 500, {from: wallet2});
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(1300);
        (await wrapper.balanceOf.call(wallet2)).should.be.bignumber.equal(500);
        await wrapper.transferFrom(_, wallet2, 1300, {from: wallet2});
        (await wrapper.allowance.call(_, wallet2)).should.be.bignumber.equal(0);
        (await wrapper.balanceOf.call(wallet2)).should.be.bignumber.equal(1800);
    })

})
