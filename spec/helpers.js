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
    }
}

const _standardFieldsAllSchemas = {
    objectId: true,
    createdAt: true,
    updatedAt: true,
    ACL: true,
}

async function deleteAllSchemas(appId,masterKey,url) {
    Parse.initialize(appId, undefined, masterKey);
    Parse.serverURL = url
    const schemas = await Parse.Schema.all()

    for(let s of schemas) {
        const parseSchema = new Parse.Schema(s.className);

        if(s.className !== '_Role' && s.className !== '_User') {
            // Custom class, delete it
            await parseSchema.delete()
        }
        else {
            // Delete non standard fields
            for(let field in s.fields) {
                if(!_standardFields[s.className][field] && !_standardFieldsAllSchemas[field]) {
                    await parseSchema.deleteField(field)
                }
            }
            await parseSchema.update()
        }
    }
}



module.exports = {
    deleteAllSchemas
}