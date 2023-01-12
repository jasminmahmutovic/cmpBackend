// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// import axios from "axios";
const axios = require("axios");
const cors = require("cors");
const express = require("express");
const app = express();
const port = 3005;

const http = require("http").createServer(app);

/*--------------------MIDDELWARE-----------------------*/

app.use(cors());

app.use(express.json({ limit: "100mb" }));

// app.post("/api", PostDataToHydroCloud);

//Routes for Organisation API's
app.get(`/organisation/v1/admin/organisation`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/organisation/v1/admin/organisation`;
		const response = await axios.get(url, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});

		res.status(response.status).send(response.data);
	} catch (err) {
		console.log(err);
	}
});

app.delete(`/organisation/v1/admin/delete/:organisation`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/organisation/v1/admin/delete/${req.params.organisation}`;
		const response = await axios.delete(url, req.body, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});

		res.status(response.status).send("Organisation has been deleted");
	} catch (err) {
		console.log(err);
	}
});

app.post(
	`/organisation/v1/admin/organisation/create/organisation`,
	async (req, res) => {
		try {
			const url = `https://dev.cloud.hydroware.com/organisation/v1/admin/organisation`;
			const response = await axios.post(url, req.body, {
				headers: {
					"X-Id-Token": req.headers["x-id-token"],
				},
			});

			res.status(response.status).send("Organisation has been created");
		} catch (err) {
			console.log(err.message);
		}
	}
);

//Routes for user API's

app.post(`/auth/v1/user/login`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/auth/v1/user/login`;
		const response = await axios.post(url, req.body);
		let responseData = response.data.id_token;

		res.status(response.status).send(responseData);
	} catch (err) {
		console.log(err);
	}
});

app.get(`/user/v1/admin/users/:organisation`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/admin/users/${req.params.organisation}`;

		const response = await axios.get(url, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});

		res.status(response.status).send(response.data);
	} catch (err) {
		console.log(err.message);
	}
});

app.get(`/user/v1/admin/user/:organisation/:email`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/admin/user/${req.params.organisation}/${req.params.email}`;

		const response = await axios.get(url, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});
		res.status(response.status).send(response.data);
	} catch (err) {
		console.log(err.message);
	}
});

app.post(`/user/v1/admin/user/:organisation`, async (req, res) => {
	console.log(req.body);
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/admin/user/${req.params.organisation}`;

		const response = await axios.post(url, req.body, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});

		res.status(response.status).send("Successfully created");
	} catch (err) {
		console.log(err);
	}
});

app.patch(`/user/v1/admin/user/modify/:organisation`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/admin/user/modify/${req.params.organisation}`;

		const response = await axios.patch(url, req.body, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});

		res.status(response.status).send("Successfull updated user");
	} catch (err) {
		console.log(err.message);
	}
});

app.put(
	`/user/v1/admin/user/resetPassword/:organisation/:email`,
	async (req, res) => {
		try {
			const url = `https://dev.cloud.hydroware.com/user/v1/admin/user/resetPassword/${req.params.organisation}/${req.params.email}`;

			const response = await axios.put(url, req.body, {
				headers: {
					"X-Id-Token": req.headers["x-id-token"],
				},
			});

			res.status(response.status).send("Password has been reset");
		} catch (err) {
			console.log(err.message);
		}
	}
);

app.delete(`/user/v1/admin/user/:organisation/:email`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/admin/user/${req.params.organisation}/${req.params.email}`;

		const response = await axios.delete(url, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});

		res.status(response.status).send("User has been deleted");
	} catch (err) {
		console.log(err.message);
	}
});

//Routes for "admin"-role users

app.get(`/user/v1/users`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/users`;
		const response = await axios.get(url, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});
		res.status(response.status).send(response.data);
	} catch (err) {
		console.log(err.message);
	}
});

app.post(`/user/v1/user/`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/user/`;
		const response = await axios.post(url, req.body, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});
		res.status(response.status).send(response.data);
	} catch (err) {
		console.log(err.message);
	}
});

app.delete(`/user/v1/user/:user`, async (req, res) => {
	try {
		const url = `https://dev.cloud.hydroware.com/user/v1/user/${req.params.user}`;
		const response = await axios.delete(url, {
			headers: {
				"X-Id-Token": req.headers["x-id-token"],
			},
		});
		res.status(response.status).send("User has been removed");
	} catch (err) {
		console.log(err.message);
	}
});

/*------------------------------------------------------------ */
http.listen(port, () => console.log(`Server listening on port ${port}!`));
console.clear();

/*----------------ERROR-HANDLING----------------------*/

process.on("SIGTERM", () => {
	console.info("SIGTERM signal received.");
	console.log("Closing http server.");
	http.close(() => {
		console.log("Http server closed.");
		//false = [force], see in mongoose doc
		db.close(false, () => {
			console.log("MongoDb connection closed.");
			process.exit(0);
		});
	});
});
