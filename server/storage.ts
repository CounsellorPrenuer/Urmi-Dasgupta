import { 
  users, 
  contactSubmissions,
  testimonials,
  blogs,
  packages as packagesTable,
  paymentTracking,
  razorpayOrders,
  type User, 
  type InsertUser, 
  type ContactSubmission, 
  type InsertContactSubmission,
  type Testimonial,
  type InsertTestimonial,
  type Blog,
  type InsertBlog,
  type Package,
  type InsertPackage,
  type PaymentTracking,
  type InsertPaymentTracking,
  type RazorpayOrder,
  type InsertRazorpayOrder
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  getTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: string): Promise<Testimonial | undefined>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial>;
  deleteTestimonial(id: string): Promise<void>;
  
  createBlog(blog: InsertBlog): Promise<Blog>;
  getBlogs(): Promise<Blog[]>;
  getBlog(id: string): Promise<Blog | undefined>;
  updateBlog(id: string, blog: Partial<InsertBlog>): Promise<Blog>;
  deleteBlog(id: string): Promise<void>;
  
  createPackage(pkg: InsertPackage): Promise<Package>;
  getPackages(): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  updatePackage(id: string, pkg: Partial<InsertPackage>): Promise<Package>;
  deletePackage(id: string): Promise<void>;
  
  createPaymentTracking(payment: InsertPaymentTracking): Promise<PaymentTracking>;
  getPaymentTrackings(): Promise<PaymentTracking[]>;
  getPaymentTracking(id: string): Promise<PaymentTracking | undefined>;
  getPaymentTrackingByOrderId(razorpayOrderId: string): Promise<PaymentTracking | undefined>;
  updatePaymentTracking(id: string, payment: Partial<InsertPaymentTracking>): Promise<PaymentTracking>;
  updatePaymentTrackingStatus(razorpayOrderId: string, status: string): Promise<PaymentTracking>;
  deletePaymentTracking(id: string): Promise<void>;
  
  createRazorpayOrder(order: InsertRazorpayOrder): Promise<RazorpayOrder>;
  getRazorpayOrderByOrderId(razorpayOrderId: string): Promise<RazorpayOrder | undefined>;
  updateRazorpayOrderStatus(razorpayOrderId: string, status: string): Promise<RazorpayOrder>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(insertSubmission)
      .returning();
    return submission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }

  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<Testimonial> {
    const [testimonial] = await db
      .update(testimonials)
      .set(data)
      .where(eq(testimonials.id, id))
      .returning();
    return testimonial;
  }

  async deleteTestimonial(id: string): Promise<void> {
    await db.delete(testimonials).where(eq(testimonials.id, id));
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const [blog] = await db
      .insert(blogs)
      .values(insertBlog)
      .returning();
    return blog;
  }

  async getBlogs(): Promise<Blog[]> {
    return await db.select().from(blogs);
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog || undefined;
  }

  async updateBlog(id: string, data: Partial<InsertBlog>): Promise<Blog> {
    const [blog] = await db
      .update(blogs)
      .set(data)
      .where(eq(blogs.id, id))
      .returning();
    return blog;
  }

  async deleteBlog(id: string): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const [pkg] = await db
      .insert(packagesTable)
      .values(insertPackage)
      .returning();
    return pkg;
  }

  async getPackages(): Promise<Package[]> {
    return await db.select().from(packagesTable);
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, id));
    return pkg || undefined;
  }

  async updatePackage(id: string, data: Partial<InsertPackage>): Promise<Package> {
    const [pkg] = await db
      .update(packagesTable)
      .set(data)
      .where(eq(packagesTable.id, id))
      .returning();
    return pkg;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(packagesTable).where(eq(packagesTable.id, id));
  }

  async createPaymentTracking(insertPayment: InsertPaymentTracking): Promise<PaymentTracking> {
    const [payment] = await db
      .insert(paymentTracking)
      .values(insertPayment)
      .returning();
    return payment;
  }

  async getPaymentTrackings(): Promise<PaymentTracking[]> {
    return await db.select().from(paymentTracking);
  }

  async getPaymentTracking(id: string): Promise<PaymentTracking | undefined> {
    const [payment] = await db.select().from(paymentTracking).where(eq(paymentTracking.id, id));
    return payment || undefined;
  }

  async getPaymentTrackingByOrderId(razorpayOrderId: string): Promise<PaymentTracking | undefined> {
    const [payment] = await db.select().from(paymentTracking).where(eq(paymentTracking.razorpayOrderId, razorpayOrderId));
    return payment || undefined;
  }

  async updatePaymentTracking(id: string, data: Partial<InsertPaymentTracking>): Promise<PaymentTracking> {
    const [payment] = await db
      .update(paymentTracking)
      .set(data)
      .where(eq(paymentTracking.id, id))
      .returning();
    return payment;
  }

  async updatePaymentTrackingStatus(razorpayOrderId: string, status: string): Promise<PaymentTracking> {
    const [payment] = await db
      .update(paymentTracking)
      .set({ status })
      .where(eq(paymentTracking.razorpayOrderId, razorpayOrderId))
      .returning();
    return payment;
  }

  async deletePaymentTracking(id: string): Promise<void> {
    await db.delete(paymentTracking).where(eq(paymentTracking.id, id));
  }

  async createRazorpayOrder(insertOrder: InsertRazorpayOrder): Promise<RazorpayOrder> {
    const [order] = await db
      .insert(razorpayOrders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async getRazorpayOrderByOrderId(razorpayOrderId: string): Promise<RazorpayOrder | undefined> {
    const [order] = await db
      .select()
      .from(razorpayOrders)
      .where(eq(razorpayOrders.razorpayOrderId, razorpayOrderId));
    return order || undefined;
  }

  async updateRazorpayOrderStatus(razorpayOrderId: string, status: string): Promise<RazorpayOrder> {
    const [order] = await db
      .update(razorpayOrders)
      .set({ status })
      .where(eq(razorpayOrders.razorpayOrderId, razorpayOrderId))
      .returning();
    return order;
  }
}

export const storage = new DatabaseStorage();
