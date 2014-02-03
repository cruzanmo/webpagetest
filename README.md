# Overview

### Goal
- Maintain a loading time of less than 2 seconds by identifying and eliminating bottlenecks, and measuring web page loading time daily.

### General Plan
- Maintain list of URLs of pages to test.
- launchd to run daily task that requests webpagetest for each url.
- Save results to a local mongo db.
- Create a useful graph to keep track of web page performance.
- Review graphs daily, prioritize development, alerts for any performance issues.

# Measures

### Data we are graphing

*Page loading events -v2*
- First Byte = "TTFB" - The time from the start of navigation until the first byte of the base page is returned (after following any redirects)
- "titleTime" - title displays in the browser
- Start Render = "firstPaint" or "render" - first non-white content was painted to the screen
- Load Event Start = "loadEventStart" - The reported time of the start of the load event from the W3C Navigation Timing (if supported by the browser)
- Document Complete = "loadTime", "docTime" - The time from the start of navigation until the onload event was fired (as measured by WebPagetest, not Navigation Timing)
- Fully Loaded - "fullyLoaded" - The time from the start of navigation until network activity finished after the onload event

*Page loading events -v1*
- visuallyComplete (loaded and rendered)
- loaded = "loadTime" = "docTime"
- docLoadEnd (Doc loaded)
- docLoadStart
- docReadyEnd (DOM is ready)
- docReadyStart
- titleLoad
- firstPaint
- firstByte

*Downloads*
- Bytes In (Doc) - The number of bytes downloaded before the Document Complete time
- Requests (Doc) - The number of http(s) requests before the Document Complete time
- Speed Index = "SpeedIndex" - The calculated Speed Index (only available when video capture is enabled)

### Data added for each page
- "page" :
-- "brand" : "Bedford + Bowery",
-- "type" : "homepage",
-- "url" : "http://bedfordandbowery.com/"

### All Data available through webpagetest API
- https://sites.google.com/a/webpagetest.org/docs/advanced-features/raw-test-results
"URL" : "http://bedfordandbowery.com/",
"loadTime" : 22276,
"TTFB" : 1213,
"bytesOut" : 62898,
"bytesOutDoc" : 40282,
"bytesIn" : 1828058,
"bytesInDoc" : 1755478,
"connections" : 86,
"requests" : 128,
"requestsDoc" : 93,
"responses_200" : 111,
"responses_404" : 0,
"responses_other" : 9,
"result" : 99999,
"render" : 1987,
"fullyLoaded" : 23380,
"cached" : 0,
"docTime" : 22276,
"domTime" : 0,
"score_cache" : 29,
"score_cdn" : 34,
"score_gzip" : 100,
"score_cookies" : 82,
"score_keep-alive" : 95,
"score_minify" : 100,
"score_combine" : 0,
"score_compress" : 73,
"score_etags" : 55,
"gzip_total" : 947903,
"gzip_savings" : 0,
"minify_total" : 336065,
"minify_savings" : 0,
"image_total" : 846176,
"image_savings" : 220856,
"optimization_checked" : 1,
"aft" : 0,
"domElements" : 1430,
"pageSpeedVersion" : 1.12,
"title" : "Bedford + Bowery",
"titleTime" : 1330,
"loadEventStart" : 22302,
"loadEventEnd" : 22394,
"domContentLoadedEventStart" : 3920,
"domContentLoadedEventEnd" : 4007,
"lastVisualChange" : 23009,
"browser_name" : "Internet Explorer",
"browser_version" : "9.0.8112.16421",
"server_count" : 1,
"server_rtt" : 37,
"adult_site" : 0,
"fixed_viewport" : -1,
"score_progressive_jpeg" : 17,
"firstPaint" : 1963,
"docCPUms" : 5538.036,
"fullyLoadedCPUms" : 6505.242,
"docCPUpct" : 25,
"fullyLoadedCPUpct" : 26,
"isResponsive" : -1,
"date" : 1390900677,
"SpeedIndexDT" : 9699,
"SpeedIndex" : 9699,
"VisuallyCompleteDT" : 23009,
"visualComplete" : 23009,
"renderDT" : 1993,
"effectiveBps" : 82467,
"effectiveBpsDoc" : 83344

# Setup

### Install App
- Install dependencies: mongodb and node.js.
- Clone this repo.
- npm install

### Schedule Machine Wake Up
- sudo pmset repeat wakeorpoweron MTWRFSU 09:05:00
- pmset -g sched
- you can also do this in system settings > energy saver > schedule

### Add commands to launchd

*Add mongo .plist file*
- sudo nano /Library/LaunchAgents/org.mongodb.mongod.root.plist
- paste in:

'''
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>org.mongodb.mongod.root</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/mcroney/_dev/mongo/bin/mongod</string>
    <string>--port</string>
    <string>55555</string>
  </array>
  <key>RunAtLoad</key>
  <false/>
  <key>KeepAlive</key>
  <false/>
  <key>UserName</key>
  <string>mcroney</string>
  <key>WorkingDirectory</key>
  <string>/Users/mcroney/_dev</string>
  <key>StandardErrorPath</key>
  <string>/Users/mcroney/_dev/webpagetest/mongodb-output.log</string>
  <key>StandardOutPath</key>
  <string>/Users/mcroney/_dev/webpagetest/mongodb-output.log</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>10</integer>
  </dict>
</dict>
</plist>
'''

*Add node app .plist file*
- sudo nano /Library/LaunchAgents/com.webpagetest.performance.root.plist
- paste in:

'''
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.webpagetest.performance.root</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/Users/mcroney/_dev/webpagetest/app.js</string>
  </array>
  <key>RunAtLoad</key>
  <false/>
  <key>KeepAlive</key>
  <false/>
  <key>UserName</key>
  <string>mcroney</string>
  <key>WorkingDirectory</key>
  <string>/Users/mcroney/_dev</string>
  <key>StandardErrorPath</key>
  <string>/Users/mcroney/_dev/webpagetest/output.log</string>
  <key>StandardOutPath</key>
  <string>/Users/mcroney/_dev/webpagetest/output.log</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>15</integer>
  </dict>
</dict>
</plist>
'''

*unload & load the launchd files (may need to repeat on hard restart)*
- sudo launchctl unload /Library/LaunchAgents/org.mongodb.mongod.root.plist
- sudo launchctl unload /Library/LaunchAgents/com.webpagetest.performance.root.plist
- sudo launchctl load /Library/LaunchAgents/org.mongodb.mongod.root.plist
- sudo launchctl load /Library/LaunchAgents/com.webpagetest.performance.root.plist
