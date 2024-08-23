"use strict";

const { Contract } = require("fabric-contract-api");

class RegistrarContract extends Contract {
  constructor() {
    // Provide a custom name to refer to this smart contract
    super("Admin");
  }

  async instantiate(ctx) {
    console.log("Registrar-Propreg Smart Contract Instantiated");
  }
  /**
   * Create a new student account on the network
   * @param ctx - The transaction context object
   * @param ssn - ssn of the user account
   * @param name - Name of the user
   * @param email - Email ID of the user
   * @param phonenum - Phone number of the user
   * @returns
   */

  // This function approves a new user account by retrieving their information from the "Request" object and creating a new "User" object on the ledger. The function takes in the user's name and SSN as input and returns the created user object. If the user is not found in the "Request" object, the function throws an error.

  async approveNewUser(ctx, name, ssn) {
    const requestKey = ctx.stub.createCompositeKey("Request", [name, ssn]);
    const requestBuffer = await ctx.stub.getState(requestKey);
    if (!requestBuffer || requestBuffer.length === 0) {
      throw new Error(`${name} with SSN ${ssn} not found.`);
    }
    const request = JSON.parse(requestBuffer.toString());
    const userKey = ctx.stub.createCompositeKey("User", [name, ssn]);
    const user = {
      name,
      ssn,
      email: request.email,
      phone: request.phone,
      createdAt: request.createdAt,
      upgradCoins: 0,
    };
    await ctx.stub.putState(userKey, Buffer.from(JSON.stringify(user)));
    await ctx.stub.deleteState(requestKey);
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

  async approvePropertyRegistration(ctx, propertyId) {
    // Create the composite key for the property request
    const propertyKey = ctx.stub.createCompositeKey("Request", [propertyId]);

    // Retrieve the property request from the ledger
    const propertyBuffer = await ctx.stub.getState(propertyKey);
    if (!propertyBuffer || propertyBuffer.length === 0) {
      throw new Error(`${propertyId} not found.`);
    }

    // Parse the property request JSON
    const propRequest = JSON.parse(propertyBuffer.toString());

    // Create the composite key for the property object
    const propRequestKey = ctx.stub.createCompositeKey("User", [propertyId]);

    // Create the property object with data from the property request
    const property = {
      propertyId,
      owner: propRequest.owner,
      price: propRequest.price,
      status: propRequest.status,
      createdAt: propRequest.createdAt,
    };

    // Save the property object to the ledger
    await ctx.stub.putState(
      propRequestKey,
      Buffer.from(JSON.stringify(property))
    );

    // Delete the property request from the ledger
    await ctx.stub.deleteState(propertyKey);

    // Return the newly created property object
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
}

module.exports = RegistrarContract;
