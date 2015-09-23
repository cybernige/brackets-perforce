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
		contextMenu		= Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);

    // Function to run when the menu item is clicked


	function doCheckout(xml, document) {
		var p4 = require("p4"),
			filePath = document.file.fullPath,
			parser = new DOMParser(),
			p4Workspace,
			xmlDoc;

		xmlDoc = parser.parseFromString(xml, "text/xml");
		p4Workspace = xmlDoc.firstElementChild.firstElementChild.textContent;
		p4.checkout(filePath, p4Workspace).fail(p4.add(filePath, p4Workspace));
		console.log("Checked out " + filePath);
	}

	function getPerforceProject(document) {
		var root,
			file,
			promise;

		root = ProjectManager.getProjectRoot().fullPath;
		file = FileSystem.getFileForPath(root + ".project");

		promise = FileUtils.readAsText(file).done(function (text) {
			doCheckout(text, document);
		}).fail(function (errorCode) {
			//console.log("ERROR File " + errorCode);
		});
	}

    function checkoutFile() {
		var activeEditor = EditorManager.getActiveEditor(),
			document = DocumentManager.getCurrentDocument();

		if (activeEditor && document === activeEditor.document) {
			getPerforceProject(document);
		}
	}

	brackets.getModule("utils/AppInit").appReady(function () {
        var isAutoCheckout = false,
			p4 = require("p4"),
			prefs = PreferencesManager.getExtensionPrefs("brackets-perforce");

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