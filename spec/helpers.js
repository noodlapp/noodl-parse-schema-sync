require("dotenv").config();

const parse = require("parse");
const Parse = require("parse/node");

const _standardFields = {
  _Role: {
    name: true,
    users: true,
    roles: true,
  },
  _User: {
    username: true,
    password: true,
    email: true,
    emailVerified: true,
    authData: true,
  },
  _Session: {
    sessionToken: true,
    expiresAt: true,
    user: true,
    updatedAt: true,
    createdWith: true,
    installationId: true,
    restricted: true,
  },
};

const _standardFieldsAllSchemas = {
  objectId: true,
  createdAt: true,
  updatedAt: true,
  ACL: true,
};

async function deleteAllSchemas(appId, masterKey, url) {
  Parse.initialize(appId, undefined, masterKey);
  Parse.serverURL = url;
  const schemas = await Parse.Schema.all();

  for (let s of schemas) {
    const parseSchema = new Parse.Schema(s.className);

    if (!_standardFields[s.className]) {
      // Custom class, delete it
      await parseSchema.purge();
      await parseSchema.delete();
    } else {
      // Delete non standard fields
      for (let field in s.fields) {
        if (
          !_standardFields[s.className][field] &&
          !_standardFieldsAllSchemas[field]
        ) {
          await parseSchema.deleteField(field);
        }
      }
      await parseSchema.update();
    }
  }
}

const requiredEnvVariables = [
  "SRC_APP_ID",
  "SRC_URL",
  "SRC_MASTER_KEY",
  "DST_APP_ID",
  "DST_URL",
  "DST_MASTER_KEY",
];

let allVariablesSet = true;
let missingVariables = [];

requiredEnvVariables.forEach((variable) => {
  if (!process.env[variable]) {
    console.log(`${variable} is not set`);
    missingVariables.push(variable);
    allVariablesSet = false;
  }
});

if (allVariablesSet) {
  console.log("All required environment variables are set");
} else {
  const missingVariablesStr = missingVariables.join(", ");
  const errorMsg = `Some environment variables are missing: ${missingVariablesStr}`;
  console.log(errorMsg);
  throw new Error("Some environment variables are missing");
}

const args = {
  srcAppId: process.env.SRC_APP_ID,
  srcUrl: process.env.SRC_URL,
  srcMasterKey: process.env.SRC_MASTER_KEY,

  dstAppId: process.env.DST_APP_ID,
  dstUrl: process.env.DST_URL,
  dstMasterKey: process.env.DST_MASTER_KEY,
};

module.exports = {
  deleteAllSchemas,
  args,
};
