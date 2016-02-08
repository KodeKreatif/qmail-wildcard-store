#!/usr/bin/env node

var fs = require("fs");
var os = require("os");

// http://qmail.org/man/man8/qmail-command.html
//

var recipient = process.env["DEFAULT"] + "@" + process.env["HOST"];

if (recipient == "@") {
  process.exit(111);
}

var toSpamFolder = (recipient.lastIndexOf('-spam') > 0);

var targetDir = process.argv[2];

if (!targetDir || targetDir[0] == "." || targetDir[0] == "/") {
  process.exit(111);
}

var spamDir = '.Spam';
var dir = process.cwd() + "/" + targetDir + "/" + recipient.replace(/-spam@/, '@');
var destination = toSpamFolder ? dir + '/' + spamDir : dir;

var deliver = function() {
  // http://qmail.org/man/man5/maildir.html

  var mkdir = function(name) {
    try {
      fs.mkdirSync(name, 0700);
    }
    catch (e) {
      process.exit(100);
    }
  }

  var makeSpamFolder = function() {
    mkdir(spamDir);
    mkdir(spamDir + '/cur');
    mkdir(spamDir + '/tmp');
    mkdir(spamDir + '/new');
  }

  var chdir = function() {
    try {
      process.chdir(dir);
      if (toSpamFolder) {
        makeSpamFolder();
      }
    }
    catch (e) {
      process.exit(100);
    }
  }

  var stat = function() {
    var fileName = (new Date()).valueOf() + "." + process.pid + "." + os.hostname();
    try {
      var stat = fs.statSync(destination + "/tmp/" + fileName);
    }
    catch (e) {
      return fileName;
    }
    return null;
  }

  var write = function(fileName) {
    var writeable = fs.createWriteStream(destination + "/tmp/" + fileName);
    writeable.on("finish", function(){
      fs.linkSync(destination + "/tmp/" + fileName, destination + "/new/" + fileName);
      fs.unlinkSync(destination + "/tmp/" + fileName);
    });
    process.stdin.pipe(writeable);
  }

  chdir();
  var fileName = stat();
  var counter = 2;
  if (fileName == null) {
    var loopId = setInterval(function() {
      counter --;
      fileName = stat();
      if (fileName == null && counter == 0) {
        // Can't get file
        process.exit(100);
      }
      else if (fileName != null) {
        clearInterval(loopId);
        write(fileName);
      }
    }, 2000);
  } else {
    write(fileName);
  }
}

deliver();
