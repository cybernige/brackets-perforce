define(function (require, exports, module) {
    "use strict";

    var nodeConnection = new (brackets.getModule("utils/NodeConnection"))(),
        extUtils       = brackets.getModule("utils/ExtensionUtils"),
        p4Path         = extUtils.getModulePath(module, "node-p4.js"),
        init           = nodeConnection.connect(true)
            .pipe(function () {
                return nodeConnection.loadDomains([p4Path], true);
            });
    
    module.exports = {
        checkout: function (filepath, workspace) {
            return init.pipe(function () { 
               return nodeConnection.domains.perforce.checkout(filepath, workspace); 
            });
        },
        add: function (filepath, workspace) {
            return init.pipe(function () { 
               return nodeConnection.domains.perforce.add(filepath, workspace); 
            });
        },
        "delete": function (filepath, workspace) {
            return init.pipe(function () { 
               return nodeConnection.domains.perforce.delete(filepath, workspace); 
            });
        }, 
        revert: function (filepath, workspace) {
            return init.pipe(function () { 
               return nodeConnection.domains.perforce.revert(filepath, workspace); 
            });
        }
    };
   
});