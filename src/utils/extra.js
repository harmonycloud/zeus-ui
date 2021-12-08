$(document).ready(function () {
	/**
	 * Cookies management library
	 *
	 * @type type
	 */
	var helperCookie = {
		findAll: function () {
			var cookies = {};
			_(document.cookie.split(';'))
				.chain()
				.map(function (m) {
					return m.replace(/^\s+/, '').replace(/\s+$/, '');
				})
				.each(function (c) {
					var arr = c.split('='),
						key = arr[0],
						value = null;
					var size = _.size(arr);
					if (size > 1) {
						value = arr.slice(1).join('');
					}
					cookies[key] = value;
				});
			return cookies;
		},
		find: function (name) {
			var cookie = null,
				list = this.findAll();

			_.each(list, function (value, key) {
				if (key === name) cookie = value;
			});
			return cookie;
		},
		create: function (name, value, time) {
			var today = new Date(),
				offset =
					typeof time == 'undefined'
						? 1000 * 60 * 60 * 24
						: time * 1000,
				expires_at = new Date(today.getTime() + offset);

			var cookie = _.map(
				{
					name: escape(value),
					expires: expires_at.toGMTString(),
					path: '/'
				},
				function (value, key) {
					return [key == 'name' ? name : key, value].join('=');
				}
			).join(';');

			document.cookie = cookie;
			return this;
		},
		destroy: function (name, cookie) {
			if ((cookie = this.find(name))) {
				this.create(name, null, -1000000);
			}
			return this;
		}
	};

	/**
	 * Helper functions
	 */
	var helper = function () {
		/**
		 * Get a parameter from query string URL
		 *
		 * @param {type} sParam
		 * @returns {grafana_script_L1.helper.getUrlParameter.sParameterName|Boolean}
		 */
		this.getUrlParameter = function (sParam) {
			var sPageURL = decodeURIComponent(
					window.location.search.substring(1)
				),
				sURLVariables = sPageURL.split('&'),
				sParameterName,
				i;

			for (i = 0; i < sURLVariables.length; i++) {
				sParameterName = sURLVariables[i].split('=');

				if (sParameterName[0] === sParam) {
					return sParameterName[1] === undefined
						? true
						: sParameterName[1];
				}
			}
		};

		/**
		 * From PHP JS
		 *
		 * @param {type} str
		 * @returns {unresolved}
		 */
		this.url_decode = function (str) {
			return decodeURIComponent(
				(str + '')
					.replace(/%(?![\da-f]{2})/gi, function () {
						// PHP tolerates poorly formed escape sequences
						return '%25';
					})
					.replace(/\+/g, '%20')
			);
		};

		/**
		 * From PHPJS
		 *
		 * @param {type} data
		 * @returns {String}
		 */
		this.base64_decode = function (data) {
			var b64 =
				'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
			var o1,
				o2,
				o3,
				h1,
				h2,
				h3,
				h4,
				bits,
				i = 0,
				ac = 0,
				dec = '',
				tmp_arr = [];

			if (!data) {
				return data;
			}

			data += '';
			do {
				h1 = b64.indexOf(data.charAt(i++));
				h2 = b64.indexOf(data.charAt(i++));
				h3 = b64.indexOf(data.charAt(i++));
				h4 = b64.indexOf(data.charAt(i++));

				bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;

				o1 = (bits >> 16) & 0xff;
				o2 = (bits >> 8) & 0xff;
				o3 = bits & 0xff;

				if (h3 == 64) {
					tmp_arr[ac++] = String.fromCharCode(o1);
				} else if (h4 == 64) {
					tmp_arr[ac++] = String.fromCharCode(o1, o2);
				} else {
					tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
				}
			} while (i < data.length);

			dec = tmp_arr.join('');

			return dec.replace(/\0+$/, '');
		};
	};

	var oHelper = new helper(),
		t = oHelper.getUrlParameter('t');

	if (typeof t == 'undefined') {
		return false;
	}

	if (t.length == 0) {
		return false;
	}

	try {
		var t_decoded = oHelper.base64_decode(oHelper.url_decode(t)),
			ojson = $.parseJSON(t_decoded);

		if (
			typeof ojson.user == 'undefined' ||
			typeof ojson.pass == 'undefined'
		) {
			throw 'Undefined type';
		}

		if (ojson.user.lenght == 0 || ojson.pass.lenght == 0) {
			throw 'User or password empty';
		}
	} catch (e) {
		return false;
	}

	if (typeof ojson.redirect_to != 'undefined') {
		helperCookie.create('redirect_to', ojson.redirect_to);
	}

	$('body').css('backgroundColor', '#FFF').hide();

	setTimeout(function () {
		var $form = $('form.login-form');
		if ($form.length > 0) {
			$form.find('input[name=username]').val(ojson.user).trigger('input');
			$form.find('input[name=password]').val(ojson.pass).trigger('input');
			$form.find('button[type=submit]').trigger('click');
		}
	}, 500);
});
