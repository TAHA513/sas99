import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertAppointmentSchema, insertStaffSchema, insertSettingSchema } from "@shared/schema";
import { notificationService } from './services/notification-service';

export async function registerRoutes(app: Express): Promise<Server> {
  // Customer routes
  app.get("/api/customers", async (_req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  app.post("/api/customers", async (req, res) => {
    const parsed = insertCustomerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const customer = await storage.createCustomer(parsed.data);
    res.status(201).json(customer);
  });

  app.patch("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const customer = await storage.updateCustomer(id, req.body);
    res.json(customer);
  });

  app.delete("/api/customers/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCustomer(id);
    res.sendStatus(204);
  });

  // Appointment routes
  app.get("/api/appointments", async (_req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post("/api/appointments", async (req, res) => {
    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const appointment = await storage.createAppointment(parsed.data);

    // Get customer and staff details for notifications
    const customer = await storage.getCustomer(appointment.customerId);
    const staffMember = await storage.getStaffMember(appointment.staffId);

    if (customer && staffMember) {
      // Send notifications asynchronously
      notificationService.handleAppointmentCreated(
        appointment,
        customer,
        staffMember
      ).catch(console.error);
    }

    res.status(201).json(appointment);
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const appointment = await storage.updateAppointment(id, req.body);

    // Get customer and staff details for notifications
    const customer = await storage.getCustomer(appointment.customerId);
    const staffMember = await storage.getStaffMember(appointment.staffId);

    if (customer && staffMember) {
      // Send notifications asynchronously
      notificationService.handleAppointmentUpdated(
        appointment,
        customer,
        staffMember
      ).catch(console.error);
    }

    res.json(appointment);
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteAppointment(id);
    res.sendStatus(204);
  });

  // Staff routes
  app.get("/api/staff", async (_req, res) => {
    const staff = await storage.getStaff();
    res.json(staff);
  });

  app.post("/api/staff", async (req, res) => {
    const parsed = insertStaffSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const staff = await storage.createStaff(parsed.data);
    res.status(201).json(staff);
  });

  app.patch("/api/staff/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const staff = await storage.updateStaff(id, req.body);
    res.json(staff);
  });

  app.delete("/api/staff/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteStaff(id);
    res.sendStatus(204);
  });

  // Settings routes
  app.get("/api/settings", async (_req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.post("/api/settings", async (req, res) => {
    const parsed = insertSettingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);

    const setting = await storage.setSetting(parsed.data.key, parsed.data.value);
    res.status(201).json(setting);
  });

  const httpServer = createServer(app);
  return httpServer;
}