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