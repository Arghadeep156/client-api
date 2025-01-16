const redis = require("redis");
const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL, // Specify your Redis server URL (default is localhost)
});

// Connect to the Redis server
client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.log("Redis Client Error", err);
  });

// Error handling: Listening for errors
client.on("error", (err) => {
  console.log("Redis Client Error", err);
});

const setJWT = async (key, value) => {
  try {
    const res = await client.set(key, value);
    return res; // This should be "OK" if the operation succeeds
  } catch (error) {
    console.log(error); // Throw the error if something goes wrong
  }
};

const getJWT = async (key) => {
  try {
    const result = await client.get(key);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const deleteJWT = async (key) => {
  try {
    client.del(key);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { setJWT, getJWT, deleteJWT };
