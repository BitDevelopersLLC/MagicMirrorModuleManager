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
			"position": "top_left"
		},
		{
			"module": "clock",
			"position": "top_left"
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
				"location": "Ladera Ranch",
				"locationID": "5364199",
				"appid": "0d8cbd2c42f528549ddb896767e82809"
			}
		},
		{
			"module": "weatherforecast",
			"position": "top_center",
			"header": "Weather Forecast",
			"config": {
				"units": "imperial",
				"location": "Ladera Ranch",
				"locationID": "5364199",
				"appid": "0d8cbd2c42f528549ddb896767e82809"
			}
		},
		{
			"module": "newsfeed",
			"position": "bottom_right",
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
		}
	]
};
 if (typeof module !== 'undefined') {module.exports = config;}