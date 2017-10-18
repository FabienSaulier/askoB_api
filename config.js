module.exports = {
	name: 'API',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,

	db: {
		uri: 'mongodb://admin:admin@ds113435.mlab.com:13435/heroku_wtzqjsm9'
	},

	ACCESS_TOKEN : process.env.ACCESS_TOKEN
};
