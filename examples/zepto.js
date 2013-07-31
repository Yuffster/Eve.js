Eve.register('rot13', function(ns) { 

	function rot13(e) {
		var el = $(e.target);
		el.text(el.text().replace(/[a-zA-Z]/g, function(c) {
			return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
		}));
	};
	
	//The event simulation code isn't happy with jQuery's mouseenter/leave.
	this.listen('ul li', 'mouseover', rot13);
	this.listen('ul li', 'mouseout', rot13);

});

Eve.register('active', function(ns) { 

	this.listen('li', 'click', function(e) {
		this.find('.active').removeClass('active');
		this.find(e.target).addClass('active');
	});

});

Eve.attach('active', '.list-module ul');
Eve.attach('rot13',	 '.list-module');

Eve.scope('.other-module', function() {
	this.listen('ul', 'click', function(e) {
		console.log("Inner module click!");
	});
	this.attach('rot13');
});

Eve.scope("#outer_scope", function() {
	
	this.scope('.inner_scope', function() {
		
		this.listen('a', 'click', function(e) {
			$(e.target).addClass('affected');
		});
		
		this.scope('#another_scope', function() {
			
			this.listen('span', 'click', function(e) {
				$(e.target).addClass('affected');
			});
			
		});
		
	});
	
});
