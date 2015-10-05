/*globals define, brackets, DOMParser, p4, console, document */
define(function (require, exports, module) {
    "use strict";

    var FileUtils      	= brackets.getModule("file/FileUtils"),
		FileSystem 		= brackets.getModule("filesystem/FileSystem"),
		CommandManager 	= brackets.getModule("command/CommandManager"),
		EditorManager   = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
		ProjectManager 	= brackets.getModule("project/ProjectManager"),
        Menus          	= brackets.getModule("command/Menus"),
		PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        ExtensionLoader = brackets.getModule("utils/ExtensionLoader"),
		contextMenu		= Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU),
		CONFIG_NAME 	= "config.json",
		rootPath		= "",
		p4;

    // Function to run when the menu item is clicked


	function doCheckout(document) {
		var filePath = document.file.fullPath,
			p4 = require("p4"),
			splitRootArray = [],
			splitFilePathArray = [],
			p4Workspace = rootPath;

		splitRootArray = rootPath.split("/");
		splitFilePathArray = filePath.split("/");
		p4Workspace = splitFilePathArray[splitRootArray.length];
		p4.checkout(filePath, p4Workspace).fail(p4.add(filePath, p4Workspace));
		console.log("Checked out " + filePath + " " + p4Workspace);
	}

    function checkoutFile() {
		var activeEditor = EditorManager.getActiveEditor(),
			document = DocumentManager.getCurrentDocument();

		if (activeEditor && document === activeEditor.document) {
			doCheckout(document);
		}
	}

	brackets.getModule("utils/AppInit").appReady(function () {
		var config = {},
			extensionPath =  ExtensionLoader.getUserExtensionPath() + "/brackets-perforce/",
		    file = FileSystem.getFileForPath(extensionPath + CONFIG_NAME),
			isAutoCheckout = false,
			prefs = PreferencesManager.getExtensionPrefs("brackets-perforce"),
			promise = FileUtils.readAsText(file);  // completes asynchronously

        promise.done(function (text) {
			config = JSON.parse(text);
			rootPath = config.root;
        })
        .fail(function (errorCode) {
           console.log("failed to read " + CONFIG_NAME + " " + errorCode);
        });

		if (prefs && prefs.get("auto_checkout_enabled")) {
			isAutoCheckout = prefs.get("auto_checkout_enabled");
		} else {
			prefs.set("auto_checkout_enabled", false);
		}
		if (isAutoCheckout) {
			DocumentManager
			.on("dirtyFlagChange", function (e, doc) {
				checkoutFile();
			})
			.on("pathDeleted", function (e, path) {
				p4.delete(path).fail(p4.revert(path));
			});
		}
    });

    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "perforce.checkout";   // package-style naming to avoid collisions
    CommandManager.register("Checkout", MY_COMMAND_ID, checkoutFile);
    contextMenu.addMenuItem(MY_COMMAND_ID, "", Menus.LAST);
});