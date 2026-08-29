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
    paths: {
      "/auth/login": { post: { tags: ["Auth"], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } } }, responses: { "200": { description: "Login successful" }, "400": { description: "Validation error" }, "401": { description: "Invalid credentials" } } } },
      "/auth/me": { get: { tags: ["Auth"], security: [{ bearerAuth: [] }], responses: { "200": { description: "Current admin" }, "401": { description: "Unauthenticated" } } } },
      "/products": { get: { tags: ["Products"], parameters: [{ in: "query", name: "all", schema: { type: "boolean" } }], responses: { "200": { description: "Products" }, "401": { description: "Unauthenticated" } } }, post: { tags: ["Products"], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "multipart/form-data": { schema: { $ref: "#/components/schemas/ProductInput" } } } }, responses: { "201": { description: "Created" }, "400": { description: "Validation or upload error" }, "401": { description: "Unauthenticated" } } } },
      "/products/{id}": { get: { tags: ["Products"], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { "200": { description: "Product" }, "404": { description: "Not found" } } }, put: { tags: ["Products"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "multipart/form-data": { schema: { $ref: "#/components/schemas/ProductInput" } } } }, responses: { "200": { description: "Updated" }, "400": { description: "Validation or upload error" }, "401": { description: "Unauthenticated" }, "404": { description: "Not found" } } }, delete: { tags: ["Products"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" }, "401": { description: "Unauthenticated" }, "404": { description: "Not found" } } } },
      "/services": { get: { tags: ["Services"], parameters: [{ in: "query", name: "all", schema: { type: "boolean" } }], responses: { "200": { description: "Services" }, "401": { description: "Unauthenticated" } } }, post: { tags: ["Services"], security: [{ bearerAuth: [] }], requestBody: { required: true, content: { "multipart/form-data": { schema: { $ref: "#/components/schemas/ServiceInput" } } } }, responses: { "201": { description: "Created" }, "400": { description: "Validation or upload error" }, "401": { description: "Unauthenticated" } } } },
      "/services/{id}": { get: { tags: ["Services"], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { "200": { description: "Service" }, "404": { description: "Not found" } } }, put: { tags: ["Services"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "multipart/form-data": { schema: { $ref: "#/components/schemas/ServiceInput" } } } }, responses: { "200": { description: "Updated" }, "400": { description: "Validation or upload error" }, "401": { description: "Unauthenticated" }, "404": { description: "Not found" } } }, delete: { tags: ["Services"], security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { "204": { description: "Deleted" }, "401": { description: "Unauthenticated" }, "404": { description: "Not found" } } } },
      "/events": { get: { tags: ["Events"], responses: { "200": { description: "Events" } } }, post: { tags: ["Events"], security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" }, "400": { description: "Validation error" }, "401": { description: "Unauthenticated" } } } },
      "/categories": { get: { tags: ["Categories"], responses: { "200": { description: "Categories" } } }, post: { tags: ["Categories"], security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" }, "400": { description: "Validation error" }, "401": { description: "Unauthenticated" }, "409": { description: "Conflict" } } } },
      "/content": { get: { tags: ["Content"], responses: { "200": { description: "Content" }, "404": { description: "Not found" } } }, put: { tags: ["Content"], security: [{ bearerAuth: [] }], responses: { "200": { description: "Updated" }, "400": { description: "Validation error" }, "401": { description: "Unauthenticated" } } } },
      "/contact": { get: { tags: ["Contact"], security: [{ bearerAuth: [] }], responses: { "200": { description: "Messages" }, "401": { description: "Unauthenticated" } } }, post: { tags: ["Contact"], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ContactMessageInput" } } } }, responses: { "201": { description: "Created" }, "400": { description: "Validation error" } } } },
    },
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
            image: { type: "string", format: "binary", description: "JPG, PNG, WEBP və ya GIF faylı" },
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
            image: { type: "string", format: "binary", description: "JPG, PNG, WEBP və ya GIF faylı" },
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
            image: { type: "string", format: "binary", description: "JPG, PNG, WEBP və ya GIF faylı" },
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
  apis: ["./src/routes/*.ts"],
});
