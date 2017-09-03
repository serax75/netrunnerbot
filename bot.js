var HTTPS = require('https');
var request = require('request');
var url = 'https://api.fiveringsdb.com/cards';

//var querystring = require('querystring');
var searchText = '';
var botID = process.env.BOT_ID;
var cards = [];
var cardID = [];
var cardSet = [];

request({
    url: url,
    json: true
}, function (error, response, body) {

    if (!error && response.statusCode === 200) {
        //console.log(body.size); // Print the json response
        var numCards = (body.size);
        for (var i=0; i < numCards; i++) {
          cards.push(body.records[i].name);
          //console.log('Cards - ' + cards.length);
          cardID.push(body.records[i].id);
          //console.log('IDs - ' + cardID.length);
          cardSet.push(body.records[i].pack_cards[0].pack.id);
          //console.log(cardSet);
          //console.log(body.records[i].name);
        }
    }
});
 
function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botCardRegex = /^!card/,
      botRuleRegex = /^!rule/; 

  if(request.text && (botCardRegex.test(request.text) || botRuleRegex.test(request.text))) {
    //Search for Card info via API
    if (botCardRegex.test(request.text)) {
      searchText = (request.text.replace(/!card/i, ''));
      console.log(searchText);
      var cardRegex = /searchText/;
      var searchResult = [];
      for (var i=0; i < cards.length; i++) {
        if (cardRegex.test(cards[i])) {
          searchResult.push(cards[i]);
        }
      }
      if (searchResult.length == 1) {
          var match = cards.indexOf(searchResult);
          searchText = 'https://fiveringsdb.com/static/cards/' + cardSet[match] + '/' + cardID[match] + '.jpg';
          console.log (searchText);
        } else {
          searchText = 'Too Many results - ';
          for (var i=0; i < searchResult.length; i++) {
            searchText += searchResult[i] + ' ';
          }
        }  
      this.res.writeHead(200);
      postMessage();
      this.res.end(); 
    } else {
      searchText = (request.text.replace(/!rule/i, ''));
      this.res.writeHead(200);
      postMessage();
      this.res.end();
    }
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = searchText;

  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}

exports.respond = respond;