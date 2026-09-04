import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MQİCMA API",
      version: "1.0.0",
      description:
        "Mingəçevir Qadın İcması saytının backend API sənədləşməsi. Bütün endpoint-ləri buradan test edə bilərsiniz.",
    },
    servers: [{ url: "/api", description: "API base path" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Xəta mesajı." },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            price: { type: "number" },
            category: { type: "string" },
            shortDesc: { type: "string" },
            fullDesc: { type: "string" },
            image: { type: "string" },
            status: { type: "string", enum: ["active", "inactive"] },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },
        ProductInput: {
          type: "object",
          required: ["name", "price", "category", "shortDesc"],
          properties: {
            name: { type: "string" },
            price: { type: "number" },
            category: { type: "string" },
            shortDesc: { type: "string" },
            fullDesc: { type: "string" },
            image: { type: "string", description: "Boş string və ya keçərli URL" },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        Service: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            fullDesc: { type: "string" },
            image: { type: "string" },
            forWhom: { type: "string" },
            benefits: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        ServiceInput: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            fullDesc: { type: "string" },
            image: { type: "string" },
            forWhom: { type: "string" },
            benefits: { type: "array", items: { type: "string" } },
            status: { type: "string", enum: ["active", "inactive"] },
          },
        },
        Event: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            date: { type: "string" },
            location: { type: "string" },
            shortDesc: { type: "string" },
            fullDesc: { type: "string" },
            image: { type: "string" },
            status: { type: "string", enum: ["upcoming", "past"] },
          },
        },
        EventInput: {
          type: "object",
          required: ["title", "date", "location", "shortDesc"],
          properties: {
            title: { type: "string" },
            date: { type: "string" },
            location: { type: "string" },
            shortDesc: { type: "string" },
            fullDesc: { type: "string" },
            image: { type: "string" },
            status: { type: "string", enum: ["upcoming", "past"] },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string", enum: ["product", "service"] },
          },
        },
        CategoryInput: {
          type: "object",
          required: ["name", "type"],
          properties: {
            name: { type: "string" },
            type: { type: "string", enum: ["product", "service"] },
          },
        },
        SiteContent: {
          type: "object",
          properties: {
            heroHeadline: { type: "string" },
            heroSubtext: { type: "string" },
            aboutIntro: { type: "string" },
            mission: { type: "string" },
            phone: { type: "string" },
            email: { type: "string" },
            instagram: { type: "string" },
            address: { type: "string" },
          },
        },
        ContactMessageInput: {
          type: "object",
          required: ["name", "phone", "message"],
          properties: {
            name: { type: "string" },
            phone: { type: "string" },
            message: { type: "string" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            admin: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                email: { type: "string" },
                role: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  // Resolved from this file rather than process.cwd(), and covering both the
  // TypeScript sources (dev, via tsx) and the compiled output (production,
  // where only dist/ is deployed). tsc preserves the JSDoc blocks.
  apis: [
    path.join(__dirname, "../routes/*.ts"),
    path.join(__dirname, "../routes/*.js"),
  ],
});
