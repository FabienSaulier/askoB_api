import dotenv from 'dotenv'

dotenv.config()

module.exports = {
	name: 'API',
	env: process.env.NODE_ENV || 'development',
	port: process.env.PORT || 3000,
	LOG_LEVEL : 'debug',
	ACCESS_TOKEN : process.env.ACCESS_TOKEN,
	FB_VERIFY_TOKEN : process.env.facebook_verify_token,
	FB_MESSAGE_URL : 'https://graph.facebook.com/v2.6/me/messages?access_token=',
	RECAST_DEV_ACCESS_TOKEN : process.env.RECAST_DEV_ACCESS_TOKEN,
	RECAST_USER_SLUG : process.env.RECAST_USER_SLUG,
	RECAST_BOT_SLUG : process.env.RECAST_BOT_SLUG,
}
