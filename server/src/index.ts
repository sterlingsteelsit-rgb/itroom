import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { seedAdmin } from "./utils/seedAdmin";
import { auditContext } from "./middleware/auditContext";

// Routes
import { authRoutes } from "./routes/auth.routes";
import { usersRoutes } from "./routes/users.routes";
import { auditRoutes } from "./routes/audit.routes";
import { assetsRoutes } from "./routes/assets.routes";
import { employeesRoutes } from "./routes/employees.routes";
import { modulesRoutes } from "./routes/modules.routes";
import { permissionsRoutes } from "./routes/permissions.routes";
import { licensesRoutes } from "./routes/licenses.routes";
import { repairsRoutes } from "./routes/repairs.routes";
import { fingerprintsRoutes } from "./routes/fingerprints.routes";
import emailRoutes from "./routes/email.routes";
import { emailLogRoutes } from "./routes/emailLogs.routes";

async function main() {
  await connectDB();
  await seedAdmin();

  const app = express();

  const allowedOrigins = [
    "https://itroom.vercel.app",
    "https://itroom.vercel.app/",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow server-to-server / Postman (no origin)
        if (!origin) return callback(null, true);

        // allow your production domain
        if (origin === "https://itroom.vercel.app") return callback(null, true);

        // allow vercel preview URLs: https://itroom-xxxxx-sterlings-projects-xxxx.vercel.app
        if (/^https:\/\/itroom-[a-z0-9-]+\.vercel\.app$/.test(origin))
          return callback(null, true);

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-API-KEY"],
    }),
  );
  app.options("*", cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(auditContext);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/assets", assetsRoutes);
  app.use("/api/employees", employeesRoutes);
  app.use("/api/modules", modulesRoutes);
  app.use("/api/permissions", permissionsRoutes);
  app.use("/api/licenses", licensesRoutes);
  app.use("/api/repairs", repairsRoutes);
  app.use("/api/fingerprints", fingerprintsRoutes);
  app.use("/api/email", emailRoutes);
  app.use("/api/email-logs", emailLogRoutes);

  app.listen(ENV.PORT, () =>
    console.log(`API running on http://localhost:${ENV.PORT}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
