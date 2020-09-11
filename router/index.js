const axios = require('axios');
const cheerio = require('cheerio');
const router = require('express').Router();
const Redis = require('ioredis');
const redis = new Redis();
const { promisify } = require('util');
const wait = promisify(setTimeout);

router.get('/', async (req, res, next) => {
  const fetchData = async () => {
    const request_in_progress = await redis.get('indexRoute');
    if (request_in_progress != null) {
      console.log("The request is in progress. Wait a moment!");
      await wait(2500);
      return await fetchData.call(this);
    }

    await redis.setex('indexRoute', 30, "true");
    let data;
    const redisData = await redis.get("result");
    if (redisData == null) {
      console.log("No redis data");
      const rawData = await axios.get("http://ironman-12th.kenchenisme.com/");
      await wait(15000);
      const $ = cheerio.load(rawData.data);
      data = $('pre').text();
      await redis.setex('result', 10, data);
    } else {
      data = redisData;
    }
    await redis.del('indexRoute');
    return data;
  }

  const result = await fetchData();
  res.append('X-RateLimit-Limit', req.rateLimit);
  res.append('X-RateLimit-Remaining', req.requestRemains);
  res.status(200).send(JSON.parse(result));
})


module.exports = router;