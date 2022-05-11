const Parse = require('parse/node');
const Helpers = require('./helpers')

const args = Helpers.args

function _trimSchema(a) {
    a.forEach((s) => { delete s.indexes; delete s.classLevelPermissions; })
    a = a.filter(s => s.className !== '_Session') // Ignore session class for these tests
    a.sort((a,b) => a.className > b.className ? -1 : 1)
    return a
}

function _onlyCLP(a) {
    a.forEach((s) => { delete s.indexes; delete s.fields; })

    return a
}

describe("class level permissions tests",() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    // Start the server
    const sync = require('../sync.js')

    it('setup',async () => {
        // Remove all schemas from src and dst test servers
        await Helpers.deleteAllSchemas(args['srcAppId'],args['srcMasterKey'],args['srcUrl'])
        const srcSchemas = await Parse.Schema.all()
        expect(_trimSchema(srcSchemas)).toEqual([{"className":"_User","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"username":{"type":"String"},"password":{"type":"String"},"email":{"type":"String"},"emailVerified":{"type":"Boolean"},"authData":{"type":"Object"}}},{"className":"_Role","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"name":{"type":"String"},"users":{"type":"Relation","targetClass":"_User"},"roles":{"type":"Relation","targetClass":"_Role"}}}])
        
        await Helpers.deleteAllSchemas(args['dstAppId'],args['dstMasterKey'],args['dstUrl'])
        const dstSchemas = await Parse.Schema.all()
        expect(_trimSchema(dstSchemas)).toEqual([{"className":"_User","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"username":{"type":"String"},"password":{"type":"String"},"email":{"type":"String"},"emailVerified":{"type":"Boolean"},"authData":{"type":"Object"}}},{"className":"_Role","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"name":{"type":"String"},"users":{"type":"Relation","targetClass":"_User"},"roles":{"type":"Relation","targetClass":"_Role"}}}])
    })

  
    it('can create new class with CLP',async () => {
        // Add two classes that points to each other
        Parse.initialize(args['srcAppId'], undefined, args['srcMasterKey']);
        Parse.serverURL = args['srcUrl']

        const class1 = new Parse.Schema('MyClass');
        class1.setCLP({
            create:{"*":true}
        })
        await class1.save()

        // Run sync
        await sync(args)

        // Verify
        Parse.initialize(args['dstAppId'], undefined, args['dstMasterKey']);
        Parse.serverURL = args['dstUrl']

        const result = await Parse.Schema.all()
        expect(_onlyCLP(result)).toEqual(
            [{"className":"_User","classLevelPermissions":{"find":{"*":true},"count":{"*":true},"get":{"*":true},"create":{"*":true},"update":{"*":true},"delete":{"*":true},"addField":{"*":true},"protectedFields":{"*":[]}}},{"className":"_Role","classLevelPermissions":{"find":{"*":true},"count":{"*":true},"get":{"*":true},"create":{"*":true},"update":{"*":true},"delete":{"*":true},"addField":{"*":true},"protectedFields":{"*":[]}}},{"className":"MyClass","classLevelPermissions":{"find":{},"count":{},"get":{},"create":{"*":true},"update":{},"delete":{},"addField":{},"protectedFields":{}}}]
        )
    })

    it("can change CLP on existing class",async () => {
        // Add two classes that points to each other
        Parse.initialize(args['srcAppId'], undefined, args['srcMasterKey']);
        Parse.serverURL = args['srcUrl']

        const class1 = new Parse.Schema('MyClass');
        await class1.get()
        class1.setCLP({
            find:{"*":true},
            create:{"*":true}
        })
        await class1.update()

        // Run sync
        await sync(args)

        // Verify
        Parse.initialize(args['dstAppId'], undefined, args['dstMasterKey']);
        Parse.serverURL = args['dstUrl']

        const result = await Parse.Schema.all()
        expect(_onlyCLP(result)).toEqual(
            [{"className":"_User","classLevelPermissions":{"find":{"*":true},"count":{"*":true},"get":{"*":true},"create":{"*":true},"update":{"*":true},"delete":{"*":true},"addField":{"*":true},"protectedFields":{"*":[]}}},{"className":"_Role","classLevelPermissions":{"find":{"*":true},"count":{"*":true},"get":{"*":true},"create":{"*":true},"update":{"*":true},"delete":{"*":true},"addField":{"*":true},"protectedFields":{"*":[]}}},{"className":"MyClass","classLevelPermissions":{"find":{"*":true},"count":{},"get":{},"create":{"*":true},"update":{},"delete":{},"addField":{},"protectedFields":{}}}]
        )
    })
})