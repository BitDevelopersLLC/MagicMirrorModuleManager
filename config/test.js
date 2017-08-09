var config = {
	"port": 8080,
	"ipWhitelist": [
		"127.0.0.1",
		"::ffff:127.0.0.1",
		"::1"
	],
	"language": "en",
	"timeFormat": 24,
	"units": "imperial ",
	"modules": [
		{
			"module": "alert"
		},
		{
			"module": "updatenotification",
			"position": "lower_center"
		},
		{
			"module": "clock",
			"position": "middle_center"
		},
		{
			"module": "calendar",
			"header": "US Holidays",
			"position": "top_bar",
			"config": {
				"maximumNumberOfDays": 90,
				"calendars": [
					{
						"symbol": "calendar-check-o ",
						"url": "webcal://www.calendarlabs.com/templates/ical/US-Holidays.ics"
					}
				]
			}
		},
		{
			"module": "currentweather",
			"position": "top_right",
			"config": {
				"units": "imperial",
				"location": "California",
				"locationID": "5364199",
				"appid": "0d8cbd2c42f528549ddb896767e82809"
			}
		},
		{
			"module": "weatherforecast",
			"position": "bottom_right",
			"header": "Weather Forecast",
			"config": {
				"units": "Host",
				"location": "Ladera Ranch",
				"locationID": "5364199",
				"appid": "0d8cbd2c42f528549ddb896767e82809"
			}
		},
		{
			"module": "newsfeed",
			"position": "upper_third",
			"config": {
				"feeds": [
					{
						"title": "New York Times",
						"url": "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml"
					}
				],
				"showSourceTitle": true,
				"showPublishDate": true
			}
		},
		{
			"module": "MMM-bitcoin",
			"position": "top_right",
			"config": {
				"fiat": "usd",
				"showBefore": "foo",
				"updateInterval": 60000
			}
		}
	]
};
 if (typeof module !== 'undefined') {module.exports = config;}