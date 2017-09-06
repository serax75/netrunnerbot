var HTTPS = require('https');
var REQ = require('request');
var v = require('voca');
var url = 'https://netrunnerdb.com/api/2.0/public/cards';
var sendText = '';
var botID = process.env.BOT_ID;
    
function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botCardRegex = /^!card/,
      botRuleRegex = /^!rule/,
      searchText = '',
      cards = [],
      cardID = [],
      searchResult = [];

  if(request.text && (botCardRegex.test(request.text) || botRuleRegex.test(request.text))) {
    //Search for Card info via API
    
    if (botCardRegex.test(request.text)) {
      searchText = (request.text.replace(/!card /i, ''));
      var cardRegex = new RegExp (searchText.toLowerCase());
      REQ.get({
        url: url,
        json: true
        }, function (error, response, body) {
    
          if (!error && response.statusCode === 200) {
            //console.log(body.size); // Print the json response
            var numCards = (body.data.length);
            console.log(numCards);
            for (var i=0; i < numCards; i++) {
              cards.push(v.latinise(body.data[i].title.toLowerCase()));
              cardID.push(body.data[i].code);
            }
          }
          for (var i=0; i < cards.length; i++) {
            if (cardRegex.test(cards[i])) {
              searchResult.push(cards[i]);
              //console.log(cards[i]+ ' matches '+searchText+' index '+i);
            } else {
              //console.log('Tested \"' + searchText.toLowerCase() + '\" against ' +  cards[i] + ' - No Match');
            }
          }
          
          if (searchResult.length == 1) {
            var match = cards.indexOf(searchResult[0]);
             //console.log('Match - ' + searchResult + ' ' + match)
            sendText = 'https://netrunnerdb.com/card_image/' + cardID[match] + '.png';
            postMessage();
            //console.log (searchText);
          } else if (searchResult.length > 1) {
            match = cards.indexOf(searchResult[0]);
            sendText = 'https://netrunnerdb.com/card_image/' + cardID[match] + '.png';
            postMessage();
            sendText = 'Additional Results : ';
            for (var i=1; i < searchResult.length; i++) {
              sendText += v.titleCase(searchResult[i]);
              if (i < searchResult.length-1) {
                sendText += ', ';
              }
            }
            postMessage();
          } else{
            sendText = 'No Results Found - ' + v.titleCase(searchText);
            postMessage();
          } 
        });
    } else {
      searchText = (request.text.replace(/!rule /i, ''));
      postMessage();
    }
  } else {
    console.log("don't care");
  }
  this.res.writeHead(200);
  this.res.end();
}

function postMessage() {
  var botResponse, options, body, botReq;

  botResponse = sendText;

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