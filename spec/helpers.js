const parse = require('parse');
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

async function deleteAllSchemas(appId,masterKey,url) {
    Parse.initialize(appId, undefined, masterKey);
    Parse.serverURL = url
    const schemas = await Parse.Schema.all()

    for(let s of schemas) {
        const parseSchema = new Parse.Schema(s.className);

        if(!_standardFields[s.className]) {
            // Custom class, delete it
            await parseSchema.purge()
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

const args = {
    srcAppId:process.env.SRC_APP_ID,
    srcUrl:process.env.SRC_URL,
    srcMasterKey:process.env.SRC_MASTER_KEY,

    dstAppId:process.env.DST_APP_ID,
    dstUrl:process.env.DST_URL,
    dstMasterKey:process.env.DST_MASTER_KEY,    
}

module.exports = {
    deleteAllSchemas,
    args
}