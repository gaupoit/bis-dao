import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(process.env.BUNDLE_DROP);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "BIS Membership",
        description: "This NFT will give you access to BIS Council!",
        image: readFileSync("scripts/assets/bachtuyet.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("Failed to create the new NFT", error);
  }
})();
