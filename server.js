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
		console.log(url);
		try {
			const response = await axios.post(url, req.body.data);
			if (req.body.url.includes("/user/login")) {
				let responseData = response.data.id_token;
				res.status(200).send({ responseData });
			} else {
				res.status(200).send(response.data);
			}
		} catch (err) {
			console.log("----------------------------------------");
			console.log(err.response.data);
			res.status(404).send(err);
		}
	} else if (req.body.restType === "GET") {
		console.log(url);
		try {
			const response = await axios.get(url);
			res.status(200).send(response.data);
		} catch (err) {
			console.log("-----------------------------------------");
			console.log(err);
			res.status(500).send(err);
		}
	} else if (req.body.restType === "DELETE") {
		try {
			console.log(url);
			const response = await axios.delete(url);
			res.status(200).send();
		} catch (err) {
			console.log("-------------");
			console.log(err);
		}
	} else if (req.body.restType === "PATCH") {
		console.log("..........");
		console.log(req.headers["x-id-token"]);

		console.log("..........");
		try {
			console.log(url);
			const response = await axios.patch(url, req.body.data);
			console.log(response);
			res.status(200).send();
		} catch (err) {
			console.log("---------");
			console.log(err);
		}
	} else if (req.body.restType === "PUT") {
		try {
			console.log(url);
			const response = await axios.put(url);
			res.status(200).send(response);
		} catch (err) {
			console.log("-----------");
			console.log(err);
		}
	}
};

app.post("/api", PostDataToHydroCloud);

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
