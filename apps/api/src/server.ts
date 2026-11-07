import "dotenv/config";
import { app } from "./app";

const port = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`);
  });
}

export default app;
