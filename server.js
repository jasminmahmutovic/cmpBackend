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

const PostDataToHydroCloud = async (req, res) => {
	let url = "";

	if (req.body.requestParameter) {
		url = req.body.url + "/" + req.body.requestParameterValue;
	} else {
		url = req.body.url;
	}

	axios.defaults.headers["X-Id-Token"] = req.body.token;

	if (req.body.restType === "POST") {
		try {
			const response = await axios.post(url, req.body.data);
			if (req.body.url.includes("/user/login")) {
				let responseData = response.data.id_token;
				let responseRole = response.data.hmi_privileges.role;
				res.status(200).send({ responseData, responseRole });
			} else {
				res.status(200).send(response.data);
			}
		} catch (err) {
			console.log("----------------------------------------");
			console.log(err.response.data);
			res.status(404).send(err);
		}
	} else if (req.body.restType === "GET") {
		// axios.defaults.headers["X-Id-Token"] = req.body.token;
		// console.log(axios.defaults);
		try {
			const response = await axios.get(req.body.url);
			res.status(200).send(response.data);
		} catch (err) {
			console.log("-----------------------------------------");
			console.log(err);
			res.status(500).send(err);
		}
	} else if (req.body.restType === "DELETE") {
		try {
			const response = await axios.delete(url);
			res.status(200).send();
		} catch (err) {
			console.log("-------------");
			console.log(err);
		}
	}
};

//Admin - Organisations
app.get("/v1/organisation");

app.post("/v1/organisation/link");

app.delete("/v1/organisation/link");

//Admin - Users
app.post("/v1/user/");

app.patch("/v1/user/modify");

app.get("/v1/user/:userId");

app.delete("/v1/user/:userId");

app.get("/v1/users/");

//SuperUser - Organisations
app.post("/v1/admin/organisation");

app.delete("/v1/admin/organisation/delete/:organisationId");

app.post("/api", PostDataToHydroCloud);

app.get("/", (req, res) => {
	res.send("Hello World!");
});

/*------------------------------------------------------------ */
http.listen(port, () => console.log(`Server listening on port ${port}!`));

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
