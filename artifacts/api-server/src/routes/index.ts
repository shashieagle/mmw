import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import videosRouter from "./videos";
import caseStudyMediaRouter from "./caseStudyMedia";
import studioImagesRouter from "./studioImages";
import caseStudiesRouter from "./caseStudies";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(videosRouter);
router.use(caseStudyMediaRouter);
router.use(studioImagesRouter);
router.use(caseStudiesRouter);

export default router;
