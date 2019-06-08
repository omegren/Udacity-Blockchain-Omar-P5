const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    assert.equal(await instance.name.call(), 'Omar Star Token');
    assert.equal(await instance.symbol.call(), 'USD');
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let instance = await StarNotary.deployed();
    let user1 = accounts[3];
    let tokenUser1 = 9;

    let user2 = accounts[4];
    let tokenUser2 = 10;

    await instance.createStar('Star User 1', tokenUser1, {from: user1});
    await instance.createStar('Star User 2', tokenUser2, {from: user2});

    // owners without exchange
    let lookUpTokenUser1 = await instance.lookUptokenIdToStarInfo(tokenUser1);
    let lookUpTokenUser2 = await instance.lookUptokenIdToStarInfo(tokenUser2);
    assert.equal(lookUpTokenUser1[1], user1);
    assert.equal(lookUpTokenUser2[1], user2);

    // set star for sale
    //await instance.putStarUpForSale(tokenUser2, 1, {from: user2});

    // exchange get token from user2 and execute an exchange with user1 token
    await instance.exchangeStars(tokenUser2, tokenUser1, {from: user1});

    // owners with exchange
    lookUpTokenUser1 = await instance.lookUptokenIdToStarInfo(tokenUser1);
    lookUpTokenUser2 = await instance.lookUptokenIdToStarInfo(tokenUser2);
    assert.equal(lookUpTokenUser1[1], user2);
    assert.equal(lookUpTokenUser2[1], user1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let instance = await StarNotary.deployed();
    let tokenId = 8;
    let user1 = accounts[1];
    let user2 = accounts[2];

    await instance.createStar('Awesome Star!', tokenId, {from: user1});

    // should be user 1
    let result = await instance.lookUptokenIdToStarInfo(tokenId);
    assert.equal(result[1], user1);

    await instance.transferStar(tokenId, user2, { from: user1 });

    // should be user 2 after transfer
    result = await instance.lookUptokenIdToStarInfo(tokenId);
    assert.equal(result[1], user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let user = accounts[0];
    let starId = 6;
    await instance.createStar('A brightly shining star', starId, {from: user});
    let result = await instance.lookUptokenIdToStarInfo(starId);
    assert.equal(result[0], 'A brightly shining star');
    assert.equal(result[1], user);
});