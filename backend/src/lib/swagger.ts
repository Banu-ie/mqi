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
      "/events": {
        get: {
          tags: ["Events"],
          summary: "Bütün tədbirləri əldə et",
          parameters: [
            {
              in: "query",
              name: "status",
              required: false,
              schema: {
                type: "string",
                enum: ["upcoming", "past"],
              },
              description: "Tədbirləri statusa görə filter et",
            },
          ],
          responses: {
            "200": {
              description: "Tədbirlərin siyahısı",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Event",
                    },
                  },
                },
              },
            },
          },
        },

        post: {
          tags: ["Events"],
          summary: "Yeni tədbir yarat",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EventInput",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Tədbir uğurla yaradıldı",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Event",
                  },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "401": {
              description: "Authentication tələb olunur",
            },
          },
        },
      },

      "/events/{id}": {
        get: {
          tags: ["Events"],
          summary: "ID üzrə tədbiri əldə et",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Tədbirin ID-si",
            },
          ],
          responses: {
            "200": {
              description: "Tədbir",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Event",
                  },
                },
              },
            },
            "404": {
              description: "Tədbir tapılmadı",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },

        put: {
          tags: ["Events"],
          summary: "Tədbiri yenilə",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Tədbirin ID-si",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EventUpdateInput",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Tədbir uğurla yeniləndi",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Event",
                  },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
            "401": {
              description: "Authentication tələb olunur",
            },
            "404": {
              description: "Tədbir tapılmadı",
            },
          },
        },

        delete: {
          tags: ["Events"],
          summary: "Tədbiri sil",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
              description: "Tədbirin ID-si",
            },
          ],
          responses: {
            "204": {
              description: "Tədbir uğurla silindi",
            },
            "401": {
              description: "Authentication tələb olunur",
            },
            "404": {
              description: "Tədbir tapılmadı",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Error",
                  },
                },
              },
            },
          },
        },
      },
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
            id: {
              type: "string",
              example: "1",
            },
            title: {
              type: "string",
              example: "Qadın sahibkarlığı təlimi",
            },
            date: {
              type: "string",
              format: "date",
              example: "2026-09-15",
            },
            location: {
              type: "string",
              example: "Mingəçevir",
            },
            shortDesc: {
              type: "string",
              example: "Qadın sahibkarlar üçün praktiki təlim",
            },
            fullDesc: {
              type: "string",
              example: "Tədbir haqqında ətraflı məlumat.",
            },
            image: {
              type: "string",
              format: "uri",
              nullable: true,
              example: "https://example.com/event.jpg",
            },
            status: {
              type: "string",
              enum: ["upcoming", "past"],
              example: "upcoming",
            },
          },
        },
        EventInput: {
          type: "object",
          required: [
            "title",
            "date",
            "location",
            "shortDesc",
          ],
          properties: {
            title: {
              type: "string",
              minLength: 1,
              example: "Qadın sahibkarlığı təlimi",
            },

            date: {
              type: "string",
              format: "date",
              example: "2026-09-15",
            },

            location: {
              type: "string",
              minLength: 1,
              example: "Mingəçevir",
            },

            shortDesc: {
              type: "string",
              minLength: 1,
              example: "Qadın sahibkarlar üçün praktiki təlim",
            },

            fullDesc: {
              type: "string",
              default: "",
              example: "Tədbir haqqında ətraflı məlumat.",
            },

            image: {
              type: "string",
              format: "uri",
              example: "https://example.com/event.jpg",
            },

            status: {
              type: "string",
              enum: ["upcoming", "past"],
              default: "upcoming",
            },
          },
        },
        EventUpdateInput: {
          type: "object",
          properties: {
            title: {
              type: "string",
              minLength: 1,
              example: "Yenilənmiş tədbir adı",
            },

            date: {
              type: "string",
              format: "date",
              example: "2026-09-20",
            },

            location: {
              type: "string",
              minLength: 1,
              example: "Mingəçevir",
            },

            shortDesc: {
              type: "string",
              minLength: 1,
              example: "Yenilənmiş qısa təsvir",
            },

            fullDesc: {
              type: "string",
              example: "Yenilənmiş tam təsvir",
            },

            image: {
              type: "string",
              format: "uri",
              example: "https://example.com/event-new.jpg",
            },

            status: {
              type: "string",
              enum: ["upcoming", "past"],
            },
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
