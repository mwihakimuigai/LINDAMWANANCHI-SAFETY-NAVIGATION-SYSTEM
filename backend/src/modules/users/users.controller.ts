import type { Request, Response } from "express";
import { usersService } from "./users.service.js";

export const usersController = {
  async me(req: Request, res: Response) {
    const user = await usersService.getById(req.auth!.userId);
    res.status(200).json(user);
  },

  async list(_req: Request, res: Response) {
    const users = await usersService.listUsers();
    res.status(200).json(users);
  },

  async updateMe(req: Request, res: Response) {
    const user = await usersService.updateProfile(req.auth!.userId, req.body);
    res.status(200).json(user);
  },

  async updateRole(req: Request, res: Response) {
    const user = await usersService.updateRole(req.params.id, req.body.role, req.auth!.userId);
    res.status(200).json(user);
  },

  async remove(req: Request, res: Response) {
    const result = await usersService.deleteUser(req.params.id, req.auth!.userId);
    res.status(200).json(result);
  },
};
