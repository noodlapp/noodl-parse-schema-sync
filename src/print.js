const Parse = require('parse/node');
const {
  isStandardField,
  getSchemas
} = require('./helper');

async function printSchema(args) {
  // Download the schema from the server
  if (args['appId'] === undefined || args['masterKey'] === undefined || args['url'] === undefined) {
    console.log('You must provide appId, masterKey, and url arguments');
    process.exit();
  }

  Parse.initialize(args['appId'], undefined, args['masterKey']);
  Parse.serverURL = args['url'];

  const schemas = await getSchemas();

  // Ignore session and installation classes
  delete schemas._Session;
  delete schemas._Installation;

  // Print the schema for each class
  for (let className in schemas) {
    console.log('Class: ' + className);

    let schema = schemas[className];

    for (let field in schema.fields) {
      const schemaField = schema.fields[field];

      if (isStandardField(className, field)) {
        // Ignore standard field
      } else {
        console.log(`  Field: ${field}`);
        console.log(`    Type: ${schemaField.type}`);

        if (schemaField.type === 'Pointer') {
          console.log(`    Target Class: ${schemaField.targetClass}`);
        } else if (schemaField.type === 'Relation') {
          console.log(`    Target Class: ${schemaField.targetClass}`);
        }

        if (schemaField.required) {
          console.log('    Required: true');
        }

        if (schemaField.defaultValue !== undefined) {
          console.log(`    Default Value: ${schemaField.defaultValue}`);
        }
      }
    }

    // Print CLP
    console.log('  Class Level Permissions:');
    for (let permission in schema.classLevelPermissions) {
      console.log(`    ${permission}:`);
      for (let role in schema.classLevelPermissions[permission]) {
        console.log(`      ${role}: ${schema.classLevelPermissions[permission][role]}`);
      }
    }

    console.log('');
  }
}

module.exports = printSchema;