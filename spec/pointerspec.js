const Parse = require('parse/node');
const Helpers = require('./helpers')

const args = Helpers.args

function _trimSchema(a) {
    a.forEach((s) => { delete s.indexes; delete s.classLevelPermissions; })
    a = a.filter(s => s.className !== '_Session') // Ignore session class for these tests
    a.sort((a,b) => a.className > b.className ? -1 : 1)
    return a
}

describe("pointer tests",() => {
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

  
    it('can add two classes with pointers to each other',async () => {
        // Add two classes that points to each other
        Parse.initialize(args['srcAppId'], undefined, args['srcMasterKey']);
        Parse.serverURL = args['srcUrl']

        const class1 = new Parse.Schema('MyClass');
        await class1.save()

        const class2 = new Parse.Schema('MyClass2');
        await class2.save()

        class1.addPointer("daPointer","MyClass2")
        await class1.update()

        class2.addRelation("daRelation","MyClass")
        await class2.update()

        // Run sync
        await sync(args)

        // Verify
        Parse.initialize(args['dstAppId'], undefined, args['dstMasterKey']);
        Parse.serverURL = args['dstUrl']

        const result = await Parse.Schema.all()
        expect(_trimSchema(result)).toEqual(
            [{"className":"_User","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"username":{"type":"String"},"password":{"type":"String"},"email":{"type":"String"},"emailVerified":{"type":"Boolean"},"authData":{"type":"Object"}}},{"className":"_Role","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"name":{"type":"String"},"users":{"type":"Relation","targetClass":"_User"},"roles":{"type":"Relation","targetClass":"_Role"}}},{"className":"MyClass2","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"daRelation":{"type":"Relation","targetClass":"MyClass"}}},{"className":"MyClass","fields":{"objectId":{"type":"String"},"createdAt":{"type":"Date"},"updatedAt":{"type":"Date"},"ACL":{"type":"ACL"},"daPointer":{"type":"Pointer","targetClass":"MyClass2"}}}]            
        )
    })
})