import { KiwiClient } from "./client";
import { env } from "./env";

import { dataSource } from "./data/datasource";

const client = new KiwiClient();
dataSource.initialize();
client.login(env.CLIENT_TOKEN);
