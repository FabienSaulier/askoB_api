import corsMiddleware from 'restify-cors-middleware'

module.exports = corsMiddleware({
  preflightMaxAge: 5, // Optional
  origins: ['*'], //https://www.messenger.com/ , https://www.facebook.com/
  allowHeaders: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'X-Frame-Options'],
  exposeHeaders: ['Content-Type'],
})
