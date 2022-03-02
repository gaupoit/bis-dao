import sdk from "./1-initialize-sdk.js";

const app = sdk.getAppModule(process.env.APP_ADDRESS);

(async () => {
  try {
    const tokenModule = await app.deployTokenModule({
      name: "BIS Governance Token",
      symbol: "BIS",
    });
    console.log(
      "Successfully to deploy token module, address:",
      tokenModule.address
    );
  } catch (error) {
    console.error("Failed to deploy token module", error);
  }
})();
