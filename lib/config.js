module.exports = {
	config: 'default'
}

//695
if (devices.length === 0) {
  if (!!links) {
    //status.response.link DOESNT EXIST... causes error
    //links.push(status.response.link);
    links.push(status);
    next(null, links);
  } else {
    //status.response.link DOESNT EXIST... causes error
    //next(null, status.response.link);
    next(null, status);
  }
} else {
  links.push(status.response.link);
  linkResponders(gw, links, devices,  gwCmd, allLinkCmd, next);
}

//UNLINK NEEDS TO UNLINK BOTH controller == false ANDDDDD controller == true. It only unlinks controller == false.

//605
//line 1569... bugs

var RAMP_RATES = [
  2000, // shouldn't be used
  480000,
  420000,
  360000,
  300000,
  270000,
  240000,
  210000,
  180000,
  150000,
  120000,
  90000,
  60000,
  47000,
  43000,
  38500,
  34000,
  32000,
  30000,
  28000,
  26000,
  23500,
  21500,
  19000,
  8500,
  6500,
  4500,
  2000,
  500,
  300,
  200,
  100
];

function rampRateToHexHalfByte(rate) {

  for(var i = 0; i < RAMP_RATES.length; i++) {
    if (rate >= RAMP_RATES[i + 1] && rate <= RAMP_RATES[i]) {
      break;
    }
  }
  console.log(i, "klsdjhf", ~~((RAMP_RATES[i])/2) );
  //return toByte(~~((RAMP_RATES[i])/2));
}

Hey {author}!

First, I want to thank you for putting this together. It has been an amazing help when trying to interface with my Insteon system. 
In working with the current build, I found a few bugs I want to discuss and fix (notably rampRateToHexHalfByte() doesn't work). 
I'll give you a pull request with the tiny fixes I noticed.

Bug Hunt:

A bug with .link() -> I get an error from "status.response.link". It doesn't exist and causes an error when next() tries to pass this 'undefined' thing. Did this used to work??
I cannot get turnOn or turnOff to work - there is still probably something wrong with rampRateToHexHalfByte(), which it depends on. More or less, I cannot define a custom rampRate when also trying to change a light level.

In addition to bug hunting, I've also been looking at the design of this api, and wanted to discuss a few ideas with you.

Design Notes:
- This api requires the user of the api to close any open sockets with every new command or else ETIMEOUT will fire after about 30 seconds. I think Socket.KeepAlive causes the crash. I don't understand the benefit of needing to close the socket after a moment of commands have finished. 
I typically keep sockets open for a long long time. If I wanted to use the api in this way, I'd rather it be RESFTful http. Over time, after opening and closeing sockets every copuple of seconds, the hub gets clogged and starts to lag.

- To check if something exists, the I see you using an unstable check in your if statements - this causes weird bugs at times. You should use if(!!{obj} [|| obj === 0]). The optiontional OR is for when {int} 0 is a possible value. The !! is better at understanding if something isn't null, undefined, 'undefined', 0, etc.

I would love to have a chat about this and understand how you approached designing this api. It would help me greatly with a project I'm working on and I also hope we'll both learn a lot from it.
There is also a hard to catch bug where the .level command will sometimes return {int} 0, when that is just not correct. This happens when I interact with the hub frequently (every 2 seconds) [loop looks like: 1. opening connection 2. grabbing level 3. close connection] Here's an example of what I put in a loop:



//There are also a few bugs I'd like to fix in here with rampRateToHexHalfByte()

//A bug with .link() -> status.response.link doesn't exist and causes an error when next() tries to pass this 'undefined' thing. Did this use to work??
//I cannot get turnOn or turnOff to work - there is still probably something wrong with rampRateToHexHalfByte() that it depends on. More or less, I cannot define a custom rampRate when also trying to change a light.

//I would love to have a chat about this and understand how you approached designing this api. It would help me greatly with a project I'm working on and I also hope we'll both learn a lot from it.

//There is also a hard to catch bug where the .level command with sometimes return {int} 0, when that is just not correct. This happens only once I start frequently (every 2 seconds) [loop looks like: 1. opening connection 2. grabbing level 3. close connection]
