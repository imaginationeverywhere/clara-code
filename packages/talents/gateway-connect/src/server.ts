import { createGatewayConnectApp } from "./create-app";

async function main() {
	const { app, server } = await createGatewayConnectApp();
	const port = Number.parseInt(process.env.PORT ?? "4001", 10);
	const httpServer = app.listen(port, () => {
		console.log(`gateway-connect Talent running at http://localhost:${port}/graphql`);
	});

	const shutdown = async () => {
		httpServer.close();
		await server.stop();
		process.exit(0);
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

main().catch(console.error);
