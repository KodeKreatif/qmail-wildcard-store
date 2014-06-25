#!/usr/bin/env node

var fs = require("fs");
var os = require("os");

// http://qmail.org/man/man8/qmail-command.html
//

var recipient = process.env["DEFAULT"] + "@" + process.env["HOST"];

if (recipient == "@") {
  process.exit(111);
}

var targetDir = process.argv[2];

if (!targetDir || targetDir[0] == "." || targetDir[0] == "/") {
  process.exit(111);
}

var dir = process.cwd() + "/" + targetDir + "/" + recipient;

var deliver = function() {
  // http://qmail.org/man/man5/maildir.html
  

  var chdir = function() {
    try {
      process.chdir(dir);
    }
    catch (e) {
      process.exit(100);
    }
  }

  var stat = function() {
    var fileName = (new Date()).valueOf() + "." + process.pid + "." + os.hostname();
    try {
      var stat = fs.statSync(dir + "/tmp/" + fileName);
    }
    catch (e) {
      return fileName;
    }
    return null;
  }

  var write = function(fileName) {
    var writeable = fs.createWriteStream(dir + "/tmp/" + fileName);
    writeable.on("finish", function(){
      fs.linkSync(dir + "/tmp/" + fileName, dir + "/new/" + fileName);
      fs.unlinkSync(dir + "/tmp/" + fileName);
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
