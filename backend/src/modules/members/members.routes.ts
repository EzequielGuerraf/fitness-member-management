import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import { createMember, getMemberSummary, listMembers } from "./members.controller";
import { createMemberBodySchema, listMembersQuerySchema, memberIdParamsSchema } from "./members.schemas";

const router = Router();

router.post("/", validateRequest({ body: createMemberBodySchema }), createMember);
router.get("/", validateRequest({ query: listMembersQuerySchema }), listMembers);
router.get("/:id", validateRequest({ params: memberIdParamsSchema }), getMemberSummary);

export const membersRoutes = router;
