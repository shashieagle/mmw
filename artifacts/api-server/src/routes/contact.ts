import { Router, type IRouter } from "express";

const router: IRouter = Router();

const INQUIRY_OPTIONS = ["Creative Studio", "Business Architects", "General"] as const;

router.post("/contact", (req, res) => {
  const { name, email, inquiry, message } = req.body as {
    name?: string;
    email?: string;
    inquiry?: string;
    message?: string;
  };

  if (!name || !email || !message || !INQUIRY_OPTIONS.includes(inquiry as typeof INQUIRY_OPTIONS[number])) {
    res.status(400).json({ error: "Invalid submission" });
    return;
  }

  req.log.info({ name, email, inquiry, message }, "Contact form submission received");
  res.json({ ok: true });
});

export default router;
