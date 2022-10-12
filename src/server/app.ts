/* eslint-disable no-undef -- process is defined, it's server-side code */
import express from "express";

class Application {
	public app: express.Application;
	public port: number;

	constructor() {
		this.app = express();
		this.port =
			process.env?.serverPort === undefined
				? 3000
				: Number(process.env.serverPort);
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.json());
	}

	public start(): void {
		this.app.listen(this.port, () => {
			console.log(`Server listening on port ${this.port} !`);
		});
	}
}

new Application().start();
