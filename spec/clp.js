const Parse = require('parse/node');
const Helpers = require('./helpers')

const args = {
    srcAppId:"fd7510527d71db1f",
    srcMasterKey:"be08a8386435fe8c057ead505889ddfc274d2d35e1ff08cd9614bda93e807930",
    srcUrl:"https://backend.noodl.cloud/06vxgu/fd7510527d71db1f",

    dstAppId:"de299ab1350dad2c",
    dstMasterKey:"e934bad54bd9943e18ec631d1e634fafd85a2b6da103e5fdb814593a8f8104d8",
    dstUrl:"https://backend.noodl.cloud/06vxgu/de299ab1350dad2c",
}

function _trimSchema(a) {
    a.forEach((s) => { delete s.indexes; delete s.classLevelPermissions; })

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
})