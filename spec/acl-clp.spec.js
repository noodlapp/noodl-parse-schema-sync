const Parse = require("parse/node");
const Helpers = require("./helpers");

const args = Helpers.args;

function _trimSchema(a) {
  a.forEach((s) => {
    delete s.indexes;
    // Keep classLevelPermissions in the trimmed schema
    // delete s.classLevelPermissions;
  });
  a = a.filter((s) => s.className !== "_Session"); // Ignore session class for these tests
  a.sort((a, b) => (a.className > b.className ? -1 : 1));
  return a;
}

describe("ACL and CLP tests", () => {
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
    await Helpers.deleteAllSchemas(
      args["dstAppId"],
      args["dstMasterKey"],
      args["dstUrl"]
    );
  });

  it("can set and sync ACL and CLP", async () => {
    // Set up ACL and CLP in the src server
    Parse.initialize(args["srcAppId"], undefined, args["srcMasterKey"]);
    Parse.serverURL = args["srcUrl"];

    const classWithACL = new Parse.Schema("ClassWithACL");
    classWithACL.setCLP({
      find: { "role:Admin": true },
      create: { "role:Admin": true },
      get: { "role:Admin": true },
      update: { "role:Admin": true },
      delete: { "role:Admin": true },
      addField: { "role:Admin": true },
    });
    await classWithACL.save();

    // Run sync
    await sync(args);

    // Verify ACL and CLP in the dst server
    Parse.initialize(args["dstAppId"], undefined, args["dstMasterKey"]);
    Parse.serverURL = args["dstUrl"];

    const result = await Parse.Schema.all();

    const schema = _trimSchema(result);
    const classSchema = schema.find((x) => x.className === "ClassWithACL");
    expect(classSchema).toEqual({
      className: "ClassWithACL",
      fields: {
        objectId: { type: "String" },
        createdAt: { type: "Date" },
        updatedAt: { type: "Date" },
        ACL: { type: "ACL" },
      },
      classLevelPermissions: {
        find: { "role:Admin": true },
        create: { "role:Admin": true },
        get: { "role:Admin": true },
        update: { "role:Admin": true },
        delete: { "role:Admin": true },
        addField: { "role:Admin": true },
        count: {},
        protectedFields: {}
      },
    });
  });
});
