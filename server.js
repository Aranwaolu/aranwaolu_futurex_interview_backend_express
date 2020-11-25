// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

const express = require('express')
const app = express()
const cors = require('cors')

const dotenv = require('dotenv')
dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY

// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require('stripe')(SECRET_KEY)

app.use(cors())

// middleware
app.use(express.json())
app.use(express.urlencoded())

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

app.post('/create-checkout-session', async (req, res) => {
	// In creating the line items array below, one might want to check with the database or api endpoint
	// where the products and their prices are, to validate the price coming from the frontend
	// this is just a security technique
	// but it is not used here because this is just a test case and it's really for a frontend dev role

	const cart = req.body.cartItems
	const lineItemsList = []

	cart.map((cartItem) => {
		const lineItem = {
			price_data: {
				currency: 'usd',
				product_data: {
					name: cartItem.title,
					images: [cartItem.image],
				},
				unit_amount: cartItem.price * 100,
			},
			quantity: cartItem.quantity,
		}

		lineItemsList.push(lineItem)
	})

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: lineItemsList,
		mode: 'payment',
		success_url: 'https://example.com/success',
		cancel_url: 'https://example.com/cancel',
	})

	res.json({ id: session.id })
})

const port = process.env.PORT || 4242
app.listen(port, () => console.log(`Listening on port ${port}!`))
