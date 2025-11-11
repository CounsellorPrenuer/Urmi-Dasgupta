import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import bcrypt from "bcrypt";
import { 
  insertContactSubmissionSchema,
  insertTestimonialSchema,
  insertBlogSchema,
  insertPackageSchema,
  insertPaymentTrackingSchema,
  insertMentoriaPackageSchema
} from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const PgSession = connectPgSimple(session);

declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ success: false, message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const sessionSecret = process.env.SESSION_SECRET;
  
  if (!sessionSecret) {
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment) {
      console.warn("⚠️  WARNING: SESSION_SECRET is not set. Using development-only fallback.");
      console.warn("⚠️  Set SESSION_SECRET environment variable for production!");
    } else {
      throw new Error("SESSION_SECRET environment variable must be set in production!");
    }
  }
  
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: sessionSecret || "dev-only-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      },
    })
  );

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.session.userId) {
      res.json({ 
        success: true, 
        user: { id: req.session.userId, username: req.session.username }
      });
    } else {
      res.status(401).json({ success: false, message: "Not authenticated" });
    }
  });

  // Object storage routes for image uploads
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/blog-images", isAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.session.userId!;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      // Ensure the objectPath is normalized with /objects/ prefix
      const normalizedPath = objectPath.startsWith('/objects/') 
        ? objectPath 
        : `/objects${objectPath.startsWith('/') ? '' : '/'}${objectPath}`;

      res.status(200).json({
        objectPath: normalizedPath,
      });
    } catch (error) {
      console.error("Error setting blog image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      res.json({ 
        success: true, 
        message: "Contact form submitted successfully",
        id: submission.id 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid form data" 
      });
    }
  });

  app.get("/api/contact", isAuthenticated, async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error fetching submissions" 
      });
    }
  });

  app.post("/api/testimonials", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.json({ success: true, data: testimonial });
    } catch (error) {
      console.error("Create testimonial error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ success: false, message: "Error fetching testimonials" });
    }
  });

  app.get("/api/testimonials/:id", async (req, res) => {
    try {
      const testimonial = await storage.getTestimonial(req.params.id);
      if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      console.error("Error fetching testimonial:", error);
      res.status(500).json({ success: false, message: "Error fetching testimonial" });
    }
  });

  app.put("/api/testimonials/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.updateTestimonial(req.params.id, validatedData);
      res.json({ success: true, data: testimonial });
    } catch (error) {
      console.error("Update testimonial error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.delete("/api/testimonials/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteTestimonial(req.params.id);
      res.json({ success: true, message: "Testimonial deleted" });
    } catch (error) {
      console.error("Delete testimonial error:", error);
      res.status(500).json({ success: false, message: "Error deleting testimonial" });
    }
  });

  app.post("/api/blogs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlogSchema.parse(req.body);
      const blog = await storage.createBlog(validatedData);
      res.json({ success: true, data: blog });
    } catch (error) {
      console.error("Create blog error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  // Helper function to normalize blog image URLs
  function normalizeBlogImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) return null;
    
    // If it already starts with /objects/, return as is
    if (imageUrl.startsWith('/objects/')) {
      return imageUrl;
    }
    
    // If it's a raw bucket path (e.g., /repl-default-bucket-xxx/...)
    // or any other format, prepend /objects/
    if (imageUrl.startsWith('/')) {
      return `/objects${imageUrl}`;
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Otherwise prepend /objects/
    return `/objects/${imageUrl}`;
  }

  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getBlogs();
      // Normalize image URLs before returning
      const normalizedBlogs = blogs.map(blog => ({
        ...blog,
        imageUrl: normalizeBlogImageUrl(blog.imageUrl)
      }));
      res.json(normalizedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ success: false, message: "Error fetching blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      // Normalize image URL before returning
      const normalizedBlog = {
        ...blog,
        imageUrl: normalizeBlogImageUrl(blog.imageUrl)
      };
      res.json(normalizedBlog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ success: false, message: "Error fetching blog" });
    }
  });

  app.put("/api/blogs/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBlogSchema.parse(req.body);
      const blog = await storage.updateBlog(req.params.id, validatedData);
      res.json({ success: true, data: blog });
    } catch (error) {
      console.error("Update blog error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.delete("/api/blogs/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteBlog(req.params.id);
      res.json({ success: true, message: "Blog deleted" });
    } catch (error) {
      console.error("Delete blog error:", error);
      res.status(500).json({ success: false, message: "Error deleting blog" });
    }
  });

  app.post("/api/packages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const pkg = await storage.createPackage(validatedData);
      res.json({ success: true, data: pkg });
    } catch (error) {
      console.error("Create package error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ success: false, message: "Error fetching packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.getPackage(req.params.id);
      if (!pkg) {
        return res.status(404).json({ success: false, message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ success: false, message: "Error fetching package" });
    }
  });

  app.put("/api/packages/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const pkg = await storage.updatePackage(req.params.id, validatedData);
      res.json({ success: true, data: pkg });
    } catch (error) {
      console.error("Update package error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.delete("/api/packages/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePackage(req.params.id);
      res.json({ success: true, message: "Package deleted" });
    } catch (error) {
      console.error("Delete package error:", error);
      res.status(500).json({ success: false, message: "Error deleting package" });
    }
  });

  // Mentoria Packages Routes
  app.post("/api/mentoria-packages", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMentoriaPackageSchema.parse(req.body);
      const pkg = await storage.createMentoriaPackage(validatedData);
      res.json({ success: true, data: pkg });
    } catch (error) {
      console.error("Create mentoria package error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.get("/api/mentoria-packages", async (req, res) => {
    try {
      const packages = await storage.getMentoriaPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching mentoria packages:", error);
      res.status(500).json({ success: false, message: "Error fetching mentoria packages" });
    }
  });

  app.get("/api/mentoria-packages/active", async (req, res) => {
    try {
      const packages = await storage.getActiveMentoriaPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching active mentoria packages:", error);
      res.status(500).json({ success: false, message: "Error fetching mentoria packages" });
    }
  });

  app.get("/api/mentoria-packages/:id", async (req, res) => {
    try {
      const pkg = await storage.getMentoriaPackage(req.params.id);
      if (!pkg) {
        return res.status(404).json({ success: false, message: "Mentoria package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching mentoria package:", error);
      res.status(500).json({ success: false, message: "Error fetching mentoria package" });
    }
  });

  app.put("/api/mentoria-packages/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMentoriaPackageSchema.parse(req.body);
      const pkg = await storage.updateMentoriaPackage(req.params.id, validatedData);
      res.json({ success: true, data: pkg });
    } catch (error) {
      console.error("Update mentoria package error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.delete("/api/mentoria-packages/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteMentoriaPackage(req.params.id);
      res.json({ success: true, message: "Mentoria package deleted" });
    } catch (error) {
      console.error("Delete mentoria package error:", error);
      res.status(500).json({ success: false, message: "Error deleting mentoria package" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentTrackingSchema.parse(req.body);
      const payment = await storage.createPaymentTracking(validatedData);
      res.json({ success: true, data: payment });
    } catch (error) {
      console.error("Create payment tracking error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.get("/api/payments", isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPaymentTrackings();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ success: false, message: "Error fetching payments" });
    }
  });

  app.get("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      const payment = await storage.getPaymentTracking(req.params.id);
      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ success: false, message: "Error fetching payment" });
    }
  });

  app.put("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPaymentTrackingSchema.parse(req.body);
      const payment = await storage.updatePaymentTracking(req.params.id, validatedData);
      res.json({ success: true, data: payment });
    } catch (error) {
      console.error("Update payment error:", error);
      res.status(400).json({ success: false, message: "Invalid data" });
    }
  });

  app.delete("/api/payments/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePaymentTracking(req.params.id);
      res.json({ success: true, message: "Payment deleted" });
    } catch (error) {
      console.error("Delete payment error:", error);
      res.status(500).json({ success: false, message: "Error deleting payment" });
    }
  });

  // Mentoria Package Razorpay Payment Routes
  app.post("/api/mentoria-payment/create-order", async (req, res) => {
    try {
      const { packageId, customerName, customerEmail, customerPhone } = req.body;
      
      if (!packageId || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      const pkg = await storage.getMentoriaPackage(packageId);
      if (!pkg) {
        return res.status(404).json({ 
          success: false, 
          message: "Package not found" 
        });
      }

      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const options = {
        amount: pkg.price * 100,
        currency: "INR",
        receipt: `M${Date.now().toString().slice(-10)}${Math.random().toString(36).slice(-6)}`,
        notes: {
          packageId: pkg.id,
          packageName: pkg.name,
          category: pkg.category,
          customerName,
          customerEmail,
          customerPhone,
        },
      };

      const order = await razorpay.orders.create(options);

      await storage.createRazorpayOrder({
        razorpayOrderId: order.id,
        packageId: pkg.id,
        packageName: pkg.name,
        amount: pkg.price,
        customerName,
        customerEmail,
        customerPhone,
        status: "created",
      });

      res.json({ 
        success: true, 
        orderId: order.id,
        amount: pkg.price,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      console.error("Create Razorpay order error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error creating payment order" 
      });
    }
  });

  app.post("/api/mentoria-payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing payment verification details" 
        });
      }

      const storedOrder = await storage.getRazorpayOrderByOrderId(razorpay_order_id);
      if (!storedOrder) {
        return res.status(404).json({ 
          success: false, 
          message: "Order not found" 
        });
      }

      const crypto = await import('crypto');
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest === razorpay_signature) {
        await storage.updateRazorpayOrderStatus(razorpay_order_id, "paid");
        
        await storage.createPaymentTracking({
          razorpayOrderId: razorpay_order_id,
          name: storedOrder.customerName,
          email: storedOrder.customerEmail,
          phone: storedOrder.customerPhone,
          packageId: storedOrder.packageId,
          packageName: storedOrder.packageName,
          status: "success",
        });

        res.json({ 
          success: true, 
          message: "Payment verified successfully",
          paymentId: razorpay_payment_id 
        });
      } else {
        await storage.updateRazorpayOrderStatus(razorpay_order_id, "failed");
        
        res.status(400).json({ 
          success: false, 
          message: "Payment verification failed" 
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error verifying payment" 
      });
    }
  });

  // Deprecated Razorpay routes for regular packages - now using UPI payment system
  app.post("/api/payment/create-order", (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "Razorpay payment gateway deprecated for regular packages. Please use UPI payment system." 
    });
  });

  app.post("/api/payment/verify", (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "Razorpay payment gateway deprecated for regular packages. Please use UPI payment system." 
    });
  });

  app.post("/api/payment/cancel", (req, res) => {
    res.status(410).json({ 
      success: false, 
      message: "Razorpay payment gateway deprecated for regular packages. Please use UPI payment system." 
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
