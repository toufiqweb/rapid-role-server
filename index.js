const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const port = process.env.PORT || 5000;

dotenv.config();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const db = client.db("RapidRole");
    const jobsCollection = db.collection("jobs");
    const companiesCollection = db.collection("companies");
    const usersCollection = db.collection("user");
    const applicationsCollection = db.collection("applications");

    app.get("/api/users", async (req, res) => {
      const result = await usersCollection.find().skip(1).toArray();
      res.json(result);
    });

    // jobs
    app.post("/api/jobs", async (req, res) => {
      const job = req.body;
      const newJob = {
        ...job,
        createdAt: new Date().toISOString(),
      };
      const result = await jobsCollection.insertOne(newJob);
      res.json(result);
    });

    app.get("/api/jobs", async (req, res) => {
      const query = {};

      if (req.query.companyId) {
        query.companyId = req.query.companyId;
      }

      if (req.query.status) {
        query.status = req.query.status;
      }

      if (req.query.jobType) {
        query.jobType = req.query.jobType;
      }

      if (req.query.jobCategory) {
        query.jobCategory = req.query.jobCategory;
      }

      if (req.query.location) {
        query.location = {
          $regex: req.query.location,
          $options: "i",
        };
      }

      if (req.query.search) {
        query.$or = [
          {
            jobTitle: {
              $regex: req.query.search,
              $options: "i",
            },
          },
          {
            jobDescription: {
              $regex: req.query.search,
              $options: "i",
            },
          },
        ];
      }

      if (req.query.minSalary) {
        query.salaryMax = {
          $gte: Number(req.query.minSalary),
        };
      }

      const result = await jobsCollection.find(query).toArray();

      res.json(result);
    });

    app.get("/api/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.json(result);
    });

    // applications
    app.post("/api/applications", async (req, res) => {
      const application = req.body;
      const newApplication = {
        ...application,
        createdAt: new Date().toISOString(),
      };
      const result = await applicationsCollection.insertOne(newApplication);
      res.json(result);
    });

    app.get("/api/applications", async (req, res) => {
      const query = {};

      if (req.query.applicantId) {
        query.applicantId = req.query.applicantId;
      }

      if (req.query.jobId) {
        query.jobId = req.query.jobId;
      }

      const result = await applicationsCollection.find(query).toArray();
      res.json(result);
    });

    // companies
    app.post("/api/companies", async (req, res) => {
      const company = req.body;
      const newCompany = {
        ...company,
        createdAt: new Date().toISOString(),
      };
      const result = await companiesCollection.insertOne(newCompany);
      res.json(result);
    });

    app.get("/api/companies", async (req, res) => {
      const result = await companiesCollection.find().skip(1).toArray();
      res.json(result);
    });
    app.get("/api/my/companies", async (req, res) => {
      const query = {};
      if (req.query.recruiterId) {
        query.recruiterId = req.query.recruiterId;
      }
      const result = await companiesCollection.findOne(query);
      res.json(result || {});
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
