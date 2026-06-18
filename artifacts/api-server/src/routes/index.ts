import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import videosRouter from "./videos";
import caseStudyMediaRouter from "./caseStudyMedia";
import studioImagesRouter from "./studioImages";
import caseStudiesRouter from "./caseStudies";
import settingsRouter from "./settings";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(videosRouter);
router.use(caseStudyMediaRouter);
router.use(studioImagesRouter);
router.use(caseStudiesRouter);
router.use(settingsRouter);
router.use(contactRouter);

export default router;
