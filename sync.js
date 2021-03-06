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

function _isStandardField(className,field) {
    return  _standardFieldsAllSchemas[field] || (_standardFields[className]!==undefined && _standardFields[className][field])
}

async function _getSchemas() {
    const _schemas = await Parse.Schema.all()
    const schemas = {}
    _schemas.forEach((s) => schemas[s.className] = s)
    return schemas
}

async function sync(args) {
    // First download the schema from the source server
    if(args['srcAppId'] === undefined || args['srcMasterKey'] === undefined || args['srcUrl'] === undefined) {
        console.log('You must provide srcAppId, srcMasterKey and srcUrl arguments')
        process.exit()
    }

    Parse.initialize(args['srcAppId'], undefined, args['srcMasterKey']);

    Parse.serverURL = args['srcUrl']

    const srcSchemas = await _getSchemas()

    // Ignore session and installation classes
    delete srcSchemas._Session;
    delete srcSchemas._Installation;

    // Then download the schema from the destination server
    if(args['dstAppId'] === undefined || args['dstMasterKey'] === undefined || args['dstUrl'] === undefined) {
        console.log('You must provide dstAppId, dstMasterKey and dstUrl arguments')
        process.exit()
    }

    Parse.initialize(args['dstAppId'], undefined, args['dstMasterKey']);

    Parse.serverURL = args['dstUrl']

    const dstSchemas = await _getSchemas()

    // First add all new classes (without fields)
    for(let className in srcSchemas) {
        if(!dstSchemas[className] && !_standardFields[className]) {
            console.log('Creating class ' + className)
            let schema = new Parse.Schema(className); 
            await schema.save()
        }
    }

    // Then update all classes with new fields
    for(let className in srcSchemas) {
        console.log(className)

        let srcSchema = srcSchemas[className]
        let schema = new Parse.Schema(className); 
        await schema.get()

        for(let field in srcSchema.fields) {
            const srcField = srcSchema.fields[field]

            if(_isStandardField(className,field)) {
                // Ignore standard field
            }
            else if(dstSchemas[className] && dstSchemas[className].fields[field]) {
                // Field exists
                const dstField = dstSchemas[className].fields[field]
                if(srcField.type !== 'Pointer' && srcField.type !== 'Relation') {
                    if(dstField.type !== srcField.type || dstField.required !== srcField.required || dstField.defaultValue !== srcField.defaultValue) {
                        if(args.force === true) { // Only run for force
                            console.log(`* Field ${field} has changed, purging old field and creating new...`)
                
                            // Only way is to remove and add the field again
                            schema.deleteField(field)
                            await schema.update()
                            schema.addField(field,srcField.type,{
                                required:srcField.required,
                                defaultValue:srcField.defaultValue,
                            })
                        }
                        else {
                            console.log(`* Field ${field} has changed, run with --force to replace field, WARNING will remove all data in that field`)
                        }
                    }
                }
            }
            else {
                console.log('* Adding field with type ' + srcField.type)

                const options = {
                    required:srcField.required,
                    defaultValue:srcField.defaultValue,
                }
                if(srcField.type === 'Pointer') {
                    schema.addPointer(field,srcField.targetClass,options)
                }
                else if(srcField.type === 'Relation') {
                    schema.addRelation(field,srcField.targetClass,options)
                }
                else schema.addField(field,srcField.type,options)
            }
        }

        // Copy CLP
        schema.setCLP(srcSchema.classLevelPermissions)

        await schema.update()
    }
}

module.exports = sync