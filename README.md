npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D typescript ts-node-dev @types/node @types/express @types/bcryptjs @types/jsonwebtoken
npx tsc --init





Then, use Postman or cURL to test:

GET /api/patients – should return an empty array initially.

POST /api/patients – body: