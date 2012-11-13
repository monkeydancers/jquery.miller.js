(function($) {
	$.fn.miller = function(settings) {
		var settings = $.extend(true, {
					url: function(id) { return id; },
					tabindex: 0,
					minWidth: 40,
					carroussel: false,
					toolbar: {
						options: {}
					},
					pane: {
						options: {}
					}
				},
				settings
			)
		;

		var hasFocus = false;

		if (!this.attr('tabindex')) {
			this.attr('tabindex', settings.tabindex);
		}

		this
			.addClass('miller')
			.focus(function() { hasFocus = true; })
			.blur(function() { hasFocus = false; })
		;

		var path = $('<div>', { class: 'path' })
			.appendTo(this)
		;

		var columns = $('<div>', { class: 'columns' })
			.appendTo(this)
		;

		var toolbar = null;

		if (!$.isEmptyObject(settings.toolbar.options)) {
			var toolbar = $('<div>', { class: 'toolbar' })
				.appendTo(this)
			;
		};

		var currentLine = null;

		$(document).keydown(function(event) {
				if (hasFocus && currentLine && (event.which == 37 || event.which == 38 || event.which == 39 || event.which == 40)) {
					var newCurrentLine = [];

					switch (event.which) {
						case 37:
							newCurrentLine = currentLine.parent().prev().prev().find('li.parentSelected');
							break;

						case 38:
							newCurrentLine = currentLine.prev();

							if (!newCurrentLine.length && settings.carroussel) {
								newCurrentLine = currentLine.parent().find('li:last');
							}
							break;

						case 39:
							newCurrentLine = currentLine.parent().next().next().find('li:first');
							break;

						case 40:
							newCurrentLine = currentLine.next();

							if (!newCurrentLine.length && settings.carroussel) {
								newCurrentLine = currentLine.parent().find('li:first');
							}
							break;
					}

					if (newCurrentLine.length) {
						currentLine = newCurrentLine.click();

						if (event.which == 40 && (currentLine.position().top + currentLine.height()) > currentLine.parent().height()) {
								currentLine.parent().scrollTop(currentLine.parent().scrollTop() + ((currentLine.position().top + currentLine.height()) - currentLine.parent().height()));
						} else if (event.which == 38 && currentLine.position().top < 0) {
							currentLine.parent().scrollTop(currentLine.parent().scrollTop() + currentLine.position().top);
						}
					}

					return false;
				}
			}
		);

		var removeNextColumns = function() {
				var line = $(this);

				var column = line.parent();

				column
					.nextAll()
						.slice(1)
							.remove()
				;

				column
					.find('li')
						.removeClass('selected parentSelected')
				;

				line.addClass(line.hasClass('parent') ? 'parentSelected' : 'selected');

				var node = $('<span>', { text: line.text() })
					.click(function() {
							columns
								.children()
									.slice((($(this).index() * 2) + 4))
										.remove()
							;
							columns
								.children('ul:last')
									.find('li')
										.removeClass('parentSelected')
							;
							path
								.children()
									.slice($(this).index() + 1)
										.remove()
							;
						}
					)
					.appendTo(path)
				;

				var child = column.index();

				child -= (child - (child / 2));

				path
					.scrollLeft(node.position().left)
					.children()
						.slice(child, -1)
							.remove()
				;
			}
		;

		var buildColumn = function(lines) {
				if (lines == null) {
					$('li.parentLoading').remove();
				} else {
					if (currentLine && toolbar) {
						toolbar.children().remove();

						$.each(settings.toolbar.options, function(key, callbackGenerator) {
								$('<span>', { text: key })
									.click(callbackGenerator(currentLine.data('id')))
									.appendTo(toolbar)
								;
							}
						);
					}

					var width = 0;

					var lastGrip = columns.children('div.grip:last')[0];

					if (lastGrip) {
						lastGrip = $(lastGrip);
						width = lastGrip.position().left + lastGrip.width() + columns.scrollLeft();
					}
					
					if (lines.length <= 0) {
						var line = $('li.parentLoading')
							.removeClass('parent')
							.addClass('selected')
						;

						if (!$.isEmptyObject(settings.pane.options)) {
							var pane = $('<ul>')
								.css({ top: 0, left: width })
								.addClass('pane')
							;

							var id = line.data('id');

							$.each(settings.pane.options, function(key, callbackGenerator) {
									$('<li>', { text: key })
										.click(callbackGenerator(id))
										.appendTo(pane)
									;
								}
							);

							columns
								.append(pane)
								.scrollLeft(width + pane.width())
							;
						}
					} else {
						$('li.parentLoading').addClass('parentSelected');

						var column = $('<ul>')
							.css({ top: 0, left: width })
						;

						$.each(lines, function(id, data) {
								var line = $('<li>', { text: data['name'] })
									.data('id', data['id'])
									.click(removeNextColumns)
									.click(getLines)
									.appendTo(column)
								;

								if (data['parent']) {
									line.addClass('parent');
								}
							}
						);

						columns
							.append(column)
							.scrollLeft(width += column.width())
							.append(
								$('<div>', { class: 'grip' })
									.css({ top: 0, left: width })
									.mousedown(function(event) {
											var x = event.pageX;
											var cursor = columns.css('cursor');

											columns
												.css('cursor', 'col-resize')
												.mousemove(function(event) {
														var delta = event.pageX - x;
														var newWidth = column.width() + delta;

														if (newWidth > settings.minWidth) {
															column
																.width(newWidth)
																.nextAll()
																	.each(function() {
																			$(this).css('left', $(this).position().left + delta + columns.scrollLeft());
																		}
																	)
															;
														}

														x = event.pageX;
													}
												)
												.mouseup(function() {
														columns
															.off('mousemove')
															.css('cursor', cursor)
														;
													}
												)
											;
										}
									)
							)
						;
					}
				}
			}
		;

		var getLines = function(event) {
				currentLine = $(event.currentTarget)
					.removeClass('parentSelected')
					.addClass('parentLoading')
				;

				$.getJSON(settings.url($(this).data('id')), buildColumn)
					.always(function() {
							currentLine
								.removeClass('parentLoading')
							;
						}
					)
					.fail(function() {})
				;

			}
		;

		$.getJSON(settings.url(), buildColumn);

		return this;
	};
})(jQuery);
