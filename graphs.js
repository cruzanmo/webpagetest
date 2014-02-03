"use strict";

var fs = require('fs');
var mongoClient = require('mongodb').MongoClient;

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

  // NYM: Check with product manager for more URLs
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

  // Vultre: Confirmed with Eve
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
  }
];

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
          firstByte: '$response.data.run.firstView.results.TTFB',
          firstPaint: '$response.data.run.firstView.results.firstPaint',
          titleLoad: '$response.data.run.firstView.results.titleTime',
          docReadyStart: '$response.data.run.firstView.results.domContentLoadedEventStart',
          docReadyEnd: '$response.data.run.firstView.results.domContentLoadedEventEnd',
          docLoadStart: '$response.data.run.firstView.results.loadEventStart',
          docLoadEnd: '$response.data.run.firstView.results.loadEventEnd',
          loaded: '$response.data.run.firstView.results.fullyLoaded',
          visuallyComplete: '$response.data.run.firstView.results.VisuallyCompleteDT'
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
      var htmlOutput = '<html><head><title>WebPageTest Results</title></head><body>' +
                       '<link href="stylesheets/simple-graph.css" media="all" rel="stylesheet" />' +
                       '<script>var JSONData = ' + JSON.stringify(results) + ';</script>' +
                       '<script src="javascripts/simple-graph.js"></script>' +
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

  createGraphs();


});


db.results.aggregate([
  {
    $project : {
      _id : 0,
      pageBrand: '$page.brand',
      pageType: '$page.type',
      pageUrl: '$page.url',
      date: '$response.data.completed',
      url: '$response.data.testUrl'
    }
  },
  {
    $sort: {
      date: 1,
      url: 1
    }
  }
])


/*
// fixing the data so that all entries have page details
db.copyDatabase('webpagetest','webpagetestbackup012014')
db.results.update({"response.data.testUrl" : "http://nymag.com"},{$set:{'page.brand': "NY Mag",'page.type': "homepage",'page.url': "http://nymag.com"}})
 db.results.find({"response.data.testUrl" : "http://nymag.com"},{'page':true}).pretty()
{
  "pageBrand" : "NY Mag",
  "pageType" : "homepage",
  "pageUrl" : "http://nymag.com",
  "date" : "2014-01-28T14:17:00.000Z",
  "url" : "http://nymag.com"
},
{
  "pageBrand" : "Daily Intel",
  "pageType" : "article",
  "pageUrl" : "http://nymag.com/daily/intelligencer/2013/12/jp-morgan-eases-up-on-young-bankers.html",
  "date" : "2014-01-28T14:17:07.000Z",
  "url" : "http://nymag.com/daily/intelligencer/2013/12/jp-morgan-eases-up-on-young-bankers.html"
},
{
  "pageBrand" : "Vulture",
  "pageType" : "slideshow",
  "pageUrl" : "http://www.vulture.com/2013/12/bests-and-worsts-from-the-year-in-entertainment.html#photo=1x00002",
  "date" : "2014-01-28T14:17:09.000Z",
  "url" : "http://www.vulture.com/2013/12/bests-and-worsts-from-the-year-in-entertainment.html#photo=1x00002"
},
{
  "pageBrand" : "Vulture",
  "pageType" : "article",
  "pageUrl" : "http://www.vulture.com/2013/12/saltz-how-not-wait-in-line-for-yayoi-kusama.html",
  "date" : "2014-01-28T14:17:11.000Z",
  "url" : "http://www.vulture.com/2013/12/saltz-how-not-wait-in-line-for-yayoi-kusama.html"
},
{
  "pageBrand" : "NY Mag",
  "pageType" : "restaurant picks",
  "pageUrl" : "http://nymag.com/srch?t=restaurant&N=265+336&No=0&Ns=nyml_sort_name%7C0",
  "date" : "2014-01-28T14:17:13.000Z",
  "url" : "http://nymag.com/srch?t=restaurant&N=265+336&No=0&Ns=nyml_sort_name%7C0"
},
{
  "pageBrand" : "Vulture",
  "pageType" : "homepage",
  "pageUrl" : "http://www.vulture.com/",
  "date" : "2014-01-28T14:17:13.000Z",
  "url" : "http://www.vulture.com/"
},
{
  "pageBrand" : "The Cut",
  "pageType" : "homepage",
  "pageUrl" : "http://nymag.com/thecut/",
  "date" : "2014-01-28T14:17:16.000Z",
  "url" : "http://nymag.com/thecut/"
},
{
  "pageBrand" : "The Cut",
  "pageType" : "slideshow",
  "pageUrl" : "http://nymag.com/thecut/2012/08/kate-middleton-look-book/slideshow/2012/07/30/kate_middleton_lookbook/",
  "date" : "2014-01-28T14:17:16.000Z",
  "url" : "http://nymag.com/thecut/2012/08/kate-middleton-look-book/slideshow/2012/07/30/kate_middleton_lookbook/"
},
{
  "pageBrand" : "The Cut",
  "pageType" : "article",
  "pageUrl" : "http://nymag.com/thecut/2013/12/real-reason-20-something-women-are-worried.html",
  "date" : "2014-01-28T14:17:23.000Z",
  "url" : "http://nymag.com/thecut/2013/12/real-reason-20-something-women-are-worried.html"
},
{
  "pageBrand" : "Grub Street",
  "pageType" : "homepage",
  "pageUrl" : "http://www.grubstreet.com/",
  "date" : "2014-01-28T14:17:23.000Z",
  "url" : "http://www.grubstreet.com/"
},
{
  "pageBrand" : "Grub Street",
  "pageType" : "article",
  "pageUrl" : "http://www.grubstreet.com/2013/12/whole-foods-bryant-park.html",
  "date" : "2014-01-28T14:17:31.000Z",
  "url" : "http://www.grubstreet.com/2013/12/whole-foods-bryant-park.html"
},
{
  "pageBrand" : "Bedford + Bowery",
  "pageType" : "article",
  "pageUrl" : "http://bedfordandbowery.com/2014/01/joe-galarraga-of-big-ups-is-ok-with-you-making-fun-of-his-musings-about-millennials/",
  "date" : "2014-01-28T14:18:02.000Z",
  "url" : "http://bedfordandbowery.com/2014/01/joe-galarraga-of-big-ups-is-ok-with-you-making-fun-of-his-musings-about-millennials/"
},
{
  "pageBrand" : "Vulture",
  "pageType" : "article: tv recap",
  "pageUrl" : "http://www.vulture.com/2013/12/saturday-night-live-recap-jimmy-fallon.html",
  "date" : "2014-01-28T14:18:14.000Z",
  "url" : "http://www.vulture.com/2013/12/saturday-night-live-recap-jimmy-fallon.html"
},
{
  "pageBrand" : "Bedford + Bowery",
  "pageType" : "homepage",
  "pageUrl" : "http://bedfordandbowery.com/",
  "date" : "2014-01-28T14:18:34.000Z",
  "url" : "http://bedfordandbowery.com/"
}
],
"ok" : 1
}
 */