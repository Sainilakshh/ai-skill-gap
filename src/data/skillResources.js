// One concrete free resource + one resume-worthy project + rough hours per skill.
// Hours are for a full gap (None -> required level); buildRoadmap scales them down for partial gaps.
export const SKILL_RESOURCES = {
  Python: { label: 'Official Python tutorial', url: 'https://docs.python.org/3/tutorial/', project: 'Automate a boring task (file organizer / scraper) with OOP + tests', hours: 20 },
  'Machine Learning': { label: 'scikit-learn tutorials', url: 'https://scikit-learn.org/stable/tutorial/index.html', project: 'End-to-end model on a Kaggle dataset: clean → train → evaluate → README with metrics', hours: 25 },
  'Deep Learning': { label: 'PyTorch Learn the Basics', url: 'https://pytorch.org/tutorials/beginner/basics/intro.html', project: 'Train an image classifier from scratch and log accuracy curves', hours: 25 },
  'LLM Integration': { label: 'DeepLearning.AI short courses', url: 'https://www.deeplearning.ai/short-courses/', project: 'RAG chatbot over your own notes, deployed with a public demo link', hours: 12 },
  Databases: { label: 'SQLite quickstart', url: 'https://www.sqlite.org/quickstart.html', project: 'Add a real DB (schema + migrations) to one of your existing projects', hours: 8 },
  'Git/GitHub': { label: 'GitHub Hello World', url: 'https://docs.github.com/en/get-started/start-your-journey/hello-world', project: 'Land one real PR on an open-source repo', hours: 6 },
  Docker: { label: 'Docker Get Started', url: 'https://docs.docker.com/get-started/', project: 'Dockerize an existing app and publish the image', hours: 5 },
  'Cloud Deployment': { label: 'Vercel docs', url: 'https://vercel.com/docs', project: 'Deploy a full-stack project with a custom domain + env vars', hours: 5 },
  'Data Analysis': { label: 'pandas getting started', url: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html', project: 'Analyse a public dataset and publish a notebook with 3 insights', hours: 15 },
  SQL: { label: 'SQLBolt interactive lessons', url: 'https://sqlbolt.com', project: 'Answer 10 business questions with joins + aggregations on a real dataset', hours: 10 },
  Communication: { label: 'Google Technical Writing', url: 'https://developers.google.com/tech-writing', project: 'Write 2 blog posts explaining projects you already built', hours: 6 },
  'Computer Vision': { label: 'OpenCV tutorials', url: 'https://docs.opencv.org/4.x/d9/df8/tutorial_root.html', project: 'Real-time detection/tracking demo from webcam', hours: 20 },
  JavaScript: { label: 'javascript.info', url: 'https://javascript.info', project: 'Vanilla-JS app with async fetch + DOM, no frameworks', hours: 25 },
  React: { label: 'react.dev Learn', url: 'https://react.dev/learn', project: 'Multi-page app with state, routing and API calls', hours: 20 },
  'Node.js': { label: 'Node.js learn', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', project: 'REST API with auth + a database', hours: 15 },
  'CI/CD': { label: 'GitHub Actions quickstart', url: 'https://docs.github.com/en/actions/quickstart', project: 'Add a test + deploy pipeline to one repo', hours: 4 },
  'Problem Solving': { label: 'NeetCode roadmap', url: 'https://neetcode.io/roadmap', project: 'Solve 50 problems, note patterns in a public repo', hours: 40 },
  'Tailwind CSS': { label: 'Tailwind installation guide', url: 'https://tailwindcss.com/docs/installation', project: 'Rebuild a landing page you like, fully responsive', hours: 6 },
}
