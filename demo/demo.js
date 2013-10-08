var tree = [
	{ "id": 1, "name": "Anakin", "children" : [  
		{ "id": 6, "name": "Luc", "children": null, "parent": false  },
		{ "id": 7, "name": "Leia", "children": [
			{ "id": 11, "name": "Leia Junior", "children": null, "parent": false  },
			{ "id": 12, "name": "Chewleia", "children": null, "parent": false  },
			{ "id": 13, "name": "Han Polo", "children": null, "parent": false  },
			], "parent": true  },
		], "parent": true 
	},
	{ "id": 2, "name": "Robots", "children" : [
		{ "id": 3, "name": "C3PO", "children": null, "parent": false   },
		{ "id": 4, "name": "R2D2", "children": null, "parent": false   },
		], "parent": true
	 },
];



$(document).ready(function() {
		$('#miller').miller({
				'useAjax' : false,
				'tree': tree,
				'toolbar': {
					'options': {
						'Select': function(id) { alert('Select node or leaf ' + id); },
						'Quickview': function(id) { alert('Quickview on node or leaf ' + id); }
					}
				},
				'pane': {
					'options': {
						'Add': function(id) { alert('Add to leaf ' + id); },
						'Update': function(id) { alert('Update leaf ' + id); },
						'Delete': function(id) { alert('Delete leaf ' + id); }
					}
				}
			}
		);
	}
);
