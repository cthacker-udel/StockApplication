import express, { Router } from "express";
import { Controller } from "./controller";

export class ApiRouter {
  private router: Router = Router();
  private controller: Controller = new Controller();

  public getRouter(): Router {
    return this.router;
  }
}
