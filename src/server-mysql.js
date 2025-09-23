import { createApp } from "./app.js";

import { ItemModel } from "./models/postgres/item.js";
import { AuthModel } from "./models/postgres/auth.js";
import { SaleModel } from "./models/postgres/sale.js";

createApp({ itemModel: ItemModel, authModel: AuthModel, saleModel: SaleModel });