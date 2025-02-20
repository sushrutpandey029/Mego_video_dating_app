import express from "express";
import { createServer } from "http";
import sequelize from "./Database/MySql.js";
import routernew from "./Routes/apiroute.js";
import dotenv from "dotenv";
import { initSocket } from "./socket.js"; // Import your socket initialization function
import adminRouter from "./Routes/adminroute.js";
import session from "express-session";
import hbs from "hbs";
import { fileURLToPath } from "url";
import path from "path";
import connectSessionSequelize from "connect-session-sequelize";
import flash from "connect-flash";

const SequelizeStore = connectSessionSequelize(session.Store);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const port = process.env.Port || 3000;

const sessionStore = new SequelizeStore({
  db: sequelize,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set view engine to handlebars
app.engine("html", hbs.__express);
app.set("view engine", "html");

app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "Partial"));
app.use(express.static(path.join(__dirname, "public", "assets")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);

sessionStore.sync();

//initialize flash message
app.use(flash());

//middleware to pass flash message to views director
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success");
  res.locals.error_msg = req.flash("error");
  res.locals.admin = req.session.admin || null;
  next();
});

//using admin router
app.use("/", adminRouter);

app.use("/api", routernew);

// Create HTTP server for socket and express 
const server = createServer(app);

// console.log(server);

// Initialize Socket.IO with the server
initSocket(server);

const startServer = () => {
  sequelize
    .sync()
    .then(() => {
      server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error("MySQL connection failed:", err);
    });
};

startServer();
