"use strict";

var fs = require('fs');
var mongoClient = require('mongodb').MongoClient;
var key = require("./key");
var WebPageTest = require('webpagetest');
var wpt = new WebPageTest('www.webpagetest.org', key.appKey);

var testDate = new Date();
console.log('--------------------------------------------');
console.log(
  'Webpagetest initiated at ' +
  testDate.getHours() + ':' +
  (testDate.getMinutes()<10?'0':'') + testDate.getMinutes() +
  ' on ' + testDate.getFullYear() + '-' +
  (testDate.getMonth()<9?'0':'') + (testDate.getMonth()+1) + '-' +
  (testDate.getDate()<10?'0':'') + testDate.getDate()
);

/*
 * Array of pages to test
 * Should be a good cross-section of each unique page type
 * Limited to 200 requests/day by our public key
 */

var testPages = [

  // NYM: URLs from Nick.
  {
    'brand': 'NY Mag',
    'type': 'homepage',
    'url': 'http://nymag.com'
  },
  {
    'brand': 'NY Mag',
    'type': 'restaurant picks',
    'url': 'http://nymag.com/srch?t=restaurant&N=265+336&No=0&Ns=nyml_sort_name%7C0'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/12/jp-morgan-eases-up-on-young-bankers.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/10/slideshow-21-glimpses-of-sandys-destruction.html
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/02/slideshow-every-westminster-dog-is-a-favorite.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/08/13-nyc-cycling-tips-citi-bike-tricks-gifs.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/03/miss-saturdays-march-madness-heres-a-gif-cap.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2009/11/8216cash_for_clunkers8217_mean.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2010/04/so_this_happened.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2011/11/ap-staff-scolded-for-tweeting-about-ows-arrests.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2012/11/exhaustive-collection-of-pundit-predictions.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/12/cuomo-2016-campaign.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/03/march-madness-memories-1964-championship.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/03/video-world-trade-center-skydive.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/01/richard-sherman-interview.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/10/debt-ceiling-and-the-conservative-bubble.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/02/i-crashed-a-wall-street-secret-society.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/07/questlove-trayvon-martin-and-i-aint-shit.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/04/grad-student-who-shook-global-austerity-movement.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/06/naked-man-san-francisco-bart-subway-video.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/05/facts-are-in-and-paul-ryan-is-wrong.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2013/01/vine-celebrities-tyra-garcia-enrique-dyke-epps.html'
  },
  {
    'brand': 'Daily Intel',
    'type': 'article',
    'url': 'http://nymag.com/daily/intelligencer/2014/02/best-worst-reactions-to-michael-sam-coming-out.html'
  },
  
  // Vulture: Confirmed with Eve
  // For Vulture: homepage and articles. Article types: TV Recaps, Slideshows, and everything else.
  {
    'brand': 'Vulture',
    'type': 'homepage',
    'url': 'http://www.vulture.com/'
  },
  {
    'brand': 'Vulture',
    'type': 'article',
    'url': 'http://www.vulture.com/2013/12/saltz-how-not-wait-in-line-for-yayoi-kusama.html'
  },
  {
    'brand': 'Vulture',
    'type': 'slideshow',
    'url': 'http://www.vulture.com/2013/12/bests-and-worsts-from-the-year-in-entertainment.html#photo=1x00002'
  },
  {
    'brand': 'Vulture',
    'type': 'article: tv recap',
    'url': 'http://www.vulture.com/2013/12/saturday-night-live-recap-jimmy-fallon.html'
  },

  // The Cut: Check with product manager for more URLs
  {
    'brand': 'The Cut',
    'type': 'homepage',
    'url': 'http://nymag.com/thecut/'
  },
  {
    'brand': 'The Cut',
    'type': 'article',
    'url': 'http://nymag.com/thecut/2013/12/real-reason-20-something-women-are-worried.html'
  },
  {
    'brand': 'The Cut',
    'type': 'slideshow',
    'url': 'http://nymag.com/thecut/2012/08/kate-middleton-look-book/slideshow/2012/07/30/kate_middleton_lookbook/'
  },

  // Grub Street: Confirmed with Justin
  {
    'brand': 'Grub Street',
    'type': 'homepage',
    'url': 'http://www.grubstreet.com/'
  },
  {
    'brand': 'Grub Street',
    'type': 'article',
    'url': 'http://www.grubstreet.com/2013/12/whole-foods-bryant-park.html'
  },

  // Bedford + Bowery
  {
    'brand': 'Bedford + Bowery',
    'type': 'homepage',
    'url': 'http://bedfordandbowery.com/'
  },
  {
    'brand': 'Bedford + Bowery',
    'type': 'article',
    'url': 'http://bedfordandbowery.com/2014/01/joe-galarraga-of-big-ups-is-ok-with-you-making-fun-of-his-musings-about-millennials/'
  }

];

// Convert date string to iso date. Current format is like Date.toString(): "Thu, 02 Jan 2014 14:25:27 +0000"
var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function convertToIso(dateString) {
  var newDate = new Date(dateString.substr(12,4),months.indexOf(dateString.substr(8,3)),dateString.substr(5,2),(parseInt(dateString.substr(17,2))-5),dateString.substr(20,2),dateString.substr(23,2));
  var isoDate = newDate.toISOString();
  return isoDate;
}

mongoClient.connect('mongodb://localhost:55555/webpagetest', {}, function(err,db) {

  if (err) throw err;

  var progress = {
    'totalPages': testPages.length,
    'totalSuccess': 0,
    'totalFail': 0,
    'start' : function() {
      requestFromWebpagetest();
      //createGraphs();
    },
    'moveOn': function(error) {
      if ( ! error) {
        this.totalSuccess += 1;
      } else {
        this.totalFail += 1;
        console.log(error.toString());
      }
      if (this.totalPages === (this.totalSuccess + this.totalFail)) {
        // go to next step
        createGraphs();
      }
    },
    'done': function() {
      console.log('Total pages tested: ' + this.totalSuccess + '. Total pages not tested: ' + this.totalFail + '.');
      //db.close();
    }
  };

  function requestFromWebpagetest() {
    testPages.forEach(function(testPage, i, a){
      wpt.runTest(testPage.url, function(err, data) {
        if (err) {
          progress.moveOn(err);
        } else {
          console.log('Request submitted: ' + testPage.url);
          var testId = data.data.testId;
          var totalWaitMinutes = 0;
          checkForResults();
        }
        function checkForResults() {
          wpt.getTestResults(testId, function(err, data) {
            if (err) {
              progress.moveOn(err);
            } else {
              var minutesToWait = 5;
              switch (Math.floor(data.response.statusCode/100)) {
                case 1:
                  console.log('In progress: ' + testPage.url + '. Trying again in ' + minutesToWait + ' minutes.');
                  totalWaitMinutes += minutesToWait;
                  if (totalWaitMinutes > minutesToWait*15) {
                    progress.moveOn('Abort: ' + testPage.url + '. Waited ' + (minutesToWait*15) + ' minutes.');
                  } else {
                    setTimeout(checkForResults,minutesToWait*60*1000);
                  }
                  break;
                case 2:
                  console.log('Success: results received: ' + testPage.url);
                  // add page information to results object
                  data.page = testPage;
                  // convert to iso date
                  data.response.data.completed = convertToIso(data.response.data.completed);
                  db.collection('results').insert(data, function(err, inserted) {
                    if (err) console.log(err.message);
                    console.dir('Success: saved to database: ' + testPage.url);
                    progress.moveOn();
                  });
                  break;
                default:
                  progress.moveOn('Error: ' + data.response.statusCode + ' ' + data.response.statusText);
                  break;
              }
            }
          });
        }
      });
    });
  }

  function createGraphs() {

    /* Query mongodb for:

     response.data.completed == date of test
     response.data.testUrl == test url

     response.data.run.firstView.results.
         "URL" : "http://nymag.com",
         "domTime" : 0,
         * "TTFB" : 168, (time from http request to receiving first byte)
         ? "render" : 192, ??? page stops being blank?
         "renderDT" : 194, ???
         * "firstPaint" : 207,
         * "titleTime" : 282,
         * "domContentLoadedEventStart" : 1896, = $(document).ready()
         * "domContentLoadedEventEnd" : 1981,
         "docTime" : 4456,
         "loadTime" : 4456,
         * "loadEventStart" : 4471,
         "loadEventEnd" : 4472,
         * "fullyLoaded" : 5708,
         "lastVisualChange" : 7695,
         * "VisuallyCompleteDT" : 7695,
         "visualComplete" : 7695,

     Add later:
     response.data.run.repeatView.results.

    */


/*    **Page loading events -v2**
    - First Byte = "TTFB" - The time until the first byte of the base page is returned (after following any redirects)
    - "titleTime" - title displays in the browser
    - Start Render = "firstPaint" or "render" - first non-white content was painted to the screen
    - Load Event Start = "loadEventStart" - browser reported time of the start of the load event from the W3C Navigation Timing
    - Document Complete = "loadTime", "docTime" - The time until the onload event was fired (as measured by WebPagetest, not Navigation Timing)
    - Fully Loaded - "fullyLoaded" - The time until network activity finished after the onload event (all assets loaded)

  **Stats**
    - Bytes In (Doc) = "bytesInDoc" - The number of bytes downloaded before the Document Complete time
      - Requests (Doc) = "requestsDoc" - The number of http(s) requests before the Document Complete time

### Data added for each page
    - "page" :
    -- "brand" : "Bedford + Bowery"
    -- "type" : "homepage"
    -- "url" : "http://bedfordandbowery.com/"

    */


    console.log('Query MongoDB.');
    db.collection('results').aggregate([
      {
        $project : {
          _id : 0,
          pageBrand: '$page.brand',
          pageType: '$page.type',
          pageUrl: '$page.url',
          date: '$response.data.completed',
          url: '$response.data.testUrl', //now redundant
          firstByte: '$response.data.run.firstView.results.TTFB', //1
          titleLoad: '$response.data.run.firstView.results.titleTime', //2
          firstPaint: '$response.data.run.firstView.results.firstPaint', //3
          loadEventStart: '$response.data.run.firstView.results.loadEventStart', //4
          docComplete: '$response.data.run.firstView.results.docTime', //5
          fullyLoaded: '$response.data.run.firstView.results.fullyLoaded', //6
          visuallyComplete: '$response.data.run.firstView.results.VisuallyCompleteDT', //7 optional
          // stats
          bytesInDoc : '$response.data.run.firstView.results.bytesInDoc',
          requestsDoc : '$response.data.run.firstView.results.requestsDoc'
        }
      },
      {
        $sort: {
          url: 1,
          date: 1
        }
      }
    ],function(err, results) {
      if (err) throw err;
      db.close();

      // Create graphs from data
      console.log('Creating useful graphs from mongodb data.');
      // Format HTML
      /*
      var htmlOutput = '<html><head><title>WebPageTest Results</title></head><body>' +
        '<link href="stylesheets/simple-graph.css" media="all" rel="stylesheet" />' +
        '<script>var JSONData = ' + JSON.stringify(results) + ';</script>' +
        '<script src="javascripts/simple-graph.js"></script>' +
        '</body></html>';
      */
      var htmlOutput = '<html><head><title>WebPageTest Results</title></head><body>' +
        '<link href="stylesheets/simple-graph.css" media="all" rel="stylesheet" />' +
        '<script>var JSONData = ' + JSON.stringify(results) + ';</script>' +
        '<script src="javascripts/simple-chart.js"></script>' +
        '</body></html>';

      // Save to file
      var resultsFile = __dirname + '/public/results.html';
      fs.writeFile(resultsFile , htmlOutput, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log('Results saved to ' + resultsFile + '!');
        }
      });


    });

    /*
    console.log('Creating useful graphs from mongodb data.');
    console.log('Generate graphs (using package?).');
    console.log('Save html graph file or image?.');
    console.log('Send email if necessary.');
    console.log('Close database connection and quit the app.');
    progress.done();

    */
  }


  // Start the process
  progress.start();

});
