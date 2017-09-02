var HTTPS = require('https');
var querystring = require('querystring');
var searchText = '';

var host = 'https://api.fiveringsdb.com/cards';
var cards = HTTPS.get('host'); 


var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botCardRegex = /^!card/,
      botRuleRegex = /^!rule/; 

  if(request.text && (botCardRegex.test(request.text) || botRuleRegex.test(request.text))) {
    //Search for Card info via API
    if (botCardRegex.test(request.text)) {
      //searchText = request.text.replace(/!card/i, '');
      console.log(cards);
      searchText = "Card Search";
      this.res.writeHead(200);
      postMessage();
      this.res.end(); 
    } else {
      //searchText = request.text.replace(/!rule/i, '');
      searchText = "Rule Search";
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