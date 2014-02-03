# Overview

### Goal
- Maintain a loading time of less than 2 seconds by identifying and eliminating bottlenecks, and measuring web page loading time daily.

### General Plan
- Maintain list of URLs of pages to test.
- launchd to run daily task that requests webpagetest for each url.
- Save results to a local mongo db.
- Create a useful graph to keep track of web page performance.
- Review graphs daily, prioritize development, alerts for any performance issues.

## Understanding the data

# Setup

### Clone repo
- Assumes that you have this repo here: /Users/mcroney/_dev/webpagetest/
- cd /Users/mcroney/_dev/webpagetest/
- npm install

### Wake up the machine
- sudo pmset repeat wakeorpoweron MTWRFSU 09:05:00
- pmset -g sched
- you can also do this in system settings > energy saver > schedule

### Add mongo .plist file
- sudo nano /Library/LaunchAgents/org.mongodb.mongod.root.plist
- paste in:

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


### Add node app .plist file
- sudo nano /Library/LaunchAgents/com.webpagetest.performance.root.plist
- paste in:

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

### unload the launchd files if you made changes
- sudo launchctl unload /Library/LaunchAgents/org.mongodb.mongod.root.plist
- sudo launchctl unload /Library/LaunchAgents/com.webpagetest.performance.root.plist

### load the launchd files (this may need to be done after a hard restart
- sudo launchctl load /Library/LaunchAgents/org.mongodb.mongod.root.plist
- sudo launchctl load /Library/LaunchAgents/com.webpagetest.performance.root.plist

