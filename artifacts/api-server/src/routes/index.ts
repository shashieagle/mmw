import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import videosRouter from "./videos";
import caseStudyMediaRouter from "./caseStudyMedia";
import studioImagesRouter from "./studioImages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(videosRouter);
router.use(caseStudyMediaRouter);
router.use(studioImagesRouter);

export default router;
