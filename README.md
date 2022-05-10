# Setup
1. Clone this repo
2. Run `npm install`

# Usage

This CLI will sync the schema from one parse instance to another. It will only create new classes, create new fields and set the CLP of each class, so it wont perform any destructive operations.

$ node index --srcAppId "app id of source parse" --srcMasterKey "xxx" --srcUrl "url to source parse" --dstAppId "..." --dstMasterKey "..." --dstUrl "..."