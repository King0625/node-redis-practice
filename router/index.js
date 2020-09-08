const axios = require('axios');
const cheerio = require('cheerio');
const router = require('express').Router();
const Redis = require('ioredis');
const redis = new Redis();


router.get('/', async (req, res, next) => {
  const result = await redis.get("result");
  if (result == null) {
    const rawData = await axios.get("http://ironman-12th.kenchenisme.com/");
    const $ = cheerio.load(rawData.data);
    const data = $('pre').text();
    await redis.setex('result', 100, data);
    return res.send(JSON.parse(data));
  }
  res.append('X-RateLimit-Limit', req.rateLimit);
  res.append('X-RateLimit-Remaining', req.requestRemains);
  res.status(200).send(JSON.parse(result));
})


module.exports = router;