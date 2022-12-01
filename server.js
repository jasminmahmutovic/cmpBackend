require("dotenv").config();

const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const app = express();

const CronJobs = require("./CronJobs/CronJobs");

const PostLoginUser = require("./routes/User/functions/PostLoginUser");
const PostRefreshToken = require("./routes/User/functions/PostRefreshToken");

const UserRouter = require("./routes/User/UserRouter");
const testenRouter = require("./routes/Testen/TestenRouter");
const TemplateRouter = require("./routes/Template_/TemplateRouter");
const SearchRouter = require("./routes/Search/SearchRouter");
const orderMonitorRouter = require("./routes/OrderMonitor/orderMonitorRouter");

const GetUsersOnOrders = require("./routes/Testen/functions/GetUsersOnOrders");

// ------------------------------------------------------------------------------------------------------------------

const http = require("http").createServer(app);
const socketio = require("socket.io");
const { authenticateToken } = require("./authentication");
const io = socketio(http);

let usersInBackend = [];
let usersStayLoggedIn = [];

io.on("connection", (socket) => {
	socket.on("userLoggedIn", (userId) => {
		usersStayLoggedIn.push(userId);
	});
});

module.exports = io;

async function CRONLogoutInactiveUsers() {
	usersInBackend = await GetUsersOnOrders();

	// asking frontEnd for response to see who should be logged out
	io.emit("L_LogoutUsers");

	setTimeout(() => {
		compareBackendToClientResponse();
	}, 2000);
}

async function compareBackendToClientResponse() {
	for (let userId of usersInBackend) {
		if (!usersStayLoggedIn.includes(userId)) {
			// Person has a workerId on one order but is not pinging back, which means that they disconnected suddenly
			logout(userId);
		}
	}
}

// ------------------------------------------------------------------------------------------------------------------

// define exit
process.on("exit", function (code) {
	if (code === 99) {
		return console.log(
			`cmd argv[2] must be given values can be => prod || dev => app exit with code: ${code}`
		);
	} else {
		return console.log(`Server exit with code: ${code}`);
	}
});

// if no cmd argc call exit
if (process.argv[2] === undefined) {
	process.exit(99);
}

/*---------------DB-CONNECTION-------------------------*/
let moongooseConnectString = null;
if (process.argv[2] === "dev") {
	console.log("trying to connect to dev db");
	console.log(process.env.DATABASE_URL_DEV);
	moongooseConnectString = process.env.DATABASE_URL_DEV;

	// Setting all paths if development mode
	process.env.PATH_IMAGES = process.env.PATH_IMAGES_LOCAL;
	process.env.PATH_DEVIATION_REPORT = process.env.PATH_DEVIATION_REPORT_LOCAL;
	process.env.SLASH = process.env.PATH_SLASH_LOCAL;
	process.env.PATH_SLIDER_IMAGES = process.env.PATH_SLIDER_IMAGES_LOCAL;
}

if (process.argv[2] === "prod") {
	console.log("trying to connect to prod db");
	moongooseConnectString = process.env.DATABASE_URL_PRODUCTION;

	// Setting all paths if on docker
	process.env.PATH_IMAGES = process.env.PATH_IMAGES_DOCKER;
	process.env.PATH_DEVIATION_REPORT = process.env.PATH_DEVIATION_REPORT_DOCKER;
	process.env.SLASH = process.env.PATH_SLASH_DOCKER;
}

mongoose.connect(moongooseConnectString, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
	autoIndex: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("connected to database"));

const getActualRequestDurationInMilliseconds = (start) => {
	const NS_PER_SEC = 1e9; // convert to nanoseconds
	const NS_TO_MS = 1e6; // convert to milliseconds
	const diff = process.hrtime(start);
	return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

// let Logger = (req, res, next) => {
//   let current_datetime = new Date();
//   let formatted_date =
//     current_datetime.getFullYear() +
//     "-" +
//     (current_datetime.getMonth() + 1) +
//     "-" +
//     current_datetime.getDate() +
//     " " +
//     current_datetime.getHours() +
//     ":" +
//     current_datetime.getMinutes() +
//     ":" +
//     current_datetime.getSeconds();

//   const start = process.hrtime();
//   const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);

//   let log = `[${formatted_date}] ${req.method}:${req.url} Status:${res.statusCode} Duration:${durationInMilliseconds.toLocaleString()} ms`;

//   fs.appendFile("request_logs.txt", log + "\n", (err) => {
//     if (err) {
//       console.log(err);
//     }
//   });
//   next();
// };

/*--------------------MIDDELWARE-----------------------*/

// use Logger
// app.use(Logger);

app.use(cors());

app.use(express.json({ limit: "100mb" }));

// Login
app.post("/login", PostLoginUser);

// Refresh token
app.post("/refreshToken", PostRefreshToken);

// User
app.use("/user", authenticateToken, UserRouter);

// All routes with provning
app.use("/provning", authenticateToken, testenRouter(io));

// For templates with provning
app.use("/provning/template", authenticateToken, TemplateRouter);

// For searchQueries with provning
app.use("/provning/search/", authenticateToken, SearchRouter);

// For handling the email monitor service
app.use("/monitor", authenticateToken, orderMonitorRouter);

/*--------------------ACTIVATE CRON JOBS ----------------------*/
CronJobs();

/*------------------------------------------------------------ */
http.listen(process.env.PORT, () =>
	console.log(`Server listening on port ${process.env.PORT}!`)
);

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
