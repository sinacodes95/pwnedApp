const express = require('express');
const router = express.Router();
const request = require('request');
// got blocked by cloudflare, cloudscraper allows us to bypass the waf.
const cloudScraper = require('cloudscraper');

router.get('/email/:account', (req, res, next)  => {
    cloudScraper.get(`https://api.haveibeenpwned.com/unifiedsearch/${req.params.account}`, (error, response, body) => {
      if (error) {
        res.send(error);
        next(error);
      }
      res.json(body);
    });
});

router.get('/password/:hash', (req, res, next)  => {
  request(`https://api.pwnedpasswords.com/range/${req.params.hash}`, (error, response, body) => {
    if (error) {
      res.send(error);
      next(error);
    }
    res.json(body);
  });
});


module.exports = router;  