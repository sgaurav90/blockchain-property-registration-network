"use strict";

const { Contract, Property } = require("fabric-contract-api");

// This is a smart contract written in Node.js using the fabric-contract-api library for the Hyperledger Fabric blockchain platform. The smart contract provides functions to create a new user, recharge a user's account with coins, register a new property, update the details of a property, and purchase a property.

class UserContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("User");
  }

  async instantiate(ctx) {
    console.log("User-Propreg Smart Contract Instantiated");
  }
  /**
   * Create a new user request on the network
   * @param ctx - The transaction context object
   * @param ssn - ID to be used for creating a new user request
   * @param name - Name of the user
   * @param email - Email ID of the user
   * @param phonenum - Phone number of the user
   * @returns
   */

  //   The requestNewUser function creates a new user request on the network by storing the user's name, email, phone number, and Social Security Number (SSN) in the ledger. The function takes these parameters as input and returns the user request as output.

  async requestNewUser(ctx, name, email, phone, ssn) {
    const requestKey = ctx.stub.createCompositeKey("Request", [name, ssn]);
    const txTimestamp = ctx.stub.getTxTimestamp();
    const request = {
      name,
      email,
      phone,
      ssn,
      createdAt: new Date(txTimestamp.seconds.low * 1000),
    };
    await ctx.stub.putState(requestKey, Buffer.from(JSON.stringify(request)));
    return request;
  }

  //   The rechargeAccount function adds a certain number of coins to a user's account. The number of coins added depends on the bank transaction ID passed as input to the function. The function takes the user's name, SSN, and bank transaction ID as input and returns the updated user object as output.

  async rechargeAccount(ctx, name, ssn, bankTxnId) {
    const userKey = ctx.stub.createCompositeKey("User", [name, ssn]);
    const userBuffer = await ctx.stub.getState(userKey);
    if (!userBuffer || userBuffer.length === 0) {
      throw new Error(`${name} with SSN ${ssn} not found.`);
    }
    const user = JSON.parse(userBuffer.toString());
    const coinsMap = {
      upg100: 100,
      upg500: 500,
      upg1000: 1000,
    };
    const coins = coinsMap[bankTxnId];
    if (!coins) {
      throw new Error(`Invalid Bank Transaction ID: ${bankTxnId}`);
    }
    user.upgradCoins += coins;
    await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
    return user;
  }

  //   The viewUser function retrieves the user object from the ledger based on the user's name and SSN. The function takes the user's name and SSN as input and returns the user object as output.

  async viewUser(ctx, name, ssn) {
    const userKey = ctx.stub.createCompositeKey("User", [name, ssn]);
    const userBuffer = await ctx.stub.getState(userKey);
    if (!userBuffer || userBuffer.length === 0) {
      throw new Error(`${name} with SSN ${ssn} not found.`);
    }
    const user = JSON.parse(userBuffer.toString());
    return user;
  }

  //   The propertyRegistrationRequest function registers a new property on the network by storing the property's ID, owner's name and SSN, price, and status in the ledger. The function takes these parameters as input and returns the property registration request as output.

  async propertyRegistrationRequest(
    ctx,
    propertyId,
    ownerName,
    ownerSsn,
    price,
    status
  ) {
    const ownerKey = ctx.stub.createCompositeKey("User", [ownerName, ownerSsn]);
    const ownerBuffer = await ctx.stub.getState(ownerKey);
    if (!ownerBuffer || ownerBuffer.length === 0) {
      throw new Error(`${ownerName} with SSN ${ownerSsn} not found.`);
    }
    const propertyKey = ctx.stub.createCompositeKey("Request", [propertyId]);
    const txTimestamp = ctx.stub.getTxTimestamp();
    const property = {
      propertyId,
      owner: ownerKey,
      price,
      status,
      createdAt: new Date(txTimestamp.seconds.low * 1000),
    };
    await ctx.stub.putState(propertyKey, Buffer.from(JSON.stringify(property)));
    return property;
  }

  //   The viewProperty function retrieves the property object from the ledger based on the property ID. The function takes the property ID as input and returns the property object as output.

  async viewProperty(ctx, propertyId) {
    const propRequestKey = ctx.stub.createCompositeKey("User", [propertyId]);
    const propertyBuffer = await ctx.stub.getState(propRequestKey);
    if (!propertyBuffer || propertyBuffer.length === 0) {
      throw new Error(`${propertyId} not found.`);
    }
    const property = JSON.parse(propertyBuffer.toString());
    return property;
  }

  //   The updateProperty function updates the details of an existing property by changing its owner, price, or status. The function takes the property ID, new owner's name and SSN, new price, and new status as input and returns the updated property object as output.

  async updateProperty(ctx, propertyId, ownerName, ownerSsn, price, status) {
    const ownerKey = ctx.stub.createCompositeKey("User", [ownerName, ownerSsn]);
    const ownerBuffer = await ctx.stub.getState(ownerKey);
    if (!ownerBuffer || ownerBuffer.length === 0) {
      throw new Error(`${ownerName} with SSN ${ownerSsn} not found.`);
    }
    const propRequestKey = ctx.stub.createCompositeKey("User", [propertyId]);
    const txTimestamp = ctx.stub.getTxTimestamp();
    const propertyBuffer = await ctx.stub.getState(propRequestKey);
    if (!propertyBuffer || propertyBuffer.length === 0) {
      throw new Error(`${propertyId} not found.`);
    }
    const prop = JSON.parse(propertyBuffer.toString());

    if (ownerKey !== prop.owner) {
      throw new Error(`this property doesn't belog to this ${ownerName}.`);
    }

    const property = {
      propertyId,
      price,
      status,
      createdAt: new Date(txTimestamp.seconds.low * 1000),
    };
    await ctx.stub.putState(
      propRequestKey,
      Buffer.from(JSON.stringify(property))
    );
    return property;
  }

  //   The purchaseProperty function allows a user to purchase a property by updating the property's owner and deducting the price from the buyer's account. The function takes the property ID, buyer's name, and buyer's SSN as input and returns the updated property object as output.

  async purchaseProperty(ctx, propertyId, buyerName, buyerSsn) {
    const buyerKey = ctx.stub.createCompositeKey("User", [buyerName, buyerSsn]);
    const buyerBuffer = await ctx.stub.getState(buyerKey);
    if (!buyerBuffer || buyerBuffer.length === 0) {
      throw new Error(`${buyerName} with SSN ${buyerSsn} not found.`);
    }
    const buyer = JSON.parse(buyerBuffer.toString());
    const propRequestKey = ctx.stub.createCompositeKey("User", [propertyId]);
    const propertyBuffer = await ctx.stub.getState(propRequestKey);
    if (!propertyBuffer || propertyBuffer.length === 0) {
      throw new Error(`${propertyId} not found.`);
    }
    const prop = JSON.parse(propertyBuffer.toString());
    const ownerBuffer = await ctx.stub.getState(prop.owner);
    const owner = JSON.parse(ownerBuffer.toString());
    const txTimestamp = ctx.stub.getTxTimestamp();
    if (prop.status !== "onSale") {
      throw new Error(`this property is not on Sale.`);
    }
    if (buyer.upgradCoins < prop.price) {
      throw new Error(
        `you don't have sufficient balance to purchase this property.`
      );
    } else {
      const buyerUser = {
        name: buyer.name,
        ssn: buyer.ssn,
        email: buyer.email,
        phone: buyer.phone,
        createdAt: buyer.createdAt,
        upgradCoins: buyer.upgradCoins - prop.price,
      };

      const ownerUser = {
        name: owner.name,
        ssn: owner.ssn,
        email: owner.email,
        phone: owner.phone,
        createdAt: owner.createdAt,
        upgradCoins: owner.upgradCoins + prop.price,
      };

      const property = {
        propertyId,
        owner: buyerKey,
        status: "registered",
        createdAt: new Date(txTimestamp.seconds.low * 1000),
      };
      await ctx.stub.putState(
        propRequestKey,
        Buffer.from(JSON.stringify(property))
      );
      await ctx.stub.putState(buyerKey, Buffer.from(JSON.stringify(buyerUser)));
      await ctx.stub.putState(
        prop.owner,
        Buffer.from(JSON.stringify(ownerUser))
      );
      return property;
    }
  }
}

module.exports = UserContract;
