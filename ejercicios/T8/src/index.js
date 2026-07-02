import app from './app.js';
import dbConnect from './config/db.js';

const port = process.env.PORT || 3000;

await dbConnect();
app.listen(port, () => {
  console.log(`PodcastHub disponible en http://localhost:${port}`);
  console.log(`Swagger disponible en http://localhost:${port}/api-docs`);
});
