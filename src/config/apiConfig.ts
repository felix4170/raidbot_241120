// config.js
import dotenv from 'dotenv';
import { TwitterApi } from 'twitter-api-v2';

// Load environment variables from the .env file
dotenv.config();

// Define the shape of the config object (with type annotations)
interface Config {
  apiKey: string | undefined;
  apiSecretKey: string | undefined;
  accessToken: string | undefined;
  accessTokenSecret: string | undefined;
  bearerToken: string | undefined;

}

const config: Config  = {
  apiKey: process.env.API_KEY,
  apiSecretKey: process.env.API_SECRET_KEY,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  bearerToken: process.env.BEARER_TOKEN,  // Add bearerToken in the config

};


// Ensure BEARER_TOKEN is defined before initializing the TwitterApi client
if (!config.bearerToken) {
  throw new Error("BEARER_TOKEN is missing from environment variables");
}


// Initialize the Twitter client
const client = new TwitterApi({
  appKey: config.apiKey as string,
  appSecret: config.apiSecretKey as string,
  accessToken: config.accessToken as string,  
  accessSecret: config.accessTokenSecret as string,
});




const bearer = new TwitterApi(config.bearerToken as string);


const twitterClient = client.readWrite;
const twitterBearer = bearer.readOnly;

export { twitterClient, twitterBearer };