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
				"location": "Ladera Ranch",
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
			"module": "MMM-awesome-alexa",
			"position": "bottom_bar",
			"config": {
				"wakeWord": "Alexa",
				"clientId": "YOUR_CLIENT_ID",
				"clientSecret": "YOUR_CLIENT_SECRET",
				"deviceId": "YOUR_DEVICE_ID",
				"refreshToken": "YOUR_REFRESH_TOKEN",
				"lite": false
			}
		},
		{
			"module": "MMM-bergfex",
			"position": "top_center",
			"classes": "small dimmed",
			"config": {
				"updateInterval": 1800000,
				"animationSpeed": 0,
				"header": "bergfex.at Snow Report",
				"skiareas": [
					"Gerlos - Zillertal Arena",
					"Hauser Kaibling / Schladming - Ski amade",
					"Hochkar",
					"Hochkönig / Maria Alm - Dienten - Mühlbach - Ski amade",
					"Klippitztörl",
					"Koralpe"
				],
				"shortenArea": 20,
				"cssclassrow": "normal",
				"cssclassheader": "bright"
			}
		},
		{
			"module": "MMM-bergfex",
			"position": "top_right",
			"classes": "small dimmed",
			"config": {
				"updateInterval": 1800000,
				"animationSpeed": 0,
				"header": "bergfex.at Snow Report",
				"skiareas": [
					"Gerlos - Zillertal Arena",
					"Hauser Kaibling / Schladming - Ski amade",
					"Hochkar",
					"Hochkönig / Maria Alm - Dienten - Mühlbach - Ski amade",
					"Klippitztörl",
					"Koralpe"
				],
				"shortenArea": 20,
				"cssclassrow": "normal",
				"cssclassheader": "bright"
			}
		},
		{
			"module": "MMM-bergfex",
			"position": "top_right",
			"classes": "small dimmed",
			"config": {
				"updateInterval": 1800000,
				"animationSpeed": 0,
				"header": "bergfex.at Snow Report",
				"skiareas": [
					"Gerlos - Zillertal Arena",
					"Hauser Kaibling / Schladming - Ski amade",
					"Hochkar",
					"Hochkönig / Maria Alm - Dienten - Mühlbach - Ski amade",
					"Klippitztörl",
					"Koralpe"
				],
				"shortenArea": 20,
				"cssclassrow": "normal",
				"cssclassheader": "bright"
			}
		}
	]
};
 if (typeof module !== 'undefined') {module.exports = config;}