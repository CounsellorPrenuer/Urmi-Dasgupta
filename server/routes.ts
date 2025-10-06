import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import bcrypt from "bcrypt";
import Razorpay from "razorpay";
import crypto from "crypto";
import { 
  insertContactSubmissionSchema,
  insertTestimonialSchema,
  insertBlogSchema,
  insertPackageSchema,
  insertPaymentTrackingSchema
} from "@shared/schema";

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

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("⚠️  ERROR: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set!");
    throw new Error("Razorpay credentials are required");
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

  app.get("/api/blogs", async (req, res) => {
    try {
      const blogs = await storage.getBlogs();
      res.json(blogs);
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
      res.json(blog);
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

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { packageId, customerInfo } = req.body;

      if (!packageId || !customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
        return res.status(400).json({ 
          success: false, 
          message: "Missing required fields" 
        });
      }

      const pkg = await storage.getPackage(packageId);
      
      if (!pkg) {
        return res.status(404).json({
          success: false,
          message: "Package not found"
        });
      }

      const options = {
        amount: pkg.price * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          packageId: pkg.id,
          packageName: pkg.name,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
        }
      };

      const order = await razorpay.orders.create(options);

      await storage.createRazorpayOrder({
        razorpayOrderId: order.id,
        packageId: pkg.id,
        packageName: pkg.name,
        amount: pkg.price,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        status: "created",
      });

      await storage.createPaymentTracking({
        razorpayOrderId: order.id,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        packageId: pkg.id,
        packageName: pkg.name,
        status: "pending",
      });

      res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error creating payment order" 
      });
    }
  });

  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields for verification",
        });
      }

      const storedOrder = await storage.getRazorpayOrderByOrderId(razorpay_order_id);
      
      if (!storedOrder) {
        console.error("Payment verification failed: Order not found", { razorpay_order_id, razorpay_payment_id });
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      const pkg = await storage.getPackage(storedOrder.packageId);
      
      if (!pkg) {
        console.error("Payment verification failed: Package not found", { packageId: storedOrder.packageId, razorpay_payment_id });
        return res.status(404).json({
          success: false,
          message: "Package not found",
        });
      }

      if (pkg.price !== storedOrder.amount) {
        console.error("Payment verification failed: Price mismatch", {
          expectedAmount: pkg.price,
          storedAmount: storedOrder.amount,
          packageId: pkg.id,
          razorpay_order_id,
        });
        await storage.updateRazorpayOrderStatus(razorpay_order_id, "failed_price_mismatch");
        return res.status(400).json({
          success: false,
          message: "Price mismatch detected",
        });
      }

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(sign)
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        await storage.updatePaymentTrackingStatus(razorpay_order_id, "completed");
        await storage.updateRazorpayOrderStatus(razorpay_order_id, "completed");

        console.log("Payment verified successfully:", {
          packageName: pkg.name,
          customerEmail: storedOrder.customerEmail,
          razorpay_payment_id,
          amount: pkg.price,
        });

        res.json({
          success: true,
          message: "Payment verified successfully",
        });
      } else {
        console.error("Payment verification failed: Invalid signature", {
          razorpay_order_id,
          razorpay_payment_id,
          packageId: pkg.id,
        });

        await storage.updatePaymentTrackingStatus(razorpay_order_id, "failed");
        await storage.updateRazorpayOrderStatus(razorpay_order_id, "failed_invalid_signature");

        res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Payment verification error" 
      });
    }
  });

  app.post("/api/payment/cancel", async (req, res) => {
    try {
      const { razorpay_order_id } = req.body;

      if (!razorpay_order_id) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
        });
      }

      await storage.updatePaymentTrackingStatus(razorpay_order_id, "cancelled");
      await storage.updateRazorpayOrderStatus(razorpay_order_id, "cancelled");

      console.log("Payment cancelled:", { razorpay_order_id });

      res.json({
        success: true,
        message: "Payment cancelled",
      });
    } catch (error) {
      console.error("Payment cancellation error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error cancelling payment" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
