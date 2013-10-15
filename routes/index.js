var fs = require("fs");

module.exports = function(app) {
  return fs.readdirSync(__dirname).forEach(function(file) {
    if (file === "index.js") {
      return;
    }
    var name = file.substr(0, file.indexOf("."));
    return require("./" + name)(app);
  });
};
