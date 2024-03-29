const Parse = require("parse/node");
const Helpers = require("./helpers");

const args = Helpers.args;

function _trimSchema(a) {
  a.forEach((s) => {
    delete s.indexes;
    delete s.classLevelPermissions;
  });
  a = a.filter((s) => s.className !== "_Session"); // Ignore session class for these tests
  a.sort((a, b) => (a.className > b.className ? -1 : 1));
  return a;
}

describe("simple tests", () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

  // Start the server
  const sync = require("../sync.js");

  it("setup", async () => {
    // Remove all schemas from src and dst test servers
    await Helpers.deleteAllSchemas(
      args["srcAppId"],
      args["srcMasterKey"],
      args["srcUrl"]
    );
    const srcSchemas = await Parse.Schema.all();
    expect(_trimSchema(srcSchemas)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
        },
      },
    ]);

    // Sign up to source to make sure the
    try {
      await Parse.User.signUp("woff", "woffwoff");
    } catch (e) {
      /* Fine if it already exists */
    }

    await Helpers.deleteAllSchemas(
      args["dstAppId"],
      args["dstMasterKey"],
      args["dstUrl"]
    );
    const dstSchemas = await Parse.Schema.all();
    expect(_trimSchema(dstSchemas)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
        },
      },
    ]);
  });

  it("can add class with fields", async () => {
    // Add fields to source server
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const mySchema = new Parse.Schema("MyClass");
    mySchema.addString("stringField");
    await mySchema.save();

    // Run sync
    await sync(args);

    // Verify
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result = await Parse.Schema.all();
    expect(_trimSchema(result)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
        },
      },
      {
        className: "MyClass",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          stringField: { type: "String" },
        },
      },
    ]);
  });

  it("can add field to class", async () => {
    // Add fields to source server
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const mySchema = new Parse.Schema("MyClass");
    await mySchema.get();
    mySchema
      .addNumber("numberField")
      .addBoolean("booleanField")
      .addDate("dateField");
    await mySchema.update();

    // Run sync
    await sync(args);

    // Verify
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result = await Parse.Schema.all();
    expect(_trimSchema(result)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
        },
      },
      {
        className: "MyClass",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          stringField: { type: "String" },
          numberField: { type: "Number" },
          dateField: { type: "Date" },
          booleanField: { type: "Boolean" },
        },
      },
    ]);
  });

  it("can add field to user", async () => {
    // Add fields to source server
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const userSchema = new Parse.Schema("_User");
    await userSchema.get();
    userSchema.addArray("arrayField");
    userSchema.addObject("objectField");
    await userSchema.update();

    // Run sync
    await sync(args);

    // Verify
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result = await Parse.Schema.all();
    expect(_trimSchema(result)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
          objectField: { type: "Object" },
          arrayField: { type: "Array" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
        },
      },
      {
        className: "MyClass",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          stringField: { type: "String" },
          booleanField: { type: "Boolean" },
          dateField: { type: "Date" },
          numberField: { type: "Number" },
        },
      },
    ]);
  });

  it("can add field to role", async () => {
    // Add fields to source server
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const roleSchema = new Parse.Schema("_Role");
    await roleSchema.get();
    roleSchema.addFile("fileField");
    await roleSchema.update();

    // Run sync
    await sync(args);

    // Verify
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result = await Parse.Schema.all();
    expect(_trimSchema(result)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
          arrayField: { type: "Array" },
          objectField: { type: "Object" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
          fileField: { type: "File" },
        },
      },
      {
        className: "MyClass",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          stringField: { type: "String" },
          booleanField: { type: "Boolean" },
          numberField: { type: "Number" },
          dateField: { type: "Date" },
        },
      },
    ]);
  });

  it("can add field with default value and required", async () => {
    // Add fields to source server
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const roleSchema = new Parse.Schema("MyClass");
    await roleSchema.get();
    roleSchema.addString("requiredField", {
      required: true,
      defaultValue: "wagga",
    });
    await roleSchema.update();

    // Run sync
    await sync(args);

    // Verify
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result = await Parse.Schema.all();
    expect(_trimSchema(result)).toEqual([
      {
        className: "_User",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          username: { type: "String" },
          password: { type: "String" },
          email: { type: "String" },
          emailVerified: { type: "Boolean" },
          authData: { type: "Object" },
          objectField: { type: "Object" },
          arrayField: { type: "Array" },
        },
      },
      {
        className: "_Role",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          name: { type: "String" },
          users: { type: "Relation", targetClass: "_User" },
          roles: { type: "Relation", targetClass: "_Role" },
          fileField: { type: "File" },
        },
      },
      {
        className: "MyClass",
        fields: {
          objectId: { type: "String" },
          createdAt: { type: "Date" },
          updatedAt: { type: "Date" },
          ACL: { type: "ACL" },
          stringField: { type: "String" },
          booleanField: { type: "Boolean" },
          numberField: { type: "Number" },
          dateField: { type: "Date" },
          requiredField: {
            type: "String",
            required: true,
            defaultValue: "wagga",
          },
        },
      },
    ]);
  });
});
