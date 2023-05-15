const Parse = require('parse/node');

const _standardFields = {
  _Role:{
      name: true,
      users: true,
      roles: true
  },
  _User:{

      username: true,
      password: true,
      email: true,
      emailVerified: true,
      authData: true
  },
  _Session:{
      sessionToken: true,
      expiresAt: true,
      user: true,
      updatedAt: true,
      createdWith: true,
      installationId: true,
      restricted: true,
  }
}

const _standardFieldsAllSchemas = {
  objectId: true,
  createdAt: true,
  updatedAt: true,
  ACL: true,
}

function isStandardField(className,field) {
  return  _standardFieldsAllSchemas[field] || (_standardFields[className]!==undefined && _standardFields[className][field])
}

async function getSchemas() {
  const _schemas = await Parse.Schema.all()
  const schemas = {}
  _schemas.forEach((s) => schemas[s.className] = s)
  return schemas
}

module.exports = {
  isStandardField,
  getSchemas
};
