define(function (require, exports, module) {
    "use strict";
    
    var FileUtils      	= brackets.getModule("file/FileUtils"),
		FileSystem 		= brackets.getModule("filesystem/FileSystem"),
		CommandManager 	= brackets.getModule("command/CommandManager"),
		EditorManager   = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
		ProjectManager 	= brackets.getModule("project/ProjectManager"),	
        Menus          	= brackets.getModule("command/Menus"),
		contextMenu		= Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
	
    // Function to run when the menu item is clicked

    function checkoutFile() {
		var p4 = require("p4"),
			document 		= DocumentManager.getCurrentDocument(), 
			filePath		= document.file.fullPath,				
			activeEditor 	= EditorManager.getActiveEditor(),
			root,
			file,
			p4Workspace,
			parser,
			xmlDoc,
			promise; 
			
		if(activeEditor && document === activeEditor.document) {
			root = ProjectManager.getProjectRoot().fullPath,
			file = FileSystem.getFileForPath(root + ".project"),
			promise = FileUtils.readAsText(file);  // completes asynchronously
			promise.done(function (text) {							
				parser = new DOMParser();
				xmlDoc = parser.parseFromString(text, "text/xml");	
				p4Workspace = xmlDoc.firstElementChild.firstElementChild.textContent;
				p4.checkout(filePath, p4Workspace).fail(p4.add(filePath, p4Workspace));		
				console.log("Checked out " + filePath); 	
			})
			.fail(function (errorCode) {
				console.log("Error: " + errorCode); 
			});				
		}				
	}	

    // First, register a command - a UI-less object associating an id to a handler
    var MY_COMMAND_ID = "perforce.checkout";   // package-style naming to avoid collisions
    CommandManager.register("Checkout", MY_COMMAND_ID, checkoutFile);
    contextMenu.addMenuItem(MY_COMMAND_ID, "", Menus.LAST);
});