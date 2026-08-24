import { Router } from "express";
import { serializeTeam } from "../lib/serialize";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { listTeams } from "../services/order.service";

export const teamsRouter = Router();

teamsRouter.get(
  "/",
  requireAuth,
  requireRole("operator"),
  asyncHandler(async (_req, res) => {
    const teams = await listTeams();
    res.json({ items: teams.map(serializeTeam) });
  })
);
