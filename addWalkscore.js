
// utils
NodeList.prototype.forEach = Array.prototype.forEach;
let $ = (...args) => document.querySelectorAll(...args);

function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}
function createWalkscoreNode (walk) {
  return htmlToElement(`<li><b>${walk}</b> walk</li>`)
}

//async function getScores(address) {
//  let score = Math.floor(100*Math.random());
//  //getContentByURL()
//  return score;
//};


async function cacheScore(address, score) {
  let toSet = {};
  toSet[address] = score;
  return browser.storage.local.set(toSet);
}

async function getCachedScore(address) {
  let ans = await browser.storage.local.get(address).address;
  if (ans) return ans.score;
  return null;
}

function getContentByURL(url, callback) {
    var req = new XMLHttpRequest();
    if(req) {
        req.open('GET', url, true);
        req.onreadystatechange =  function() {
            if (req.readyState == 4) {
                callback(req.responseText);
            }
        };
        req.send();
    }
};


function scrapeListingForWalkScore (href, ii) {
  return new Promise(function (res,rej) {
    let score = 0;
    let test = new RegExp('has a WalkScore&trade; of (\\d+)');
    let fullUrl = `http://www.estately.com${href}`;
    getContentByURL(fullUrl,
      (text)=> {
        let matches = test.exec(text);
        if (matches) {score = matches[1]}
        //console.log(`${ii}:: score:${score}, ${fullUrl}`);
        res(score);
      }
    );
  })
}

async function augmentListing (node, ii) {
  let addressSlug = node.getAttribute('href');
  let listNode = node.querySelector('ul');
  let score = await getCachedScore(addressSlug);
  if (!score) {
    score = await scrapeListingForWalkScore(addressSlug,ii);
    cacheScore(addressSlug, score);
  }
  //scrapeListingForWalkScore(address, ii);
  listNode.appendChild(createWalkscoreNode(score))
};

$('.result-item').forEach(augmentListing);

//$('.result-basics > .list-unstyled').forEach(augmentListing);
//scrapeListingForWalkScore('',0);

