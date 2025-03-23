import { createApp } from "./app.js";

import { ItemModel } from "./models/mysql/item.js";
import { AuthModel } from "./models/mysql/auth.js";
import { SaleModel } from "./models/mysql/sale.js";

createApp({ itemModel: ItemModel, authModel: AuthModel, saleModel: SaleModel });