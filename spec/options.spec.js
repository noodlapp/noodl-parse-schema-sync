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

describe("options tests", () => {
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

  it("can change options on field", async () => {
    // Add two classes that points to each other
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const class1 = new Parse.Schema("MyClass");
    class1.addString("StringField");
    await class1.save();

    // Run sync
    await sync(args);

    // Change options for the class
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    class1.deleteField("StringField");
    await class1.update();
    class1.addString("StringField", { required: true, defaultValue: "hah" });
    await class1.update();

    // Run sync again (should not overwrite)
    await sync(args);

    // Verify (no change)
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
          StringField: { type: "String" },
        },
      },
    ]);

    // Run sync again (with force this time)
    await sync({ ...args, force: true });

    // Verify
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result2 = await Parse.Schema.all();
    expect(_trimSchema(result2)).toEqual([
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
          StringField: { type: "String", required: true, defaultValue: "hah" },
        },
      },
    ]);
  });
});
