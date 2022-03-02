import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const app = sdk.getAppModule(process.env.APP_ADDRESS);

(async () => {
  try {
    const bundleDropModule = await app.deployBundleDropModule({
      name: "bisDAO Membership",
      description: "A DAO for Biodiversity Information System Council",
      image: readFileSync("scripts/assets/membership.png"),
      // We do not charge the drop.
      primarySaleRecipientAddress: ethers.constants.AddressZero,
    });

    console.log(
      "✅  Successfully deployed bundleDrop module, address:",
      bundleDropModule.address
    );

    console.log(
      "✅  bundleDrop metadata:",
      await bundleDropModule.getMetadata()
    );
  } catch (error) {
    console.log(error);
  }
})();
