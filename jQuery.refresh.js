(function( $ ) {
	var properties = {
		timeRemaining: 0
	}

	var settings = {
		time: 60,
		interval: 1,
		cookieName: 'refreshify',
		refreshLocation: '',
		textCountdown: 'Time till next refresh:',
		textPaused: 'Paused',
		textDisabled: 'Refresh disabled',
		linkDisable: 'Disable',
		linkEnable: 'Enable',
		linkRestart: 'Restart',
		linkPause: 'Pause',
		linkPlay: 'Continue',
		disableLength: 7 // in days
	}

	var publicMethods = {
		init: function( options ) {

			$.extend( settings, options );
			properties.timeRemaining = settings.time;

			properties.$timer = $( '<div/>' )
						.appendTo( $( 'body' ) )
						.addClass( 'refresh-timer' )
						.bind( 'dblclick.refresh', function() {
							$(this).toggleClass( 'flip' );
						} );

			properties.$timerText = $( '<span/>' )
							.addClass( 'refresh-timer-text' )
							.appendTo( properties.$timer )
							.html( settings.textCountdown );

			properties.$timerCount = $( '<span/>' )
							.appendTo( properties.$timer )
							.addClass( 'refresh-timer-count' );
							
			properties.$timerActions = $( '<span/>' )
							.appendTo( properties.$timer )
							.addClass( 'refresh-timer-actions' );

			properties.$linkRestart = $( '<span/>' )
							.appendTo( properties.$timerActions )
							.addClass( 'refresh-timer-link refresh-timer-restart' )
							.bind( 'click.refresh', publicMethods.restart )
							.text( settings.linkRestart );

			properties.$linkDisable = $( '<span/>' )
							.appendTo( properties.$timerActions )
							.addClass( 'refresh-timer-link refresh-timer-disable' )
							.bind( 'click.refresh', publicMethods.disable )
							.text( settings.linkDisable );
			
			properties.$linkPause = $( '<span/>' )
							.appendTo( properties.$timerActions )
							.addClass( 'refresh-timer-link refresh-timer-pause' )
							.bind( 'click.refresh', publicMethods.pause )
							.text( settings.linkPause );

			if( ! publicMethods.isDisabled() ) {
				privateMethods.doTimeout();
			} else {
				properties.$timer.addClass( 'disabled' );
				properties.$timerText.text( settings.textDisabled );
				properties.$linkDisable.text( settings.linkEnable );
			}
		},
		restart: function() {
			properties.timeRemaining = settings.time;
		},
		pause: function() {
			if( properties.isPaused ) {
				privateMethods.doTimeout();
				properties.$linkPause.text( settings.linkPause );
				properties.$timer.removeClass( 'paused' );
				properties.$timerText.text( settings.textCountdown );
			} else {
				privateMethods.stopTimeout();
				properties.$linkPause.text( settings.linkPlay );
				properties.$timer.addClass( 'paused' );
				properties.$timerText.text( settings.textPaused );
			}
			properties.isPaused = ! properties.isPaused;
		},
		play: function() {
			publicMethods.pause();
		},
		disable: function() {
			if( ! publicMethods.isDisabled() ) {
				// set cookie
				privateMethods.setCookie( settings.cookieName, '1', settings.disableLength );
				// change text
				properties.$linkDisable.text( settings.linkEnable );
				properties.$timerText.text( settings.textDisabled );
				// change class
				properties.$timer.addClass( 'disabled' );

				// and cancel countdown
				privateMethods.stopTimeout();
			} else {
				// delete cookie
				privateMethods.setCookie( settings.cookieName, '', -1 );
				// change text
				properties.$linkDisable.text( settings.linkDisable );
				properties.$timerText.text( settings.textCountdown );
				// change class
				properties.$timer.removeClass( 'disabled' );

				// and start countdown
				privateMethods.doTimeout();
			}
		},
		doRefresh: function() {
			properties.$timer.addClass( 'reload' );
			if( properties.refreshLocation )
				window.location = refreshLocation;
			else
				location.reload();
		},
		isDisabled: function() {
			return privateMethods.getCookie( settings.cookieName );
		}
	}

	var privateMethods = {
		doTimeout: function() {
			if( properties.timeRemaining <= 0 ) {
				publicMethods.doRefresh();
				return;
			}
			
			properties.timeout = setTimeout( privateMethods.doTimeout, ( settings.interval * 1000 ) ); // interval is in seconds
			properties.$timerCount.text( privateMethods.getMinuteStamp( properties.timeRemaining ) );
			properties.timeRemaining -= settings.interval;
		},
		stopTimeout: function() {
			clearTimeout( properties.timeout );
			properties.timeRemaining = settings.time;
		},
		// http://stackoverflow.com/questions/3733227/javascript-seconds-to-minutes-and-seconds/3733257#3733257
		getMinuteStamp: function( time ) {
			var minutes = Math.floor( time / 60 ),
				seconds = time - minutes * 60;
			return '' + privateMethods.pad( minutes, 2 ) + ':' + privateMethods.pad( seconds, 2 );
		},
		// http://www.electrictoolbox.com/pad-number-zeroes-javascript/
		pad: function( str, length, padStr ) {
			padStr = padStr || '0';
			str = '' + str;
			while( str.length < length ) {
				str = padStr + str;
			}
			return str;
		},
		// http://www.quirksmode.org/js/cookies.html
		getCookie: function( name ) {
			name = name + "=";
			var ca = document.cookie.split( ';' );
			for( var i=0;i < ca.length;i++ ) {
				var c = ca[i];
				while( c.charAt(0)==' ' )
					c = c.substring( 1, c.length );
				if( c.indexOf( name ) == 0)
					return c.substring( name.length, c.length );
			}
			return null;
		},
		setCookie: function( name, value, days ) {
			var expires = '';
			if ( days ) {
				var date = new Date();
				date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
				expires = '; expires=' + date.toGMTString();
			}
			document.cookie = '' + name + '=' + value + expires + '; path=/';
		}

	}

	$.refresh = function( method ) {
		if ( publicMethods[method] ) {
			return publicMethods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return publicMethods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.refresh' );
		}
	}
})( jQuery );