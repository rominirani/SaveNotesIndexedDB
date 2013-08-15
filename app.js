// variable which will hold the database connection
var db;

function initializeDB() {
	if (window.indexedDB) {
	  console.log("IndexedDB support is there");
	}
	else {
	   alert("Indexed DB is not supported. Where are you trying to run this ? ");
	}
 
	// open the database
	// 1st parameter : Database name. We are using the name 'notesdb'
	// 2nd parameter is the version of the database.
	var request = indexedDB.open('notesdb', 1);
	
	request.onsuccess = function (e) {
	  // e.target.result has the connection to the database
	  db = e.target.result;
	  //Alternately, if you want - you can retrieve all the items
	}
	 
	request.onerror = function (e) {
	   console.log(e);
	};
	 
	// this will fire when the version of the database changes
	// We can only create Object stores in a versionchange transaction.
	request.onupgradeneeded = function (e) {
	   // e.target.result holds the connection to database
	   db = e.target.result;
	   
	   if (db.objectStoreNames.contains("notes")) {
	     db.deleteObjectStore("notes");
	   }
		
	   // create a store named 'notes'
	   // 1st parameter is the store name
	   // 2nd parameter is the key field that we can specify here. Here we have opted for autoIncrement but it could be your
	   // own provided value also.
	   var objectStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
	   
	   console.log("Object Store has been created");
	};
}

$(document).ready(function(){

		//Initialize the Database first
       initializeDB();

	   $("#btnAddNote").click(function(){
		  //Change to the add-notes
		  $.mobile.changePage ($("#add-notes"));
		});

		$("#btnViewNotes").click(function(){
		  //Change to the add-notes
          $.mobile.changePage ($("#view-notes"));
		  //Empty the list first
		  $("#note-list").html("");
		  //Read the notes
    	  var transaction = db.transaction([ 'notes' ]);
		  var store = transaction.objectStore('notes');
		
  		  // open a cursor to retrieve all items from the 'notes' store
		  store.openCursor().onsuccess = function (e) {
			  var cursor = e.target.result;
			  if (cursor) {
			    var value = cursor.value;
		 		var noteElement = $("<div data-role='collapsible' data-mini='true'/>");
				var h3NoteTitle = $("<h3/>").text(value.title);
				var pNoteDetails = $("<p/>").text(value.details);
				noteElement.append(h3NoteTitle);
				noteElement.append(pNoteDetails);
				$("#note-list").append(noteElement);
			 
			    // move to the next item in the cursor
				cursor.continue();
			  }
			  $('div[data-role=collapsible]').collapsible({refresh:true});
			};
	    });
		
		//Click Handlers for Add Notes page
		$("#btnSaveNote").click(function(){
		  noteTitle = $("#noteTitle").val();
		  noteDetails = $("#noteDetails").val();

		   // create the transaction with 1st parameter is the list of stores and the second specifies
		   // a flag for the readwrite option
		   var transaction = db.transaction([ 'notes' ], 'readwrite');
		   
		   //Create the Object to be saved i.e. our Note
		   var value = {};
		   value.title = noteTitle;
		   value.details = noteDetails;
		   
		   // add the note to the store
		   var store = transaction.objectStore('notes');
		   var request = store.add(value);
		   request.onsuccess = function (e) {
			  alert("Your note has been saved");
		   };
		   request.onerror = function (e) {
		     alert("Error in saving the note. Reason : " + e.value);
		   }
	    });
		
		$("#btnClearNotes").click(function(){
		  $("#noteTitle").val("");
		  $("#noteDetails").val("");
		  $("#noteTitle").focus();
	    });
		
		//Click Handlers for View Notes page
		$("#clearAllNotesBtn").click(function(){
		   
		   var transaction = db.transaction([ 'notes' ], 'readwrite');
		   var store = transaction.objectStore('notes');
		   
		   //Delete all the notes
		   //Alternately if you know the ID, you can use store.delete(ID) for individual item deletion
		   var request = store.clear();
		   request.onsuccess = function () {
			   $("#note-list").html("");
			   alert("All Notes have got cleared");
		   }
		   request.onerror = function (e) {
			   alert("Error while deleting notes : " + e.value);
			};
		});
});	