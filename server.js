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
	if (req.body.restType === "POST") {
		try {
			const response = await axios.post(req.body.url, req.body.data);
			if (response.status === 200) {
				let responseData = response.data.accesstoken;
				res.status(200).send(responseData);
			} else {
				res.status(400).send("Failed to post!");
			}
		} catch (err) {
			console.log(err);
			res.status(404).send(err);
		}

		if (req.body.restType === "GET") {
			try {
				const res = await axios.get(req.body.url);
				if (res.status === 200) {
					res.status(200).send();
					console.log(res);
				}
			} catch (err) {
				res.status(500).send(err);
			}
		}
	}
};

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
