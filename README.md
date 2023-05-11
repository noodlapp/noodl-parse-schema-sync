# Parse Schema Sync CLI

This is a command line interface (CLI) that allows you to sync the schema of one Parse instance to another. This is helpful for keeping the schema of multiple Parse instances in sync.

## Installation

1. Clone this repository to your local machine
2. Run `npm install` to install the required dependencies

## Usage

To use the CLI, run the following command:

```
$ node index --srcAppId <source app ID> --srcMasterKey <source master key> --srcUrl <source URL> --dstAppId <destination app ID> --dstMasterKey <destination master key> --dstUrl <destination URL>
```

Here's an explanation of the different arguments:

- `srcAppId`: The app ID of the source Parse instance
- `srcMasterKey`: The master key of the source Parse instance
- `srcUrl`: The URL of the source Parse instance
- `dstAppId`: The app ID of the destination Parse instance
- `dstMasterKey`: The master key of the destination Parse instance
- `dstUrl`: The URL of the destination Parse instance

## Options

There is an additional option you can use:

- `--force`: This option will replace a field if it has changed. However, it will also remove all data in that field. Use with caution.

## Running Tests

To run the unit tests, you will need to set the environment variables for the source and destination Parse instances. Here's how to do it:

1. Create a `.env` file in the root of the project directory
2. Add the following lines to the file:

```
SRC_APP_ID=<source app ID>
SRC_MASTER_KEY=<source master key>
SRC_URL=<source URL>
DST_APP_ID=<destination app ID>
DST_MASTER_KEY=<destination master key>
DST_URL=<destination URL>
```

3. Replace the values with the appropriate values for your Parse instances
4. Run `npm test` to run the unit tests with the environment variables set

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.
